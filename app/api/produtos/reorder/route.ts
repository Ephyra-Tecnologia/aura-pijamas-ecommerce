import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// POST /api/produtos/reorder  body: { ids: string[] }
// Sets position of each product based on array index
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids must be an array' }, { status: 400 })

  await Promise.all(
    ids.map((id: string, index: number) =>
      prisma.product.update({ where: { id }, data: { position: index } })
    )
  )
  return NextResponse.json({ ok: true })
}
