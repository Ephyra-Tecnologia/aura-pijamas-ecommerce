import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { enviarEmailAtualizacaoStatus } from '@/lib/email'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Usuário não logado só pode ver o status (para o polling do checkout)
  if (!session) return NextResponse.json({ status: order.status })

  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const { status, trackingCode } = await req.json()
  const order = await prisma.order.update({
    where: { id },
    data: { status },
  })

  // Envia e-mail de atualização para o cliente (só para status relevantes)
  const notifyStatuses = ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  if (notifyStatuses.includes(status)) {
    enviarEmailAtualizacaoStatus({ ...order, trackingCode: trackingCode ?? null }).catch(console.error)
  }

  return NextResponse.json(order)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.orderItem.deleteMany({ where: { orderId: id } })
  await prisma.order.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}