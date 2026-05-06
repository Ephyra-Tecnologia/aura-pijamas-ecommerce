import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const products = await prisma.product.findMany({
    include: { categories: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const categoryIds: string[] = body.categoryIds ?? []
  const sizes = body.sizes ?? []
  const totalStock = sizes.length > 0
    ? sizes.reduce((acc: number, s: { size: string; quantity: number }) => acc + (s.quantity || 0), 0)
    : parseInt(body.stock) || 0

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: body.description,
      price: parseFloat(body.price),
      stock: totalStock,
      sizes,
      images: body.images || [],
      active: body.active ?? true,
      categories: categoryIds.length > 0 ? { connect: categoryIds.map((id: string) => ({ id })) } : undefined,
    },
    include: { categories: true },
  })
  return NextResponse.json(product)
}
