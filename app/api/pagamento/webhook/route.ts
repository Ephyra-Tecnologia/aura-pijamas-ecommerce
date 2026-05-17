import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buscarPagamento } from '@/lib/mercadopago'
import { createHmac } from 'crypto'

function validarAssinatura(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true

  const xSignature = req.headers.get('x-signature') ?? ''
  const xRequestId = req.headers.get('x-request-id') ?? ''
  const dataId = new URL(req.url).searchParams.get('data.id') ?? ''

  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hash = createHmac('sha256', secret).update(template).digest('hex')

  return hash === v1
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    if (!validarAssinatura(req, rawBody)) {
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    console.log('MP WEBHOOK:', JSON.stringify(body, null, 2))

    const { type, action, data } = body

    if ((action === 'payment.updated' || type === 'payment') && data?.id) {
      const payment = await buscarPagamento(String(data.id))
      console.log('MP PAYMENT STATUS:', payment.status, payment.id)

      const whereClause = payment.external_reference
        ? { OR: [{ pagarmeId: String(data.id) }, { id: payment.external_reference }] }
        : { pagarmeId: String(data.id) }

      if (payment.status === 'approved') {
        await prisma.order.updateMany({
          where: whereClause,
          data: { status: 'PAID', pagarmeId: String(data.id) }
        })
      } else if (payment.status === 'cancelled' || payment.status === 'refunded') {
        await prisma.order.updateMany({
          where: whereClause,
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
