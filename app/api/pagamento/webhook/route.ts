import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { enviarEmailConfirmacaoPedido } from '@/lib/email'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // ── Detecta se é evento do Pagar.me (não tem header stripe-signature) ────
  const isStripe = !!req.headers.get('stripe-signature')
  if (!isStripe) {
    let pagarmeEvent: any
    try { pagarmeEvent = JSON.parse(rawBody) } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
    }
    const type = pagarmeEvent?.type ?? ''
    const pagarmeOrderId = type === 'charge.paid'
      ? (pagarmeEvent?.data?.order?.id ?? pagarmeEvent?.data?.id)
      : pagarmeEvent?.data?.id

    console.log('PAGARME WEBHOOK:', type, pagarmeOrderId)

    try {
      if (type === 'order.paid' || type === 'charge.paid') {
        await prisma.order.updateMany({ where: { pagarmeId: pagarmeOrderId }, data: { status: 'PAID' } })
        const order = await prisma.order.findFirst({
          where: { pagarmeId: pagarmeOrderId },
          include: { items: { include: { product: true } } },
        })
        if (order) enviarEmailConfirmacaoPedido(order).catch(console.error)
      }
      if (type === 'order.canceled' || type === 'charge.payment_failed') {
        await prisma.order.updateMany({ where: { pagarmeId: pagarmeOrderId }, data: { status: 'CANCELLED' } })
      }
    } catch (err) {
      console.error('Erro ao processar webhook Pagar.me:', err)
    }
    return NextResponse.json({ received: true })
  }

  // ── Stripe ────────────────────────────────────────────────────────────────
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET não configurado')
    return NextResponse.json({ error: 'Webhook não configurado' }, { status: 500 })
  }

  let event: any
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook assinatura inválida:', err.message)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  console.log('STRIPE WEBHOOK:', event.type)

  try {
    // ── Cartão: sessão de checkout concluída ──────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.orderId
      if (orderId && session.payment_status === 'paid') {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        })
        console.log('Pedido PAGO (checkout):', orderId)
      }
    }

    // ── Pix: payment intent aprovado ─────────────────────────────────────
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object
      const orderId = intent.metadata?.orderId
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        })
      } else {
        await prisma.order.updateMany({
          where: { pagarmeId: intent.id },
          data: { status: 'PAID' },
        })
      }
      console.log('Pedido PAGO (pix):', intent.id)
    }

    // ── Pagamento falhou / cancelado ──────────────────────────────────────
    if (
      event.type === 'payment_intent.payment_failed' ||
      event.type === 'checkout.session.expired'
    ) {
      const obj = event.data.object
      const orderId = obj.metadata?.orderId
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        })
      } else {
        await prisma.order.updateMany({
          where: { pagarmeId: obj.id },
          data: { status: 'CANCELLED' },
        })
      }
    }
  } catch (err) {
    console.error('Erro ao processar webhook Stripe:', err)
  }

  return NextResponse.json({ received: true })
}
