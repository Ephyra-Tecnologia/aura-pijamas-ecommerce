'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  active: boolean
  images: string[]
  category?: { name: string }
}

export default function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/produtos')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
  }, [])

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-sans)' }}>
      <div style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Aura Admin</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/admin" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/admin/produtos" style={{ color: 'var(--cream)', textDecoration: 'none' }}>Produtos</Link>
          <Link href="/admin/pedidos" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Pedidos</Link>
          <Link href="/api/auth/signout" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sair</Link>
        </div>
      </div>

      <div style={{ padding: '48px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300 }}>Produtos</h1>
          <Link href="/admin/produtos/novo" style={{
            background: 'var(--dark)', color: 'var(--cream)',
            padding: '12px 24px', textDecoration: 'none',
            fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            + Novo produto
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--stone)', fontSize: 14 }}>Carregando...</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--stone)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 8 }}>Nenhum produto ainda</p>
            <p style={{ fontSize: 13 }}>Clique em "+ Novo produto" para começar</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid var(--sand)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sand)' }}>
                {['Produto', 'Categoria', 'Preço', 'Estoque', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', fontWeight: 400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--sand)' }}>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 64, background: 'var(--sand)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                      {p.images[0] && <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />}
                    </div>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{p.name}</span>
                  </td>
                  <td style={{ padding: '16px', fontSize: 13, color: 'var(--stone)' }}>{p.category?.name || '—'}</td>
                  <td style={{ padding: '16px', fontSize: 13, color: 'var(--earth)' }}>{fmt(p.price)}</td>
                  <td style={{ padding: '16px', fontSize: 13 }}>{p.stock}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '4px 10px',
                      background: p.active ? '#eafaf1' : '#fdf2f2',
                      color: p.active ? '#1e8449' : '#c0392b',
                    }}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Link href={`/admin/produtos/${p.id}`} style={{ fontSize: 12, color: 'var(--earth)', textDecoration: 'none', letterSpacing: '0.08em' }}>
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}