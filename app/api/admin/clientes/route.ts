import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Busca inscritos na newsletter
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Busca todos os e-mails que já compraram (pedidos PAID, PREPARING, SHIPPED, DELIVERED)
  const buyers = await prisma.order.findMany({
    where: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
    select: { email: true, name: true, createdAt: true },
    distinct: ['email'],
    orderBy: { createdAt: 'desc' },
  })

  const buyerEmails = new Set(buyers.map(b => b.email.toLowerCase()))

  // Enriquece inscritos com flag de comprador
  const enrichedSubscribers = subscribers.map(s => ({
    ...s,
    hasPurchased: buyerEmails.has(s.email.toLowerCase()),
    source: 'newsletter' as const,
  }))

  // Compradores que NÃO estão na newsletter
  const subscriberEmails = new Set(subscribers.map(s => s.email.toLowerCase()))
  const buyersOnly = buyers
    .filter(b => !subscriberEmails.has(b.email.toLowerCase()))
    .map(b => ({
      id: `buyer_${b.email}`,
      name: b.name,
      email: b.email,
      active: true,
      createdAt: b.createdAt.toISOString(),
      hasPurchased: true,
      source: 'buyer' as const,
    }))

  return NextResponse.json([...enrichedSubscribers, ...buyersOnly])
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await req.json()
  // Só remove inscritos da newsletter (compradores não têm registro para deletar)
  if (!id.startsWith('buyer_')) {
    await prisma.newsletterSubscriber.delete({ where: { id } })
  }
  return NextResponse.json({ ok: true })
}
