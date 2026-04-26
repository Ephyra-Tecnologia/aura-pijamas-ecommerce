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
  createdAt: string
  items: { quantity: number; product: { name: string } }[]
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Aguardando pagamento',
  PAID: 'Pago',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
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

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-sans)' }}>
      <div style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Aura Admin</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/admin" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/admin/produtos" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Produtos</Link>
          <Link href="/admin/pedidos" style={{ color: 'var(--cream)', textDecoration: 'none' }}>Pedidos</Link>
          <Link href="/api/auth/signout" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sair</Link>
        </div>
      </div>

      <div style={{ padding: '48px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300, marginBottom: 32 }}>Pedidos</h1>

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
                {['Pedido', 'Cliente', 'Itens', 'Total', 'Status', 'Data', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', fontWeight: 400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const s = STATUS_COLOR[o.status]
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--sand)' }}>
                    <td style={{ padding: '16px', fontSize: 12, color: 'var(--stone)', fontFamily: 'monospace' }}>
                      #{o.id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 14, color: 'var(--dark)' }}>{o.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--stone)' }}>{o.email}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: 13, color: 'var(--stone)' }}>
                      {o.items.length} {o.items.length === 1 ? 'item' : 'itens'}
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, color: 'var(--earth)' }}>
                      {fmt(o.total)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', background: s.bg, color: s.color }}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: 13, color: 'var(--stone)' }}>
                      {fmtDate(o.createdAt)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Link href={`/admin/pedidos/${o.id}`} style={{ fontSize: 12, color: 'var(--earth)', textDecoration: 'none', letterSpacing: '0.08em' }}>
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}