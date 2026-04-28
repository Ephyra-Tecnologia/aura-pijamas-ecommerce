'use client'
import Link from 'next/link'
import { useState } from 'react'
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
  const aboutOverline = config.about_overline || 'Nossa filosofia'

  return (
    <section className="about-strip">
      <div className="about-text">
        <span className="overline">{aboutOverline}</span>
        <h2 className="about-heading" dangerouslySetInnerHTML={{ __html: aboutTitle }} />
        <p className="about-body">{aboutDesc}</p>
        <Link href={aboutBtnHref} className="hero-cta">
          {aboutBtnText}
          <svg width="20" height="8" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 20 8">
            <path d="M0 4h18m-4-3.5L18 4l-4 3.5"/>
          </svg>
        </Link>
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
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--stone)', marginTop: 16, maxWidth: 240 }}>Pijamas feitos para quem valoriza o descanso como ritual.</p>
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
          <Link href="/sobre">Sobre nós</Link>
          <Link href="#">Guia de tamanhos</Link>
          <Link href="#">Cuidados com as peças</Link>
        </div>
        <div className="footer-col">
          <h4>Ajuda</h4>
          <Link href="#">Trocas e devoluções</Link>
          <Link href="#">Rastrear pedido</Link>
          <Link href="#">FAQ</Link>
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

export function ProductModal() {
  const { modalProduct, closeModal, showToast } = useUIStore()
  const addItem = useCartStore(s => s.addItem)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState(0)
  if (!modalProduct) return null
  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
  const handleAdd = () => { addItem(modalProduct, selectedSize); closeModal(); showToast('Produto adicionado ao carrinho ✦') }
  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="modal" style={{ position: 'relative' }}>
        <div className="modal-img" style={{ position: 'relative' }}>
          {modalProduct.images?.[0] ? (
            <Image src={modalProduct.images[0]} alt={modalProduct.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
          ) : (
            <div className="modal-img-inner">
              <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--stone)' }}>{modalProduct.name}</em>
            </div>
          )}
        </div>
        <div className="modal-content">
          <button className="modal-close" onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16 }}>✕</button>
          <p className="modal-category">{typeof modalProduct.category === 'string' ? modalProduct.category : modalProduct.category?.name || ''}</p>
          <h2 className="modal-name">{modalProduct.name}</h2>
          <p className="modal-price">{fmt(modalProduct.price)}</p>
          <p className="modal-desc">{modalProduct.desc}</p>
          <p className="size-label">Tamanho</p>
          <div className="size-grid">
            {['PP','P','M','G','GG'].map(s => (
              <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
            ))}
          </div>
          <p className="size-label">Cor</p>
          <div className="color-grid">
            {(modalProduct.colors ?? []).map((c, i) => (
              <div key={i} className={`color-swatch ${selectedColor === i ? 'active' : ''}`} style={{ background: c }} onClick={() => setSelectedColor(i)} />
            ))}
          </div>
          <button className="btn-add" onClick={handleAdd}>Adicionar ao carrinho</button>
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