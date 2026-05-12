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
  position: number
  categories?: { name: string }[]
  category?: { name: string }
}

export default function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/produtos')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
  }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= products.length) return
    const reordered = [...products]
    ;[reordered[index], reordered[next]] = [reordered[next], reordered[index]]
    setProducts(reordered)
    saveOrder(reordered)
  }

  async function saveOrder(list: Product[]) {
    setSaving(true)
    await fetch('/api/produtos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: list.map(p => p.id) }),
    })
    setSaving(false)
  }

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
  const getCats = (p: Product) =>
    (p.categories && p.categories.length > 0)
      ? p.categories.map(c => c.name).join(', ')
      : p.category?.name || '—'

  return (
    <div style={{ padding: '48px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300 }}>Produtos</h1>
          {saving && <p style={{ fontSize: 11, color: 'var(--stone)', marginTop: 4 }}>Salvando ordem...</p>}
        </div>
        <Link href="/admin/produtos/novo" style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '12px 24px', textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
        <>
          <p style={{ fontSize: 11, color: 'var(--stone)', marginBottom: 16, letterSpacing: '0.05em' }}>
            Use as setas ↑↓ para reorganizar a ordem de exibição na loja.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid var(--sand)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sand)' }}>
                {['Ordem', 'Produto', 'Categorias', 'Preço', 'Estoque', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--sand)' }}>
                  <td style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: 'none', border: '1px solid var(--sand)', cursor: i === 0 ? 'not-allowed' : 'pointer', padding: '2px 6px', fontSize: 10, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === products.length - 1} style={{ background: 'none', border: '1px solid var(--sand)', cursor: i === products.length - 1 ? 'not-allowed' : 'pointer', padding: '2px 6px', fontSize: 10, opacity: i === products.length - 1 ? 0.3 : 1 }}>↓</button>
                    </div>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 64, background: 'var(--sand)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                      {p.images[0] && <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />}
                    </div>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{p.name}</span>
                  </td>
                  <td style={{ padding: '16px', fontSize: 13, color: 'var(--stone)' }}>{getCats(p)}</td>
                  <td style={{ padding: '16px', fontSize: 13, color: 'var(--earth)' }}>{fmt(p.price)}</td>
                  <td style={{ padding: '16px', fontSize: 13 }}>{p.stock}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', background: p.active ? '#eafaf1' : '#fdf2f2', color: p.active ? '#1e8449' : '#c0392b' }}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Link href={`/admin/produtos/${p.id}`} style={{ fontSize: 12, color: 'var(--earth)', textDecoration: 'none', letterSpacing: '0.08em' }}>Editar →</Link>
                    <button onClick={() => handleDelete(p.id, p.name)} style={{ fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', padding: 0 }}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
