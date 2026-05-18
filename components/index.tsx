'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useCartStore, useUIStore } from '@/store/cart'
import Image from 'next/image'

export function Editorial({ config = {} }: { config?: Record<string, string> }) {
  const cols = [
    {
      tag: config.ed1_tag || 'Tecidos naturais',
      title: config.ed1_title || '100% Algodão',
      linkText: config.ed1_link_text || 'Descobrir',
      href: config.ed1_href || '/colecoes',
      bannerKey: 'banner_ed1',
      colorKey: 'ed1_text_color',
    },
    {
      tag: config.ed2_tag || 'Edição limitada',
      title: config.ed2_title || 'Pijama Americano',
      linkText: config.ed2_link_text || 'Ver coleção',
      href: config.ed2_href || '/colecoes',
      bannerKey: 'banner_ed2',
      colorKey: 'ed2_text_color',
    },
    {
      tag: config.ed3_tag || 'Bestsellers',
      title: config.ed3_title || 'Favoritos',
      linkText: config.ed3_link_text || 'Explorar',
      href: config.ed3_href || '/colecoes',
      bannerKey: 'banner_ed3',
      colorKey: 'ed3_text_color',
    },
  ]

  return (
    <section className="editorial">
      {cols.map((col, i) => {
        const textColor = config[col.colorKey] || undefined
        return (
          <div key={i} className="editorial-col">
            {config[col.bannerKey] && (
              <Image src={config[col.bannerKey]} alt={col.title} fill className="ed-img" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
            )}
            <div className="ed-placeholder">
              <div className="ed-content">
                <span className="ed-tag" style={{ color: textColor }}>{col.tag}</span>
                <h3 className="ed-title" style={{ color: textColor }}>{col.title}</h3>
                <Link href={col.href} className="ed-link" style={{ color: textColor, borderColor: textColor }}>{col.linkText}</Link>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

export function AboutStrip({ config = {} }: { config?: Record<string, string> }) {
  const bannerSobre = config.banner_sobre
  const aboutTitle = config.about_title || 'Valorizamos o <em>desacelerar</em>,<br />o sentir e o viver o momento.'
  const aboutDesc = config.about_desc || 'Pijamas Aura nasceu para proporcionar conforto, presença e clima de leveza na sua melhor hora do dia. Desacelerar, sentir e se reconectar com a sua essência, esse é o verdadeiro luxo.'
  const aboutBtnText = config.about_btn_text || 'Sobre a Aura'
  const aboutBtnHref = config.about_btn_href || '/sobre'
  const aboutOverline = config.about_overline || ''

  return (
    <section className="about-strip">
      <div className="about-text">
        {aboutOverline && <span className="overline">{aboutOverline}</span>}
        <h2 className="about-heading" dangerouslySetInnerHTML={{ __html: aboutTitle }} />
      </div>
      <div className="about-image">
        {bannerSobre ? (
          <Image src={bannerSobre} alt="Sobre a Aura" fill className="about-img" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #E8DDD0, #C4B5A5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 14, fontStyle: 'italic', color: 'var(--stone)' }}>
            foto editorial aqui
          </div>
        )}
      </div>
    </section>
  )
}

export function Features() {
  const items = [
    { icon: '✦', title: 'Tecidos naturais', desc: 'Uma atmosfera de aconchego e conforto.' },
    { icon: '◌', title: 'Frete grátis', desc: 'Em compras acima de R$399 para todo o Brasil.' },
    { icon: '↻', title: 'Troca fácil', desc: '30 dias para troca ou devolução, sem complicação.' },
    { icon: '◇', title: 'Embalagem especial', desc: 'Do nosso mundo para o seu.' },
  ]
  return (
    <div className="features">
      {items.map((item, i) => (
        <div key={i} className="feature-item">
          <div className="feature-icon">{item.icon}</div>
          <div className="feature-title">{item.title}</div>
          <div className="feature-desc">{item.desc}</div>
        </div>
      ))}
    </div>
  )
}

export function Newsletter() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Obrigada! Em breve você receberá nossas novidades.')
    setName(''); setEmail('')
  }
  return (
    <section className="newsletter">
      <div>
        <h2 className="newsletter-title">Faça parte do<br /><em>universo Aura</em></h2>
      </div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <p style={{ fontSize: 13, color: 'rgba(232,221,208,0.7)', lineHeight: 1.7 }}>Receba novidades, lançamentos exclusivos e ofertas especiais antes de todo mundo.</p>
        <input className="newsletter-input" type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
        <input className="newsletter-input" type="email" placeholder="Seu e-mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit" className="newsletter-submit">Quero participar</button>
      </form>
    </section>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <Link href="/" style={{ display: 'inline-block' }}>
            <Image src="/assets/aura-footer.png" alt="Aura Pijamas" height={52} width={180} style={{ objectFit: 'contain' }} />
          </Link>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--stone)', marginTop: 16, maxWidth: 240 }}>Aura Pijamas, feito para sonhar.</p>
        </div>
        <div className="footer-col">
          <h4>Loja</h4>
          <Link href="/colecoes">Nova coleção</Link>
          <Link href="/colecoes#pijamas">Pijamas</Link>
          <Link href="/colecoes#conjuntos">Conjuntos</Link>
          <Link href="/colecoes#sale">Sale</Link>
        </div>
        <div className="footer-col">
          <h4>Informações</h4>
          <Link href="/a-aura">Sobre nós</Link>
          <Link href="#">Cuidados com as peças</Link>
        </div>
        <div className="footer-col">
          <h4>Ajuda</h4>
          <Link href="/trocas-devolucoes">Trocas e devoluções</Link>
          <Link href="#">Contato</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Aura Pijamas. Todos os direitos reservados.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="#">Privacidade</Link>
          <Link href="#">Termos</Link>
          <Link href="/admin" style={{ color: 'rgba(196,181,165,0.3)' }}>Admin</Link>
        </div>
      </div>
    </footer>
  )
}

export function CartDrawer() {
  const { items, removeItem, total } = useCartStore()
  const { cartOpen, setCartOpen } = useUIStore()
  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
  return (
    <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setCartOpen(false) }}>
      <div className="cart-drawer">
        <div className="cart-header">
          <span className="cart-title">Carrinho</span>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ color: 'var(--stone)' }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p>Seu carrinho está vazio</p>
            </div>
          ) : items.map((item, i) => (
            <div key={i} className="cart-item">
              <div className="cart-item-img" style={{ background: item.color, position: 'relative', overflow: 'hidden' }}>
                {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
              </div>
              <div>
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-variant">{item.category} · Tam. {item.size}</div>
                <div className="cart-item-price">{fmt(item.price)}</div>
              </div>
              <button className="cart-remove" onClick={() => removeItem(i)}>✕</button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total"><span>Total</span><span>{fmt(total())}</span></div>
            <button className="btn-checkout" onClick={() => { setCartOpen(false); window.location.href = '/checkout' }}>Finalizar compra</button>
          </div>
        )}
      </div>
    </div>
  )
}

