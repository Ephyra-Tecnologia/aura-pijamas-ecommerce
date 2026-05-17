import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buscarPagamento } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('MP WEBHOOK:', JSON.stringify(body, null, 2))

    const { type, action, data } = body

    // Mercado Pago envia action "payment.updated" ou type "payment"
    if ((action === 'payment.updated' || type === 'payment') && data?.id) {
      const payment = await buscarPagamento(String(data.id))
      console.log('MP PAYMENT STATUS:', payment.status, payment.id)

      if (payment.status === 'approved') {
        await prisma.order.updateMany({
          where: { pagarmeId: String(data.id) },
          data: { status: 'PAID' }
        })
      } else if (payment.status === 'cancelled' || payment.status === 'refunded') {
        await prisma.order.updateMany({
          where: { pagarmeId: String(data.id) },
          data: { status: 'CANCELLED' }
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro no webhook MP:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
