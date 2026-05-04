'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminProdutoForm() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'novo'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '0',
    active: true, images: [] as string[], categoryId: '',
  })

  useEffect(() => {
    fetch('/api/categorias')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
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
            stock: p.stock.toString(),
            active: p.active,
            images: p.images || [],
            categoryId: p.categoryId || '',
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

  const input = (label: string, key: keyof typeof form, type = 'text', opts = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>
        {label}
      </label>
      <input
        type={type}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{
          background: 'white', border: '1px solid var(--sand)',
          padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)',
          outline: 'none', color: 'var(--dark)', width: '100%',
        }}
        {...opts}
      />
    </div>
  )

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
            {input('Nome do produto', 'name', 'text', { required: true })}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
                style={{
                  background: 'white', border: '1px solid var(--sand)',
                  padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)',
                  outline: 'none', color: 'var(--dark)', resize: 'vertical',
                }}
              />
            </div>

            {/* Categoria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>
                Categoria
              </label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                style={{
                  background: 'white', border: '1px solid var(--sand)',
                  padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)',
                  outline: 'none', color: 'var(--dark)', width: '100%',
                }}
              >
                <option value="">Sem categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p style={{ fontSize: 11, color: 'var(--stone)' }}>
                  Nenhuma categoria criada ainda.{' '}
                  <Link href="/admin/categorias" style={{ color: 'var(--earth)' }}>Criar categorias →</Link>
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {input('Preço (R$)', 'price', 'number')}
              {input('Estoque', 'stock', 'number')}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                style={{ width: 16, height: 16 }}
              />
              <label htmlFor="active" style={{ fontSize: 13, color: 'var(--dark)' }}>
                Produto ativo (visível na loja)
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'var(--dark)', color: 'var(--cream)', border: 'none',
                padding: '16px', fontSize: 11, letterSpacing: '0.15em',
                textTransform: 'uppercase', fontFamily: 'var(--font-sans)',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1, marginTop: 8,
              }}
            >
              {saving ? 'Salvando...' : isNew ? 'Criar produto' : 'Salvar alterações'}
            </button>
          </div>

          {/* IMAGENS */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>
              Fotos do produto
            </p>
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
                    type="button"
                    onClick={() => removeImage(i)}
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