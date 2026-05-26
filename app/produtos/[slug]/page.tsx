import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductPageClient from './ProductPageClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findFirst({ where: { slug, deletedAt: null } })
  if (!product) return { title: 'Produto não encontrado' }
  return {
    title: `${product.name} · Aura Pijamas`,
    description: product.description ?? `${product.name} — Aura Pijamas`,
    openGraph: {
      title: product.name,
      description: product.description ?? '',
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: { categories: true },
  })
  if (!product) notFound()
  return <ProductPageClient product={product} />
}
