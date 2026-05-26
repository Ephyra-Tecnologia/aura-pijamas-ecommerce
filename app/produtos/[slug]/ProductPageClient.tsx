'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore, useUIStore } from '@/store/cart'
import { Footer } from '@/components/index'

const SIZE_CHART = [
  { med: 'A - Busto',   pp: '80–84', p: '86–90', m: '92–96', g: '98–102', gg: '104–110', xgg: '112–118' },
  { med: 'B - Cintura', pp: '66–70', p: '72–76', m: '78–82', g: '84–88',  gg: '90–96',   xgg: '98–104' },
  { med: 'C - Quadril', pp: '90–94', p: '96–100', m: '102–106', g: '108–112', gg: '114–120', xgg: '122–128' },
]
const SIZE_COLS = ['PP (36)', 'P (38)', 'M (40)', 'G (42)', 'GG (44)', 'XGG (46)']

function SizeChart() {
  const [open, setOpen] = useState(false)
  const tdStyle: React.CSSProperties = { padding: '8px 10px', fontSize: 12, textAlign: 'center', color: 'var(--earth)', borderBottom: '1px solid var(--sand)' }
  const thStyle: React.CSSProperties = { padding: '8px 10px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', fontWeight: 400, borderBottom: '1px solid var(--sand)' }
  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', textDecoration: 'underline', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        Tabela de medidas (cm) {open ? '▲' : '▼'}
      </button>
      {open && (
        <div style={{ marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left' }}>Medida</th>
                {SIZE_COLS.map(c => <th key={c} style={thStyle}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map(row => (
                <tr key={row.med}>
                  <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--dark)', fontWeight: 400 }}>{row.med}</td>
                  <td style={tdStyle}>{row.pp}</td>
                  <td style={tdStyle}>{row.p}</td>
                  <td style={tdStyle}>{row.m}</td>
                  <td style={tdStyle}>{row.g}</td>
                  <td style={tdStyle}>{row.gg}</td>
                  <td style={tdStyle}>{row.xgg}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: 'var(--stone)', marginTop: 6, letterSpacing: '0.05em' }}>Medidas em centímetros (cm).</p>
        </div>
      )}
    </div>
  )
}

export default function ProductPageClient({ product }: { product: any }) {
  const addItem = useCartStore(s => s.addItem)
  const { setCartOpen, showToast } = useUIStore()

  const sizes: { size: string; quantity: number }[] = product.sizes ?? []
  const images: string[] = product.images?.length ? product.images : product.image ? [product.image] : []

  const firstAvailable = sizes.find(s => s.quantity > 0)
  const [selectedSize, setSelectedSize] = useState(firstAvailable?.size ?? sizes[0]?.size ?? '')
  const [currentImg, setCurrentImg] = useState(0)
  const touchStartX = useRef(0)

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

  const categoryDisplay = product.categories?.map((c: any) => c.name).join(' · ')
    || (typeof product.category === 'string' ? product.category : product.category?.name)
    || 'Aura Pijamas'

  const selectedSizeEntry = sizes.find(s => s.size === selectedSize)
  const outOfStock = sizes.length > 0 && selectedSizeEntry?.quantity === 0

  const prevImg = () => setCurrentImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setCurrentImg(i => (i + 1) % images.length)

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? nextImg() : prevImg()
  }

  const handleAdd = () => {
    if (outOfStock) return
    addItem(product, selectedSize || 'Único')
    setCartOpen(true)
    showToast('Produto adicionado ao carrinho ✦')
  }

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ padding: '16px 6vw', fontSize: 12, color: 'var(--stone)', letterSpacing: '0.05em' }}>
        <Link href="/" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>·</span>
        <Link href="/colecoes" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Coleções</Link>
        <span style={{ margin: '0 8px' }}>·</span>
        <span style={{ color: 'var(--dark)' }}>{product.name}</span>
      </div>

      {/* Layout principal */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0, minHeight: '80vh', maxWidth: 1200, margin: '0 auto', padding: '0 0 80px' }}>

        {/* ── Galeria ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Imagem principal */}
          <div
            style={{ position: 'relative', aspectRatio: '2/3', width: '100%', background: 'var(--sand)', overflow: 'hidden', cursor: images.length > 1 ? 'grab' : 'default' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {images.length > 0 ? (
              <Image src={images[currentImg]} alt={product.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} priority />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--stone)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                {product.name}
              </div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={prevImg} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
                <button onClick={nextImg} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
                {/* Pontos mobile */}
                <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImg(i)} style={{ width: i === currentImg ? 18 : 6, height: 6, borderRadius: 3, background: i === currentImg ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.2s' }} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 4, padding: '8px 0', overflowX: 'auto' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImg(i)} style={{ flexShrink: 0, width: 72, height: 96, position: 'relative', overflow: 'hidden', border: `2px solid ${i === currentImg ? 'var(--dark)' : 'transparent'}`, padding: 0, cursor: 'pointer', background: 'var(--sand)' }}>
                  <Image src={img} alt="" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Informações ── */}
        <div style={{ padding: '40px 6vw', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 8 }}>{categoryDisplay}</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, color: 'var(--dark)', lineHeight: 1.2, marginBottom: 12 }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            {product.oldPrice && (
              <span style={{ fontSize: 15, color: 'var(--stone)', textDecoration: 'line-through' }}>{fmt(product.oldPrice)}</span>
            )}
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--dark)' }}>{fmt(product.price)}</span>
          </div>

          {product.desc || product.description ? (
            <p style={{ fontSize: 14, color: 'var(--earth)', lineHeight: 1.8, marginBottom: 28, whiteSpace: 'pre-wrap' }}>
              {product.desc || product.description}
            </p>
          ) : null}

          {/* Tamanhos */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 10 }}>Tamanho</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sizes.map(s => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    disabled={s.quantity === 0}
                    style={{
                      width: 48, height: 48, border: selectedSize === s.size ? '2px solid var(--dark)' : '1px solid var(--sand)',
                      background: selectedSize === s.size ? 'var(--dark)' : 'transparent',
                      color: selectedSize === s.size ? 'var(--cream)' : s.quantity === 0 ? 'var(--stone)' : 'var(--dark)',
                      fontSize: 12, letterSpacing: '0.05em', cursor: s.quantity === 0 ? 'not-allowed' : 'pointer',
                      opacity: s.quantity === 0 ? 0.35 : 1, position: 'relative', transition: 'all 0.15s',
                    }}
                    title={s.quantity === 0 ? 'Esgotado' : `${s.quantity} disponíveis`}
                  >
                    {s.size}
                    {s.quantity === 0 && (
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ width: '70%', height: 1, background: 'currentColor', transform: 'rotate(-45deg)', display: 'block' }} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedSizeEntry && selectedSizeEntry.quantity > 0 && selectedSizeEntry.quantity <= 3 && (
                <p style={{ fontSize: 11, color: '#c0392b', letterSpacing: '0.05em', marginTop: 8 }}>
                  Últimas {selectedSizeEntry.quantity} unidade{selectedSizeEntry.quantity > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          <SizeChart />

          {/* Botões */}
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            style={{
              width: '100%', padding: '16px', background: outOfStock ? 'var(--stone)' : 'var(--dark)',
              color: 'var(--cream)', border: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer',
              fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10,
              opacity: outOfStock ? 0.6 : 1, transition: 'opacity 0.2s',
            }}
          >
            {outOfStock ? 'Tamanho esgotado' : 'Adicionar ao carrinho'}
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copiado! ✦'))
            }}
            style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid var(--sand)', cursor: 'pointer', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            🔗 Copiar link do produto
          </button>

          {/* Destaques / badges */}
          {product.badge && (
            <div style={{ marginTop: 20, display: 'inline-block', background: 'var(--sand)', padding: '4px 12px', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>
              {product.badge}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
