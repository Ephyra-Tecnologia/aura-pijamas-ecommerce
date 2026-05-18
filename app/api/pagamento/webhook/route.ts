import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET não configurado')
    return NextResponse.json({ error: 'Webhook não configurado' }, { status: 500 })
  }

  let event: any
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
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
        // fallback: busca pelo pagarmeId
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
