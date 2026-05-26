import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const cpf = req.nextUrl.searchParams.get('cpf') ?? ''
  const total = parseFloat(req.nextUrl.searchParams.get('total') ?? '0')

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: 'Cupom inválido ou inativo.' }, { status: 404 })
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Cupom expirado.' }, { status: 400 })
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: 'Cupom esgotado.' }, { status: 400 })
  }

  if (coupon.firstOrderOnly && cpf) {
    const cleanCpf = cpf.replace(/\D/g, '')
    const existing = await prisma.order.findFirst({
      where: {
        cpf: cleanCpf,
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'Cupom válido apenas para a primeira compra.' }, { status: 400 })
    }
  }

  const discountValue =
    coupon.discountType === 'percent'
      ? (total * coupon.discount) / 100
      : Math.min(coupon.discount, total)

  return NextResponse.json({
    code: coupon.code,
    discountType: coupon.discountType,
    discount: coupon.discount,
    discountValue: Math.round(discountValue * 100) / 100,
    firstOrderOnly: coupon.firstOrderOnly,
  })
}
