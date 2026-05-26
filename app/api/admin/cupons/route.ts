import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(coupons)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { code, discountType, discount, maxUses, firstOrderOnly, expiresAt, active } = body

  if (!code || !discountType || discount === undefined) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
  }

  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (existing) {
    return NextResponse.json({ error: 'Código já existe.' }, { status: 409 })
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase().trim(),
      discountType,
      discount: parseFloat(discount),
      maxUses: maxUses ? parseInt(maxUses) : null,
      firstOrderOnly: !!firstOrderOnly,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: active !== false,
    },
  })

  return NextResponse.json(coupon, { status: 201 })
}
