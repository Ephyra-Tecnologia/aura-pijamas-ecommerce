import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type === 'order.paid') {
      const pagarmeId = data.id
      await prisma.order.updateMany({
        where: { pagarmeId },
        data: { status: 'PAID' }
      })
    }

    if (type === 'order.canceled') {
      const pagarmeId = data.id
      await prisma.order.updateMany({
        where: { pagarmeId },
        data: { status: 'CANCELLED' }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 })
  }
}