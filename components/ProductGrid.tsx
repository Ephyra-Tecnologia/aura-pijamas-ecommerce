'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useUIStore, Product } from '@/store/cart'

const DEFAULT_PRODUCTS: Product[] = [
  { id:1, name:'Conjunto Linho Soft', category:'Conjunto', price:289, oldPrice:null, badge:'Novo', colors:['#E8DDD0','#C4B5A5','#4A3728'], desc:'Conjunto de calça e camisa em linho macio com acabamento artesanal.' },
  { id:2, name:'Camisola Seda Modal', category:'Camisola', price:349, oldPrice:420, badge:'Sale', colors:['#F7F3EE','#8B7355'], desc:'Camisola em blend de seda e modal com alças reguláveis.' },
  { id:3, name:'Pijama Algodão Pima', category:'Pijama', price:319, badge:null, colors:['#E8DDD0','#C4B5A5','#1C1410'], desc:'O clássico reinventado em algodão Pima egípcio.' },
  { id:4, name:'Short Set Verão', category:'Conjunto', price:249, badge:'Favorito', colors:['#F7F3EE','#E8DDD0'], desc:'Leveza máxima para as noites mais quentes.' },
  { id:5, name:'Robe Plissado', category:'Robe', price:398, badge:null, colors:['#E8DDD0','#C4B5A5','#8B7355'], desc:'Robe plissado em viscose premium.' },
  { id:6, name:'Conjunto Listras Finas', category:'Pijama', price:299, oldPrice:350, badge:'Sale', colors:['#E8DDD0','#1C1410'], desc:'Listras finas em tons neutros.' },
  { id:7, name:'Camisola Midi Lace', category:'Camisola', price:379, badge:'Novo', colors:['#F7F3EE','#E8DDD0','#C4B5A5'], desc:'Elegância com detalhe em renda no decote.' },
  { id:8, name:'Pijama Manga Longa', category:'Pijama', price:339, badge:null, colors:['#E8DDD0','#8B7355','#4A3728'], desc:'Conforto total em noites frescas.' },
]

interface Props {
  products?: Product[]
}

export default function ProductGrid({ products = DEFAULT_PRODUCTS }: Props) {
  const openModal = useUIStore(s => s.openModal)

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

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
              {p.image ? (
                <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: `linear-gradient(145deg, ${p.colors[0] || '#E8DDD0'}, ${p.colors[1] || '#C4B5A5'})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--stone)', fontSize: 14 }}>
                    {p.name}
                  </span>
                </div>
              )}
              {p.badge && <span className="product-badge">{p.badge}</span>}
              <div className="product-actions">
                <button
                  className="btn-quick"
                  onClick={e => { e.stopPropagation(); openModal(p) }}
                >
                  Adicionar
                </button>
              </div>
            </div>
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-variant">{p.category}</div>
              <div className="product-price">
                {p.oldPrice && <span className="old">{fmt(p.oldPrice)}</span>}
                {fmt(p.price)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