const SIZE_CHART = [
  { med: 'A - Busto',   pp: '80–84', p: '86–90', m: '92–96', g: '98–102', gg: '104–110', xgg: '112–118' },
  { med: 'B - Cintura', pp: '66–70', p: '72–76', m: '78–82', g: '84–88',  gg: '90–96',   xgg: '98–104' },
  { med: 'C - Quadril', pp: '90–94', p: '96–100', m: '102–106', g: '108–112', gg: '114–120', xgg: '122–128' },
]
const SIZE_COLS = ['PP (36)', 'P (38)', 'M (40)', 'G (42)', 'GG (44)', 'XGG (46)']

function SizeChart() {
  const [open, setOpen] = useState(false)
  const tdStyle: React.CSSProperties = { padding: '8px 10px', fontSize: 11, textAlign: 'center', color: 'var(--earth)', borderBottom: '1px solid var(--sand)' }
  const thStyle: React.CSSProperties = { padding: '8px 10px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', fontWeight: 400, borderBottom: '1px solid var(--sand)' }
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', textDecoration: 'underline', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        Tabela de medidas (cm) {open ? '▲' : '▼'}
      </button>
      {open && (
        <div style={{ marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
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
          <p style={{ fontSize: 10, color: 'var(--stone)', marginTop: 6, letterSpacing: '0.05em' }}>Medidas em centímetros (cm).</p>
        </div>
      )}
    </div>
  )
}

export function ProductModal() {
  const { modalProduct, closeModal, showToast } = useUIStore()
  const addItem = useCartStore(s => s.addItem)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)
  const [currentImg, setCurrentImg] = useState(0)
  const touchStartX = useRef(0)

  useEffect(() => {
    if (modalProduct) {
      const sizes = modalProduct.sizes ?? []
      const firstAvailable = sizes.find(s => s.quantity > 0)
      setSelectedSize(firstAvailable?.size ?? (sizes[0]?.size ?? ''))
      setSelectedColor(0)
      setCurrentImg(0)
    }
  }, [modalProduct])

  if (!modalProduct) return null

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
  const sizes = modalProduct.sizes ?? []
  const hasSizes = sizes.length > 0
  const images = modalProduct.images?.length ? modalProduct.images : []
  const categoryDisplay = modalProduct.categories?.map(c => c.name).join(' · ')
    || (typeof modalProduct.category === 'string' ? modalProduct.category : modalProduct.category?.name)
    || ''

  const selectedSizeEntry = sizes.find(s => s.size === selectedSize)
  const outOfStock = hasSizes && selectedSizeEntry?.quantity === 0

  const prevImg = () => setCurrentImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setCurrentImg(i => (i + 1) % images.length)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? nextImg() : prevImg()
  }

  const handleAdd = () => {
    if (outOfStock) return
    addItem(modalProduct, selectedSize || 'Único')
    closeModal()
    showToast('Produto adicionado ao carrinho ✦')
  }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="modal" style={{ position: 'relative' }}>

        {/* ── Galeria de imagens ───────────────────────────────────────── */}
        <div className="modal-gallery">
          {/* Imagem principal com swipe e setas */}
          <div className="modal-img"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImg]}
                  alt={modalProduct.name}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                />

                {/* Setas */}
                {images.length > 1 && (
                  <>
                    <button onClick={prevImg} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
                    <button onClick={nextImg} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
                  </>
                )}

                {/* Pontos — visíveis só no mobile */}
                {images.length > 1 && (
                  <div className="modal-dots">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setCurrentImg(i)} style={{ width: i === currentImg ? 18 : 6, height: 6, borderRadius: 3, background: i === currentImg ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.2s' }} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="modal-img-inner">
                <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--stone)' }}>{modalProduct.name}</em>
              </div>
            )}
          </div>

          {/* Miniaturas — visíveis só no desktop */}
          {images.length > 1 && (
            <div className="modal-thumbs">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImg(i)} style={{ width: 52, height: 68, flexShrink: 0, position: 'relative', overflow: 'hidden', border: `2px solid ${i === currentImg ? 'var(--dark)' : 'transparent'}`, padding: 0, cursor: 'pointer', background: 'var(--sand)' }}>
                  <Image src={img} alt="" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Painel de informações ────────────────────────────────────── */}
        <div className="modal-content">
          <button className="modal-close" onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16 }}>✕</button>
          <p className="modal-category">{categoryDisplay}</p>
          <h2 className="modal-name">{modalProduct.name}</h2>
          <p className="modal-price">{fmt(modalProduct.price)}</p>
          <p className="modal-desc" style={{ whiteSpace: 'pre-wrap' }}>{modalProduct.desc || modalProduct.description}</p>

          {hasSizes && (
            <>
              <p className="size-label">Tamanho</p>
              <div className="size-grid">
                {sizes.map(s => (
                  <button
                    key={s.size}
                    className={`size-btn ${selectedSize === s.size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s.size)}
                    disabled={s.quantity === 0}
                    style={{ opacity: s.quantity === 0 ? 0.35 : 1, cursor: s.quantity === 0 ? 'not-allowed' : 'pointer', position: 'relative' }}
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
                <p style={{ fontSize: 11, color: '#c0392b', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Últimas {selectedSizeEntry.quantity} unidade{selectedSizeEntry.quantity > 1 ? 's' : ''}
                </p>
              )}
            </>
          )}

          {(modalProduct.colors ?? []).length > 0 && (
            <>
              <p className="size-label">Cor</p>
              <div className="color-grid">
                {(modalProduct.colors ?? []).map((c, i) => (
                  <div key={i} className={`color-swatch ${selectedColor === i ? 'active' : ''}`} style={{ background: c }} onClick={() => setSelectedColor(i)} />
                ))}
              </div>
            </>
          )}

          <SizeChart />

          <button className="btn-add" onClick={handleAdd} disabled={outOfStock}
            style={{ opacity: outOfStock ? 0.5 : 1, cursor: outOfStock ? 'not-allowed' : 'pointer' }}>
            {outOfStock ? 'Tamanho esgotado' : 'Adicionar ao carrinho'}
          </button>
          <button className="btn-wishlist">♡ &nbsp;Salvar na lista de desejos</button>
        </div>
      </div>
    </div>
  )
}

export function Toast() {
  const toast = useUIStore(s => s.toast)
  return <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
}