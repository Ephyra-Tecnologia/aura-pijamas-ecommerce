import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('WEBHOOK PAGARME:', JSON.stringify(body, null, 2))

    const { type, data } = body

    if (type === 'order.paid' || type === 'charge.paid') {
      const pagarmeId = data.order?.id || data.id
      if (pagarmeId) {
        await prisma.order.updateMany({
          where: { pagarmeId },
          data: { status: 'PAID' }
        })
        console.log('Pedido marcado como PAGO:', pagarmeId)
      }
    }

    if (type === 'order.canceled') {
      const pagarmeId = data.id
      if (pagarmeId) {
        await prisma.order.updateMany({
          where: { pagarmeId },
          data: { status: 'CANCELLED' }
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}