'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useCartStore, useUIStore } from '@/store/cart'

export default function Header() {
  const count = useCartStore(s => s.count())
  const setCartOpen = useUIStore(s => s.setCartOpen)
  const [announceText, setAnnounceText] = useState('Frete grátis para compras acima de R$250 · Coleção Outono chegando em breve')

  useEffect(() => {
    fetch('/api/configuracoes')
      .then(r => r.json())
      .then(data => { if (data.announce_text) setAnnounceText(data.announce_text) })
      .catch(() => {})
  }, [])

  return (
    <>
      <div className="announce">{announceText}</div>
      <header>
        <nav className="left">
          <Link href="/colecoes">Coleções</Link>
          <Link href="/colecoes#pijamas">Pijamas</Link>
          <Link href="/colecoes#conjuntos">Conjuntos</Link>
          <Link href="/colecoes#sale">Sale</Link>
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