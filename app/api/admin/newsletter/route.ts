import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY não configurada')
  return new Resend(process.env.RESEND_API_KEY)
}

// segment: 'all' | 'buyers' | 'newsletter_only'
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { subject, html, segment = 'all', recipientIds } = await req.json()
  if (!subject || !html) return NextResponse.json({ error: 'Assunto e conteúdo obrigatórios' }, { status: 400 })

  let recipients: { email: string; name: string | null }[] = []

  if (recipientIds?.length) {
    // IDs específicos selecionados na página de clientes
    const buyerIds = (recipientIds as string[]).filter((id: string) => id.startsWith('buyer_'))
    const subIds   = (recipientIds as string[]).filter((id: string) => !id.startsWith('buyer_'))

    if (subIds.length) {
      const subs = await prisma.newsletterSubscriber.findMany({ where: { id: { in: subIds }, active: true } })
      recipients.push(...subs.map(s => ({ email: s.email, name: s.name })))
    }
    if (buyerIds.length) {
      const emails = buyerIds.map((id: string) => id.replace('buyer_', ''))
      const orders = await prisma.order.findMany({
        where: { email: { in: emails }, status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
        select: { email: true, name: true },
        distinct: ['email'],
      })
      recipients.push(...orders.map(o => ({ email: o.email, name: o.name })))
    }
  } else if (segment === 'buyers') {
    // Só quem já comprou
    const orders = await prisma.order.findMany({
      where: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
      select: { email: true, name: true },
      distinct: ['email'],
    })
    recipients = orders.map(o => ({ email: o.email, name: o.name }))
  } else if (segment === 'newsletter_only') {
    // Só inscritos que NUNCA compraram
    const subs = await prisma.newsletterSubscriber.findMany({ where: { active: true } })
    const buyerEmails = await prisma.order.findMany({
      where: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
      select: { email: true },
      distinct: ['email'],
    })
    const buyerSet = new Set(buyerEmails.map(b => b.email.toLowerCase()))
    recipients = subs
      .filter(s => !buyerSet.has(s.email.toLowerCase()))
      .map(s => ({ email: s.email, name: s.name }))
  } else {
    // Todos: inscritos ativos + compradores (union sem duplicatas)
    const subs = await prisma.newsletterSubscriber.findMany({ where: { active: true } })
    const orders = await prisma.order.findMany({
      where: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
      select: { email: true, name: true },
      distinct: ['email'],
    })
    const seen = new Set<string>()
    for (const s of subs) {
      if (!seen.has(s.email.toLowerCase())) { seen.add(s.email.toLowerCase()); recipients.push({ email: s.email, name: s.name }) }
    }
    for (const o of orders) {
      if (!seen.has(o.email.toLowerCase())) { seen.add(o.email.toLowerCase()); recipients.push({ email: o.email, name: o.name }) }
    }
  }

  if (!recipients.length) return NextResponse.json({ error: 'Nenhum destinatário encontrado para este segmento' }, { status: 400 })

  const resend = getResend()
  let sent = 0, failed = 0
  const emails = recipients.map(r => ({
    from: 'Aura Pijamas <noreply@aurapijamas.com.br>',
    to: r.email,
    subject,
    html,
  }))

  for (let i = 0; i < emails.length; i += 100) {
    try {
      await resend.batch.send(emails.slice(i, i + 100))
      sent += Math.min(100, emails.length - i)
    } catch (err) {
      console.error('Erro ao enviar lote:', err)
      failed += Math.min(100, emails.length - i)
    }
  }

  return NextResponse.json({ sent, failed, total: recipients.length })
}
