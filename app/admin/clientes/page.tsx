'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string | null
  email: string
  active: boolean
  createdAt: string
  hasPurchased: boolean
  source: 'newsletter' | 'buyer'
}

type Segment = 'all' | 'buyers' | 'newsletter_only'

const BADGE: Record<string, { label: string; bg: string; color: string }> = {
  both:             { label: 'Comprou + Newsletter', bg: '#fef3c7', color: '#92400e' },
  buyer:            { label: 'Comprador',            bg: '#dcfce7', color: '#166534' },
  newsletter:       { label: 'Newsletter',           bg: '#ede9fe', color: '#5b21b6' },
}

function getBadge(c: Client) {
  if (c.source === 'newsletter' && c.hasPurchased) return BADGE.both
  if (c.hasPurchased) return BADGE.buyer
  return BADGE.newsletter
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState<Segment>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/clientes')
    setClients(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async (id: string) => {
    if (!confirm('Remover este inscrito?')) return
    await fetch('/api/admin/clientes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setClients(s => s.filter(x => x.id !== id))
    setSelected(s => { const n = new Set(s); n.delete(id); return n })
  }

  const toggleSelect = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selectAll = () => selected.size === filtered.length ? setSelected(new Set()) : setSelected(new Set(filtered.map(c => c.id)))

  const exportCSV = () => {
    const rows = [['Nome', 'E-mail', 'Tipo', 'Data'], ...clients.map(c => [c.name || '', c.email, getBadge(c).label, new Date(c.createdAt).toLocaleDateString('pt-BR')])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'clientes-aura.csv'; a.click()
  }

  const bySegment = (c: Client) => {
    if (segment === 'buyers') return c.hasPurchased
    if (segment === 'newsletter_only') return c.source === 'newsletter' && !c.hasPurchased
    return true
  }

  const filtered = clients.filter(c =>
    bySegment(c) &&
    (c.email.toLowerCase().includes(search.toLowerCase()) || (c.name || '').toLowerCase().includes(search.toLowerCase()))
  )

  const counts = {
    all: clients.length,
    buyers: clients.filter(c => c.hasPurchased).length,
    newsletter_only: clients.filter(c => c.source === 'newsletter' && !c.hasPurchased).length,
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR')
  const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f0ebe4', fontSize: 13, color: '#2C2420' }
  const thStyle: React.CSSProperties = { padding: '10px 16px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8C7B6B', fontWeight: 500, borderBottom: '2px solid #e8ddd0', textAlign: 'left' }
  const segBtn = (s: Segment): React.CSSProperties => ({
    padding: '8px 18px', background: segment === s ? '#2C2420' : 'transparent',
    color: segment === s ? '#fff' : '#8C7B6B', border: '1px solid #e8ddd0',
    cursor: 'pointer', fontSize: 12, letterSpacing: '0.08em',
  })

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 300, color: '#2C2420', margin: 0 }}>Clientes</h1>
          <p style={{ fontSize: 13, color: '#8C7B6B', margin: '4px 0 0' }}>{clients.length} contato{clients.length !== 1 ? 's' : ''} no total</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {selected.size > 0 && (
            <Link href={`/admin/newsletter?ids=${[...selected].join(',')}`}
              style={{ padding: '10px 18px', background: '#2C2420', color: '#fff', textDecoration: 'none', fontSize: 12, letterSpacing: '0.1em' }}>
              ✉ Enviar para {selected.size} selecionado{selected.size > 1 ? 's' : ''}
            </Link>
          )}
          <Link href={`/admin/newsletter?segment=${segment}`}
            style={{ padding: '10px 18px', background: '#8C7B6B', color: '#fff', textDecoration: 'none', fontSize: 12, letterSpacing: '0.1em' }}>
            ✉ Enviar para {filtered.length} visíveis
          </Link>
          <button onClick={exportCSV} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #e8ddd0', fontSize: 12, color: '#8C7B6B', cursor: 'pointer' }}>
            ↓ CSV
          </button>
        </div>
      </div>

      {/* Filtros de segmento */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        <button style={segBtn('all')} onClick={() => setSegment('all')}>Todos ({counts.all})</button>
        <button style={segBtn('buyers')} onClick={() => setSegment('buyers')}>🛍 Compradores ({counts.buyers})</button>
        <button style={segBtn('newsletter_only')} onClick={() => setSegment('newsletter_only')}>💌 Só newsletter ({counts.newsletter_only})</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nome ou e-mail..."
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8ddd0', fontSize: 13, marginBottom: 20, outline: 'none', boxSizing: 'border-box', color: '#2C2420' }}
      />

      {loading ? (
        <p style={{ color: '#8C7B6B', fontSize: 13 }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#8C7B6B', fontSize: 13 }}>Nenhum contato encontrado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 40 }}>
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} />
              </th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>E-mail</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Data</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const badge = getBadge(c)
              return (
                <tr key={c.id} style={{ background: selected.has(c.id) ? '#faf7f4' : 'white' }}>
                  <td style={tdStyle}><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td style={tdStyle}>{c.name || <span style={{ color: '#B5A899' }}>—</span>}</td>
                  <td style={tdStyle}>{c.email}</td>
                  <td style={tdStyle}>
                    <span style={{ background: badge.bg, color: badge.color, padding: '2px 8px', fontSize: 11, borderRadius: 2, whiteSpace: 'nowrap' }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#8C7B6B' }}>{fmt(c.createdAt)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {c.source === 'newsletter' && (
                      <button onClick={() => remove(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: 12 }}>Remover</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
