import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/storage'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadImage(buffer, file.name, file.type)

  return NextResponse.json({ url })
}