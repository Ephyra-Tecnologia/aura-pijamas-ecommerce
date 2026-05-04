'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useUIStore, Product } from '@/store/cart'
import { Footer } from '@/components/index'

export default function ColecoesPage() {
  const openModal = useUIStore(s => s.openModal)
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(searchParams.get('categoria') || 'todos')

  useEffect(() => {
    const cat = searchParams.get('categoria')
    setFilter(cat || 'todos')
  }, [searchParams])

  useEffect(() => {
    fetch('/api/produtos')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

  const getCategoryName = (category: Product['category']) => {
    if (!category) return ''
    if (typeof category === 'string') return category
    return category.name || ''
  }

  const categories = ['todos', ...Array.from(new Set(products.map(p => getCategoryName(p.category)).filter(Boolean)))]

  const filtered = filter === 'todos'
    ? products.filter(p => p.active !== false)
    : products.filter(p => p.active !== false && getCategoryName(p.category).toLowerCase() === filter.toLowerCase())



  return (
    <>
      <section style={{ background: 'var(--bark)', padding: '80px 6vw 60px' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>
          Aura Pijamas
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1 }}>
          Nossa <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Coleção</em>
        </h1>
      </section>

      <div style={{ padding: '40px 6vw 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat.toLowerCase())}
            style={{
              background: filter.toLowerCase() === cat.toLowerCase() ? 'var(--dark)' : 'transparent',
              color: filter.toLowerCase() === cat.toLowerCase() ? 'var(--cream)' : 'var(--stone)',
              border: `1px solid ${filter.toLowerCase() === cat.toLowerCase() ? 'var(--dark)' : 'var(--sand)'}`,
              padding: '8px 20px',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {cat === 'todos' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 6vw 80px' }}>
        {loading ? (
          <p style={{ color: 'var(--stone)', fontSize: 14 }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--stone)', fontSize: 14 }}>Nenhum produto encontrado.</p>
        ) : (
          <div className="products-grid">
            {filtered.map(p => (
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
                  <div className="product-variant">{getCategoryName(p.category)}</div>
                  <div className="product-price">
                    {p.oldPrice && <span className="old">{fmt(p.oldPrice)}</span>}
                    {fmt(p.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}