'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Subscriber {
  id: string
  name: string | null
  email: string
  active: boolean
  createdAt: string
}

export default function ClientesPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/clientes')
    const data = await res.json()
    setSubscribers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async (id: string) => {
    if (!confirm('Remover este inscrito?')) return
    await fetch('/api/admin/clientes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setSubscribers(s => s.filter(x => x.id !== id))
    setSelected(s => { const n = new Set(s); n.delete(id); return n })
  }

  const toggleSelect = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(s => s.id)))
  }

  const exportCSV = () => {
    const rows = [['Nome', 'E-mail', 'Data'], ...subscribers.map(s => [s.name || '', s.email, new Date(s.createdAt).toLocaleDateString('pt-BR')])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'clientes-newsletter.csv'; a.click()
  }

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f0ebe4', fontSize: 13, color: '#2C2420' }
  const thStyle: React.CSSProperties = { padding: '10px 16px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8C7B6B', fontWeight: 500, borderBottom: '2px solid #e8ddd0', textAlign: 'left' }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 300, color: '#2C2420', margin: 0 }}>Clientes</h1>
          <p style={{ fontSize: 13, color: '#8C7B6B', margin: '4px 0 0' }}>{subscribers.length} inscrito{subscribers.length !== 1 ? 's' : ''} na newsletter</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {selected.size > 0 && (
            <Link href={`/admin/newsletter?ids=${[...selected].join(',')}`} style={{ padding: '10px 18px', background: '#2C2420', color: '#fff', textDecoration: 'none', fontSize: 12, letterSpacing: '0.1em' }}>
              ✉ Enviar para {selected.size} selecionado{selected.size > 1 ? 's' : ''}
            </Link>
          )}
          <Link href="/admin/newsletter" style={{ padding: '10px 18px', background: '#8C7B6B', color: '#fff', textDecoration: 'none', fontSize: 12, letterSpacing: '0.1em' }}>
            ✉ Enviar para todos
          </Link>
          <button onClick={exportCSV} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #e8ddd0', fontSize: 12, color: '#8C7B6B', cursor: 'pointer', letterSpacing: '0.08em' }}>
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nome ou e-mail..."
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8ddd0', fontSize: 13, marginBottom: 20, outline: 'none', boxSizing: 'border-box', color: '#2C2420' }}
      />

      {loading ? (
        <p style={{ color: '#8C7B6B', fontSize: 13 }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#8C7B6B', fontSize: 13 }}>Nenhum inscrito encontrado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 40 }}>
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} />
              </th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>E-mail</th>
              <th style={thStyle}>Data</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ background: selected.has(s.id) ? '#faf7f4' : 'white' }}>
                <td style={tdStyle}>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} />
                </td>
                <td style={tdStyle}>{s.name || <span style={{ color: '#B5A899' }}>—</span>}</td>
                <td style={tdStyle}>{s.email}</td>
                <td style={{ ...tdStyle, color: '#8C7B6B' }}>{fmt(s.createdAt)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <button onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: 12 }}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
