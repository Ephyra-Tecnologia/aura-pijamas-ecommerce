import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHmac } from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // Verifica assinatura do webhook (se configurada)
  const webhookSecret = process.env.PAGARME_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = req.headers.get('x-hub-signature') ?? ''
    const expected = 'sha1=' + createHmac('sha1', webhookSecret).update(rawBody).digest('hex')
    if (signature !== expected) {
      console.error('Pagar.me webhook: assinatura inválida')
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  console.log('PAGARME WEBHOOK:', event.type, JSON.stringify(event?.data?.id))

  try {
    const type = event.type ?? ''
    const orderId = event.data?.id // ID do pedido no Pagar.me

    // ── Pedido pago (Pix confirmado) ─────────────────────────────────────────
    if (type === 'order.paid' || type === 'charge.paid') {
      await prisma.order.updateMany({
        where: { pagarmeId: orderId },
        data: { status: 'PAID' },
      })
      console.log('Pagar.me: pedido PAGO:', orderId)
    }

    // ── Pedido cancelado / falhou ─────────────────────────────────────────────
    if (type === 'order.canceled' || type === 'charge.payment_failed') {
      await prisma.order.updateMany({
        where: { pagarmeId: orderId },
        data: { status: 'CANCELLED' },
      })
      console.log('Pagar.me: pedido CANCELADO:', orderId)
    }
  } catch (err) {
    console.error('Erro ao processar webhook Pagar.me:', err)
  }

  return NextResponse.json({ received: true })
}
