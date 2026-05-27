import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarEmailBoasVindasNewsletter } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { name, email } = await req.json()
  if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })

  // Verifica se já existe antes de fazer upsert
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { name, active: true },
    create: { name, email },
  })

  // Envia e-mail de boas-vindas só no primeiro cadastro
  if (!existing) {
    enviarEmailBoasVindasNewsletter(name, email).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
