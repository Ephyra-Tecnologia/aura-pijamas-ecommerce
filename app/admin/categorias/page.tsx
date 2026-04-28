'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/categorias')
      .then(r => r.json())
      .then(data => { setCategories(Array.isArray(data) ? data : []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setNewName('')
    setSaving(false)
    load()
  }

  const handleDelete = async (id: string, name: string, count: number) => {
    if (count > 0) {
      alert(`Não é possível excluir "${name}" pois tem ${count} produto(s) vinculado(s).`)
      return
    }
    if (!confirm(`Excluir categoria "${name}"?`)) return
    await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-sans)' }}>
      <div style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Aura Admin</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/admin" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/admin/produtos" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Produtos</Link>
          <Link href="/admin/pedidos" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Pedidos</Link>
          <Link href="/admin/categorias" style={{ color: 'var(--cream)', textDecoration: 'none' }}>Categorias</Link>
          <Link href="/admin/configuracoes" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Configurações</Link>
          <Link href="/api/auth/signout" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sair</Link>
        </div>
      </div>

      <div style={{ padding: '48px 40px', maxWidth: 640 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300, marginBottom: 40 }}>Categorias</h1>

        {/* Criar nova */}
        <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 300, marginBottom: 16 }}>Nova categoria</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: Pijamas, Conjuntos, Robes..."
              required
              style={{ flex: 1, background: 'white', border: '1px solid var(--sand)', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }}
            />
            <button
              type="submit"
              disabled={saving}
              style={{ background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '10px 24px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? '...' : 'Criar'}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div style={{ background: 'white', border: '1px solid var(--sand)' }}>
          {loading ? (
            <div style={{ padding: 24, color: 'var(--stone)', fontSize: 14 }}>Carregando...</div>
          ) : categories.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--stone)', fontSize: 14 }}>
              Nenhuma categoria criada ainda.
            </div>
          ) : categories.map((cat, i) => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: i < categories.length - 1 ? '1px solid var(--sand)' : 'none' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--dark)' }}>{cat.name}</div>
                <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>
                  /{cat.slug} · {cat._count.products} produto(s)
                </div>
              </div>
              <button
                onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                style={{ background: 'none', border: '1px solid var(--sand)', color: 'var(--stone)', padding: '6px 14px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}