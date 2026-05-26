'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type OrderStatus = 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface Order {
  id: string
  status: OrderStatus
  total: number
  name: string
  email: string
  phone: string
  zipCode: string
  address: string
  city: string
  state: string
  pagarmeId: string | null
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    size?: string | null
    product: { name: string; images: string[] }
  }[]
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING',   label: 'Aguardando pagamento' },
  { value: 'PAID',      label: 'Pago' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'SHIPPED',   label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export default function AdminPedidoDetalhe() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<OrderStatus>('PENDING')
  const [trackingCode, setTrackingCode] = useState('')

  useEffect(() => {
    fetch(`/api/pedidos/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setOrder(data)
        setStatus(data.status)
        setLoading(false)
      })
  }, [params.id])

  const updateStatus = async () => {
    setSaving(true)
    await fetch(`/api/pedidos/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingCode: trackingCode || null }),
    })
    setSaving(false)
    setOrder(prev => prev ? { ...prev, status } : prev)
    alert('Status atualizado! E-mail enviado para o cliente.')
  }

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
  const fmtDate = (d: string) => new Date(d).toLocaleString('pt-BR')

  if (loading) return <div style={{ padding: 40, fontFamily: 'var(--font-sans)' }}>Carregando...</div>
  if (!order) return <div style={{ padding: 40, fontFamily: 'var(--font-sans)' }}>Pedido não encontrado.</div>

  return (
    <div style={{ padding: '48px 40px', maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <Link href="/admin/pedidos" style={{ fontSize: 12, color: 'var(--stone)', textDecoration: 'none' }}>← Pedidos</Link>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300 }}>
            Pedido #{order.id.slice(-8).toUpperCase()}
          </h1>
          <span style={{ fontSize: 12, color: 'var(--stone)' }}>{fmtDate(order.createdAt)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Cliente */}
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 24 }}>
            <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>Cliente</h3>
            <p style={{ fontSize: 15, fontFamily: 'var(--font-serif)', marginBottom: 4 }}>{order.name}</p>
            <p style={{ fontSize: 13, color: 'var(--stone)', marginBottom: 2 }}>{order.email}</p>
            <p style={{ fontSize: 13, color: 'var(--stone)' }}>{order.phone}</p>
          </div>

          {/* Endereço */}
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 24 }}>
            <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>Entrega</h3>
            <p style={{ fontSize: 13, color: 'var(--dark)', lineHeight: 1.7 }}>
              {order.address}<br/>
              {order.city}/{order.state} — CEP {order.zipCode}
            </p>
          </div>
        </div>

        {/* Itens */}
        <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>Itens do pedido</h3>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--sand)' : 'none' }}>
              <div style={{ width: 56, height: 72, background: 'var(--sand)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                {item.product.images?.[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{item.product.name}</div>
                <div style={{ fontSize: 12, color: 'var(--stone)', marginTop: 2 }}>
                  {item.size && <span style={{ marginRight: 8 }}>Tam. <strong>{item.size}</strong></span>}
                  Qtd: {item.quantity}
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--earth)' }}>{fmt(item.price * item.quantity)}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--sand)', marginTop: 8, fontFamily: 'var(--font-serif)', fontSize: 20 }}>
            Total: {fmt(order.total)}
          </div>
        </div>

        {/* Status */}
        <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 24 }}>
          <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>Atualizar status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as OrderStatus)}
              style={{ background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Código de rastreio (opcional — aparece no e-mail)"
                value={trackingCode}
                onChange={e => setTrackingCode(e.target.value)}
                style={{ flex: 1, background: 'white', border: '1px solid var(--sand)', padding: '10px 14px', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }}
              />
              <button
                onClick={updateStatus}
                disabled={saving}
                style={{ background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '12px 24px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', opacity: saving ? 0.7 : 1, whiteSpace: 'nowrap' }}
              >
                {saving ? 'Salvando...' : 'Salvar e notificar'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--stone)', margin: 0 }}>Um e-mail será enviado automaticamente para o cliente ao salvar.</p>
          </div>
        </div>
    </div>
  )
}