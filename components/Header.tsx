'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCartStore, useUIStore } from '@/store/cart'

interface Category {
  id: string
  name: string
  slug: string
}

export default function Header() {
  const pathname = usePathname()
  const count = useCartStore(s => s.count())
  const setCartOpen = useUIStore(s => s.setCartOpen)
  const [announceText, setAnnounceText] = useState('Frete grátis para compras acima de R$250 · Coleção Outono chegando em breve')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/configuracoes')
      .then(r => r.json())
      .then(data => { if (data.announce_text) setAnnounceText(data.announce_text) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/categorias')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data) })
      .catch(() => {})
  }, [])

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <div className="announce">{announceText}</div>
      <header>
        <nav className="left">
          <Link href="/">Home</Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/colecoes?categoria=${cat.slug}`}>
              {cat.name}
            </Link>
          ))}
          <Link href="/a-aura">A Aura</Link>
        </nav>

        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/assets/aura-header.png" alt="Aura Pijamas" height={48} width={160} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </Link>

        <nav className="right">
          <button className="icon-btn" aria-label="Buscar">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Carrinho">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
        </nav>
      </header>
    </>
  )
}
