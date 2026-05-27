import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY não configurada')
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { subject, html, recipientIds } = await req.json()
  if (!subject || !html) return NextResponse.json({ error: 'Assunto e conteúdo obrigatórios' }, { status: 400 })

  const where = recipientIds?.length
    ? { id: { in: recipientIds }, active: true }
    : { active: true }

  const subscribers = await prisma.newsletterSubscriber.findMany({ where })
  if (!subscribers.length) return NextResponse.json({ error: 'Nenhum inscrito ativo' }, { status: 400 })

  const resend = getResend()
  let sent = 0
  let failed = 0

  // Resend free tier: 1 email por vez para múltiplos destinatários via batch
  const emails = subscribers.map(s => ({
    from: 'Aura Pijamas <noreply@aurapijamas.com.br>',
    to: s.email,
    subject,
    html,
  }))

  // Envia em lotes de 100 (limite do Resend batch)
  for (let i = 0; i < emails.length; i += 100) {
    const batch = emails.slice(i, i + 100)
    try {
      await resend.batch.send(batch)
      sent += batch.length
    } catch (err) {
      console.error('Erro ao enviar lote:', err)
      failed += batch.length
    }
  }

  return NextResponse.json({ sent, failed, total: subscribers.length })
}
