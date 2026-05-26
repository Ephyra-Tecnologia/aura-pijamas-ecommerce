'use client'

import { useEffect, useState } from 'react'

interface Coupon {
  id: string
  code: string
  discountType: string
  discount: number
  maxUses: number | null
  usedCount: number
  firstOrderOnly: boolean
  expiresAt: string | null
  active: boolean
  createdAt: string
}

const empty = {
  code: '',
  discountType: 'percent',
  discount: '',
  maxUses: '',
  firstOrderOnly: false,
  expiresAt: '',
  active: true,
}

const brl = (v: number) => 'R$ ' + v.toFixed(2).replace('.', ',')

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState<typeof empty>({ ...empty })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/cupons')
    const data = await res.json()
    setCoupons(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ ...empty })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (c: Coupon) => {
    setEditing(c)
    setForm({
      code: c.code,
      discountType: c.discountType,
      discount: String(c.discount),
      maxUses: c.maxUses !== null ? String(c.maxUses) : '',
      firstOrderOnly: c.firstOrderOnly,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      active: c.active,
    })
    setError('')
    setModalOpen(true)
  }

  const save = async () => {
    setError('')
    if (!form.code.trim()) { setError('Código obrigatório.'); return }
    if (!form.discount) { setError('Desconto obrigatório.'); return }
    setSaving(true)
    const body = {
      ...form,
      discount: parseFloat(form.discount as string),
      maxUses: form.maxUses ? parseInt(form.maxUses as string) : null,
      expiresAt: form.expiresAt || null,
    }
    const res = editing
      ? await fetch(`/api/admin/cupons/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/admin/cupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); setSaving(false); return }
    setModalOpen(false)
    load()
    setSaving(false)
  }

  const toggle = async (c: Coupon) => {
    await fetch(`/api/admin/cupons/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    })
    load()
  }

  const remove = async (c: Coupon) => {
    if (!confirm(`Remover o cupom "${c.code}"?`)) return
    await fetch(`/api/admin/cupons/${c.id}`, { method: 'DELETE' })
    load()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
    fontSize: 14, fontFamily: 'inherit', background: 'white', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#6b7280', display: 'block', marginBottom: 6,
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, color: 'var(--dark)', margin: 0 }}>Cupons</h1>
        <button onClick={openNew} style={{ background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '12px 24px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
          + Novo cupom
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Carregando...</p>
      ) : coupons.length === 0 ? (
        <div style={{ border: '1px solid #e5e7eb', padding: '60px 40px', textAlign: 'center', background: 'white' }}>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Nenhum cupom cadastrado.</p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {['Código', 'Desconto', 'Usos', 'Validade', 'Restrição', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--dark)', letterSpacing: '0.05em' }}>{c.code}</td>
                  <td style={{ padding: '14px 16px', color: '#16a34a', fontWeight: 500 }}>
                    {c.discountType === 'percent' ? `${c.discount}%` : brl(c.discount)}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                    {c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ''}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 12 }}>
                    {c.firstOrderOnly ? '1ª compra (CPF)' : 'Qualquer compra'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => toggle(c)} style={{
                      padding: '4px 12px', fontSize: 11, border: '1px solid',
                      cursor: 'pointer', background: 'transparent',
                      borderColor: c.active ? '#16a34a' : '#d1d5db',
                      color: c.active ? '#16a34a' : '#9ca3af',
                    }}>
                      {c.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(c)} style={{ background: 'none', border: 'none', color: 'var(--earth)', fontSize: 12, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Editar</button>
                      <button onClick={() => remove(c)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: 12, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 500, padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, margin: '0 0 28px' }}>
              {editing ? 'Editar cupom' : 'Novo cupom'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Código</label>
                <input style={inputStyle} placeholder="PROMO10" value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <select style={inputStyle} value={form.discountType}
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                    <option value="percent">Percentual (%)</option>
                    <option value="fixed">Valor fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{form.discountType === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'}</label>
                  <input style={inputStyle} type="number" min="0" step={form.discountType === 'percent' ? '1' : '0.01'}
                    placeholder={form.discountType === 'percent' ? '10' : '20.00'}
                    value={form.discount}
                    onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Usos máximos</label>
                  <input style={inputStyle} type="number" min="1" placeholder="Ilimitado"
                    value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Válido até</label>
                  <input style={inputStyle} type="date" value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--dark)' }}>
                  <input type="checkbox" checked={form.firstOrderOnly}
                    onChange={e => setForm(f => ({ ...f, firstOrderOnly: e.target.checked }))} />
                  Válido apenas para a primeira compra (por CPF)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--dark)' }}>
                  <input type="checkbox" checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  Cupom ativo
                </label>
              </div>
            </div>

            {error && (
              <p style={{ color: '#c0392b', fontSize: 13, margin: '16px 0 0', display: 'flex', gap: 6 }}>⚠ {error}</p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={save} disabled={saving} style={{
                flex: 1, background: 'var(--dark)', color: 'var(--cream)', border: 'none',
                padding: '14px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
              }}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button onClick={() => setModalOpen(false)} style={{
                flex: 1, background: 'transparent', color: 'var(--dark)', border: '1px solid var(--sand)',
                padding: '14px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
