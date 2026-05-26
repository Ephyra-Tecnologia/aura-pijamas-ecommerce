'use client'
import { useEffect } from 'react'
import { useUIStore } from '@/store/cart'
import { Footer } from '@/components/index'

export default function ProductPageClient({ product }: { product: any }) {
  const openModal = useUIStore(s => s.openModal)

  // Abre o modal automaticamente ao carregar a página
  useEffect(() => {
    openModal(product)
  }, [product, openModal])

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

  return (
    <>
      <section style={{ background: 'var(--bark)', padding: '80px 6vw 60px' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>
          Aura Pijamas
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.2 }}>
          {product.name}
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--accent)', marginTop: 8 }}>
          {fmt(product.price)}
        </p>
      </section>
      <Footer />
    </>
  )
}
