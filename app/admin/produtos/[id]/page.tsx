'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const SIZE_OPTIONS = ['PP', 'P', 'M', 'G', 'GG', 'Único']

interface SizeEntry { size: string; quantity: number }
interface Category { id: string; name: string; slug: string }

export default function AdminProdutoForm() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'novo'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [newSizeInput, setNewSizeInput] = useState('PP')

  const [form, setForm] = useState({
    name: '', description: '', price: '', active: true,
    images: [] as string[],
    categoryIds: [] as string[],
    sizes: [] as SizeEntry[],
  })

  useEffect(() => {
    fetch('/api/categorias')
      .then(r => r.json())
      .then(data => setAllCategories(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/produtos/${params.id}`)
        .then(r => r.json())
        .then(p => {
          setForm({
            name: p.name,
            description: p.description || '',
            price: p.price.toString(),
            active: p.active,
            images: p.images || [],
            categoryIds: (p.categories || []).map((c: Category) => c.id),
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
          })
          setLoading(false)
        })
    }
  }, [params.id, isNew])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    setForm(f => ({ ...f, images: [url, ...f.images] }))
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  const toggleCategory = (id: string) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(c => c !== id)
        : [...f.categoryIds, id],
    }))
  }

  const addSize = () => {
    if (form.sizes.find(s => s.size === newSizeInput)) return
    setForm(f => ({ ...f, sizes: [...f.sizes, { size: newSizeInput, quantity: 0 }] }))
  }

  const updateSizeQty = (size: string, quantity: number) => {
    setForm(f => ({ ...f, sizes: f.sizes.map(s => s.size === size ? { ...s, quantity } : s) }))
  }

  const removeSize = (size: string) => {
    setForm(f => ({ ...f, sizes: f.sizes.filter(s => s.size !== size) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/produtos' : `/api/produtos/${params.id}`
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    router.push('/admin/produtos')
  }

  const inputStyle = {
    background: 'white', border: '1px solid var(--sand)',
    padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)',
    outline: 'none', color: 'var(--dark)', width: '100%',
  }

  const labelStyle = { fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--stone)' }

  if (loading) return <div style={{ padding: 40, fontFamily: 'var(--font-sans)' }}>Carregando...</div>

  return (
    <div style={{ padding: '48px 40px', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
        <Link href="/admin/produtos" style={{ fontSize: 12, color: 'var(--stone)', textDecoration: 'none' }}>← Produtos</Link>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300 }}>
          {isNew ? 'Novo produto' : 'Editar produto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Nome */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>Nome do produto</label>
            <input
              type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {/* Descrição */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>Descrição</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Preço */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>Preço (R$)</label>
            <input
              type="number" step="0.01" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {/* Categorias */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Categorias</label>
            {allCategories.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--stone)' }}>
                Nenhuma categoria criada ainda.{' '}
                <Link href="/admin/categorias" style={{ color: 'var(--earth)' }}>Criar →</Link>
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allCategories.map(cat => {
                  const selected = form.categoryIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        padding: '8px 16px', fontSize: 11, letterSpacing: '0.1em',
                        textTransform: 'uppercase', fontFamily: 'var(--font-sans)',
                        cursor: 'pointer', border: '1px solid',
                        background: selected ? 'var(--dark)' : 'white',
                        color: selected ? 'var(--cream)' : 'var(--stone)',
                        borderColor: selected ? 'var(--dark)' : 'var(--sand)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {selected ? '✓ ' : ''}{cat.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tamanhos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Tamanhos e estoque</label>

            {form.sizes.length > 0 && (
              <div style={{ border: '1px solid var(--sand)', background: 'white' }}>
                {form.sizes.map((s, i) => (
                  <div key={s.size} style={{
                    display: 'grid', gridTemplateColumns: '80px 1fr auto',
                    alignItems: 'center', gap: 16, padding: '12px 16px',
                    borderBottom: i < form.sizes.length - 1 ? '1px solid var(--sand)' : 'none',
                  }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{s.size}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" onClick={() => updateSizeQty(s.size, Math.max(0, s.quantity - 1))}
                        style={{ width: 28, height: 28, border: '1px solid var(--sand)', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        −
                      </button>
                      <input
                        type="number" min="0" value={s.quantity}
                        onChange={e => updateSizeQty(s.size, parseInt(e.target.value) || 0)}
                        style={{ width: 64, textAlign: 'center', border: '1px solid var(--sand)', padding: '4px 8px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none' }}
                      />
                      <button type="button" onClick={() => updateSizeQty(s.size, s.quantity + 1)}
                        style={{ width: 28, height: 28, border: '1px solid var(--sand)', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        +
                      </button>
                      <span style={{ fontSize: 12, color: 'var(--stone)' }}>un.</span>
                    </div>
                    <button type="button" onClick={() => removeSize(s.size)}
                      style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={newSizeInput}
                onChange={e => setNewSizeInput(e.target.value)}
                style={{ flex: 1, ...inputStyle, width: 'auto' }}
              >
                {SIZE_OPTIONS.filter(s => !form.sizes.find(x => x.size === s)).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="custom">Personalizado...</option>
              </select>
              <button
                type="button" onClick={addSize}
                disabled={SIZE_OPTIONS.filter(s => !form.sizes.find(x => x.size === s)).length === 0}
                style={{
                  background: 'var(--dark)', color: 'var(--cream)', border: 'none',
                  padding: '0 20px', fontSize: 11, letterSpacing: '0.12em',
                  textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer',
                }}
              >
                + Adicionar
              </button>
            </div>
            {newSizeInput === 'custom' && (
              <input
                type="text" placeholder="Nome do tamanho (ex: XGG)"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val && !form.sizes.find(s => s.size === val)) {
                      setForm(f => ({ ...f, sizes: [...f.sizes, { size: val, quantity: 0 }] }))
                      setNewSizeInput('PP')
                    }
                  }
                }}
                style={inputStyle}
              />
            )}
            {form.sizes.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--stone)' }}>
                Sem tamanhos cadastrados — adicione acima para controlar estoque por tamanho.
              </p>
            )}
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="checkbox" id="active" checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              style={{ width: 16, height: 16 }}
            />
            <label htmlFor="active" style={{ fontSize: 13, color: 'var(--dark)' }}>
              Produto ativo (visível na loja)
            </label>
          </div>

          <button
            type="submit" disabled={saving}
            style={{
              background: 'var(--dark)', color: 'var(--cream)', border: 'none',
              padding: '16px', fontSize: 11, letterSpacing: '0.15em',
              textTransform: 'uppercase', fontFamily: 'var(--font-sans)',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: 8,
            }}
          >
            {saving ? 'Salvando...' : isNew ? 'Criar produto' : 'Salvar alterações'}
          </button>
        </div>

        {/* IMAGENS */}
        <div>
          <p style={{ ...labelStyle, marginBottom: 16 }}>Fotos do produto</p>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ border: '2px dashed var(--sand)', padding: '32px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: 'white' }}
          >
            {uploading ? (
              <p style={{ fontSize: 13, color: 'var(--stone)' }}>Enviando...</p>
            ) : (
              <>
                <p style={{ fontSize: 24, color: 'var(--stone)', marginBottom: 8 }}>+</p>
                <p style={{ fontSize: 12, color: 'var(--stone)' }}>Clique para adicionar foto</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.images.map((img, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '3/2', background: 'var(--sand)', overflow: 'hidden' }}>
                <Image src={img} alt={`Foto ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                <button
                  type="button" onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(28,20,16,0.7)', color: 'white', border: 'none', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
