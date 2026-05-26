import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarEmailConfirmacaoPedido } from '@/lib/email'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  console.log('PAGARME WEBHOOK:', event.type, JSON.stringify(event?.data?.id))

  try {
    const type = event.type ?? ''
    // order.paid → event.data.id é o order ID
    // charge.paid → event.data.id é o charge ID; o order ID fica em event.data.order.id
    const orderId = type === 'charge.paid'
      ? (event.data?.order?.id ?? event.data?.id)
      : event.data?.id

    // ── Pedido pago (Pix confirmado) ─────────────────────────────────────────
    if (type === 'order.paid' || type === 'charge.paid') {
      await prisma.order.updateMany({
        where: { pagarmeId: orderId },
        data: { status: 'PAID' },
      })
      // Envia email de confirmação ao cliente
      const order = await prisma.order.findFirst({
        where: { pagarmeId: orderId },
        include: { items: { include: { product: true } } },
      })
      if (order) {
        enviarEmailConfirmacaoPedido(order).catch(console.error)
      }
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
