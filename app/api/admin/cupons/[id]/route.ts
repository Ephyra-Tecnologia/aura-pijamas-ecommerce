import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { code, discountType, discount, maxUses, firstOrderOnly, expiresAt, active } = body

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      code: code?.toUpperCase().trim(),
      discountType,
      discount: discount !== undefined ? parseFloat(discount) : undefined,
      maxUses: maxUses !== undefined ? (maxUses ? parseInt(maxUses) : null) : undefined,
      firstOrderOnly: firstOrderOnly !== undefined ? !!firstOrderOnly : undefined,
      expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
      active: active !== undefined ? !!active : undefined,
    },
  })

  return NextResponse.json(coupon)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
