import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { name, email } = await req.json()
  if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { name, active: true },
    create: { name, email },
  })

  return NextResponse.json({ ok: true })
}
