import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { categories: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Restaurar produto excluído
  if (body.restore) {
    const product = await prisma.product.update({
      where: { id },
      data: { deletedAt: null },
      include: { categories: true },
    })
    return NextResponse.json(product)
  }

  const categoryIds: string[] = body.categoryIds ?? []
  const sizes = body.sizes ?? []
  const totalStock = sizes.length > 0
    ? sizes.reduce((acc: number, s: { size: string; quantity: number }) => acc + (s.quantity || 0), 0)
    : parseInt(body.stock) || 0

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: body.description,
      price: parseFloat(body.price),
      stock: totalStock,
      sizes,
      images: body.images,
      active: body.active,
      categories: { set: categoryIds.map((cid: string) => ({ id: cid })) },
    },
    include: { categories: true },
  })
  return NextResponse.json(product)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  // Soft delete — marca deletedAt, mantém no banco para histórico de pedidos
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), active: false },
  })

  return NextResponse.json({ ok: true })
}
