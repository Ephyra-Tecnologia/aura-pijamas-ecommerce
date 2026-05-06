'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useUIStore, Product } from '@/store/cart'

export default function ProductGrid() {
  const openModal = useUIStore(s => s.openModal)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/produtos')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

  const getCategoryDisplay = (p: Product) => {
    if (p.categories && p.categories.length > 0) return p.categories.map(c => c.name).join(' · ')
    if (!p.category) return ''
    if (typeof p.category === 'string') return p.category
    return p.category.name || ''
  }

  if (loading) return (
    <section id="colecao">
      <div className="section-header">
        <h2 className="section-title"><em>Lançamentos</em></h2>
      </div>
      <div style={{ padding: '0 6vw 80px', color: 'var(--stone)', fontSize: 14 }}>
        Carregando produtos...
      </div>
    </section>
  )

  return (
    <section id="colecao">
      <div className="section-header">
        <h2 className="section-title"><em>Lançamentos</em></h2>
        <Link href="/colecoes" className="view-all">Ver todos</Link>
      </div>
      <div className="products-grid">
        {products.filter(p => p.active !== false).map(p => (
          <div key={p.id} className="product-card" onClick={() => openModal(p)}>
            <div className="product-img-wrap">
              {p.images?.[0] ? (
                <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: `linear-gradient(145deg, ${p.colors?.[0] || '#E8DDD0'}, ${p.colors?.[1] || '#C4B5A5'})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--stone)', fontSize: 14 }}>
                    {p.name}
                  </span>
                </div>
              )}
              {p.badge && <span className="product-badge">{p.badge}</span>}
              <div className="product-actions">
                <button className="btn-quick" onClick={e => { e.stopPropagation(); openModal(p) }}>
                  Adicionar
                </button>
              </div>
            </div>
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-variant">{getCategoryDisplay(p)}</div>
              <div className="product-price">
                {p.oldPrice && <span className="old">{fmt(p.oldPrice)}</span>}
                {fmt(p.price)}
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '60px 0', textAlign: 'center', color: 'var(--stone)', fontSize: 14 }}>
            Nenhum produto cadastrado ainda.
          </div>
        )}
      </div>
    </section>
  )
}