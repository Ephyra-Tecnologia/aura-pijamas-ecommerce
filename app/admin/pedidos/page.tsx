'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type OrderStatus = 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface Order {
  id: string
  status: OrderStatus
  total: number
  name: string
  email: string
  city: string
  state: string
  source?: string
  createdAt: string
  items: { quantity: number; product: { name: string } }[]
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Aguardando pagamento', PAID: 'Pago', PREPARING: 'Preparando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
}

const STATUS_COLOR: Record<OrderStatus, { bg: string; color: string }> = {
  PENDING:   { bg: '#fef9e7', color: '#b7950b' },
  PAID:      { bg: '#eafaf1', color: '#1e8449' },
  PREPARING: { bg: '#eaf4fb', color: '#1a5276' },
  SHIPPED:   { bg: '#f4ecf7', color: '#6c3483' },
  DELIVERED: { bg: '#eafaf1', color: '#1e8449' },
  CANCELLED: { bg: '#fdf2f2', color: '#c0392b' },
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pedidos')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir este pedido? Esta ação não pode ser desfeita.')) return
    await fetch(`/api/pedidos/${id}`, { method: 'DELETE' })
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  return (
    <div style={{ padding: '48px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300, margin: 0 }}>Pedidos</h1>
        <Link href="/admin/pedidos/novo" style={{ padding: '10px 20px', background: '#2C2420', color: '#fff', textDecoration: 'none', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          + Novo pedido
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--stone)', fontSize: 14 }}>Carregando...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--stone)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 8 }}>Nenhum pedido ainda</p>
          <p style={{ fontSize: 13 }}>Os pedidos aparecerão aqui quando os clientes comprarem</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid var(--sand)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sand)' }}>
              {['Pedido', 'Cliente', 'Origem', 'Itens', 'Total', 'Status', 'Data', 'Ações'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const s = STATUS_COLOR[o.status]
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--sand)' }}>
                  <td style={{ padding: '16px', fontSize: 12, color: 'var(--stone)', fontFamily: 'monospace' }}>#{o.id.slice(-8).toUpperCase()}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: 14, color: 'var(--dark)' }}>{o.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--stone)' }}>{o.email}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {o.source === 'MANUAL'
                      ? <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', background: '#fef3e2', color: '#b45309', border: '1px solid #fde68a' }}>📋 Manual</span>
                      : <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>🌐 Site</span>
                    }
                  </td>
                  <td style={{ padding: '16px', fontSize: 13, color: 'var(--stone)' }}>{o.items.length} {o.items.length === 1 ? 'item' : 'itens'}</td>
                  <td style={{ padding: '16px', fontSize: 14, color: 'var(--earth)' }}>{fmt(o.total)}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', background: s.bg, color: s.color }}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: 13, color: 'var(--stone)' }}>{fmtDate(o.createdAt)}</td>
                  <td style={{ padding: '16px', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Link href={`/admin/pedidos/${o.id}`} style={{ fontSize: 12, color: 'var(--earth)', textDecoration: 'none', letterSpacing: '0.08em' }}>Ver →</Link>
                    <button onClick={() => handleDelete(o.id)} style={{ fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', padding: 0 }}>Excluir</button>
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