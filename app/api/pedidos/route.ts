import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { name, email, phone, address, city, state, zipCode, notes, status = 'PAID', items, total } = body

  if (!name || !items?.length) {
    return NextResponse.json({ error: 'Nome e itens são obrigatórios' }, { status: 400 })
  }

  // Busca produtos pelo nome para criar os itens
  const order = await prisma.order.create({
    data: {
      source: 'MANUAL',
      status,
      total: total ?? items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
      name,
      email: email || '',
      phone: phone || '',
      zipCode: zipCode || '',
      address: address || '',
      city: city || '',
      state: state || '',
      notes: notes || null,
      items: {
        create: items.map((item: any) => ({
          quantity: item.quantity,
          price: item.price,
          size: item.size || null,
          productId: item.productId,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  })

  return NextResponse.json(order)
}
