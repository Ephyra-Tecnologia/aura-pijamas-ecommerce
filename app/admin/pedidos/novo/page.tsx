'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product { id: string; name: string; price: number; sizes: { size: string; quantity: number }[] }
interface ItemLine { productId: string; productName: string; price: number; quantity: number; size: string }

const STATUS_OPTIONS = [
  { value: 'PAID',      label: 'Pago' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'PENDING',   label: 'Aguardando pagamento' },
  { value: 'SHIPPED',   label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

const labelStyle: React.CSSProperties = { fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C7B6B', display: 'block', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e8ddd0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#2C2420' }
const sectionStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e8ddd0', padding: 24, marginBottom: 16 }

export default function NovoPedidoPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Dados do cliente
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('PAID')

  // Itens
  const [items, setItems] = useState<ItemLine[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedQty, setSelectedQty] = useState(1)
  const [selectedPrice, setSelectedPrice] = useState(0)

  useEffect(() => {
    fetch('/api/produtos').then(r => r.json()).then(setProducts)
  }, [])

  const currentProduct = products.find(p => p.id === selectedProduct)

  const addItem = () => {
    if (!selectedProduct) return
    const prod = products.find(p => p.id === selectedProduct)
    if (!prod) return
    setItems(prev => {
      const exists = prev.findIndex(i => i.productId === selectedProduct && i.size === selectedSize)
      if (exists >= 0) {
        return prev.map((i, idx) => idx === exists ? { ...i, quantity: i.quantity + selectedQty } : i)
      }
      return [...prev, { productId: selectedProduct, productName: prod.name, price: selectedPrice || prod.price, quantity: selectedQty, size: selectedSize }]
    })
    setSelectedProduct(''); setSelectedSize(''); setSelectedQty(1); setSelectedPrice(0)
  }

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

  const save = async () => {
    if (!name.trim()) { setError('Nome do cliente é obrigatório.'); return }
    if (!items.length) { setError('Adicione ao menos um item.'); return }
    setError(''); setSaving(true)
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, address, city, state, zipCode, notes, status, items }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Erro ao salvar.'); return }
    router.push(`/admin/pedidos/${data.id}`)
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 300, color: '#2C2420', margin: 0 }}>Novo pedido manual</h1>
          <p style={{ fontSize: 13, color: '#8C7B6B', margin: '4px 0 0' }}>Pedidos externos — WhatsApp, telefone, presencial</p>
        </div>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #e8ddd0', padding: '8px 16px', fontSize: 12, color: '#8C7B6B', cursor: 'pointer' }}>← Voltar</button>
      </div>

      {/* Status */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Status inicial</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => setStatus(s.value)}
              style={{ padding: '8px 16px', border: `1px solid ${status === s.value ? '#2C2420' : '#e8ddd0'}`, background: status === s.value ? '#2C2420' : 'transparent', color: status === s.value ? '#fff' : '#8C7B6B', fontSize: 12, cursor: 'pointer' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cliente */}
      <div style={sectionStyle}>
        <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8C7B6B', margin: '0 0 16px', fontWeight: 500 }}>Cliente</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Nome *</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div>
            <label style={labelStyle}>Telefone</label>
            <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Endereço</label>
            <input style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, complemento" />
          </div>
          <div>
            <label style={labelStyle}>Cidade</label>
            <input style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="São Paulo" />
          </div>
          <div>
            <label style={labelStyle}>UF</label>
            <input style={inputStyle} value={state} onChange={e => setState(e.target.value)} placeholder="SP" maxLength={2} />
          </div>
          <div>
            <label style={labelStyle}>CEP</label>
            <input style={inputStyle} value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="00000-000" />
          </div>
        </div>
      </div>

      {/* Itens */}
      <div style={sectionStyle}>
        <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8C7B6B', margin: '0 0 16px', fontWeight: 500 }}>Itens do pedido</p>

        {/* Adicionar item */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px auto', gap: 8, marginBottom: 16, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Produto</label>
            <select style={inputStyle} value={selectedProduct} onChange={e => { setSelectedProduct(e.target.value); setSelectedSize(''); const p = products.find(x => x.id === e.target.value); setSelectedPrice(p?.price || 0) }}>
              <option value="">Selecione...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tamanho</label>
            <select style={inputStyle} value={selectedSize} onChange={e => setSelectedSize(e.target.value)} disabled={!currentProduct}>
              <option value="">—</option>
              {(currentProduct?.sizes ?? []).map(s => <option key={s.size} value={s.size}>{s.size}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Preço (R$)</label>
            <input style={inputStyle} type="number" step="0.01" value={selectedPrice} onChange={e => setSelectedPrice(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label style={labelStyle}>Qtd</label>
            <input style={inputStyle} type="number" min={1} value={selectedQty} onChange={e => setSelectedQty(parseInt(e.target.value) || 1)} />
          </div>
          <button onClick={addItem} disabled={!selectedProduct}
            style={{ padding: '10px 16px', background: selectedProduct ? '#2C2420' : '#ccc', color: '#fff', border: 'none', cursor: selectedProduct ? 'pointer' : 'not-allowed', fontSize: 18, marginBottom: 0 }}>
            +
          </button>
        </div>

        {/* Lista de itens */}
        {items.length === 0 ? (
          <p style={{ fontSize: 13, color: '#B5A899', fontStyle: 'italic' }}>Nenhum item adicionado.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Produto', 'Tam.', 'Qtd', 'Preço unit.', 'Subtotal', ''].map(h => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C7B6B', fontWeight: 400, borderBottom: '1px solid #e8ddd0', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px', fontSize: 13, color: '#2C2420', borderBottom: '1px solid #f0ebe4' }}>{item.productName}</td>
                  <td style={{ padding: '10px', fontSize: 13, color: '#8C7B6B', borderBottom: '1px solid #f0ebe4' }}>{item.size || '—'}</td>
                  <td style={{ padding: '10px', fontSize: 13, color: '#2C2420', borderBottom: '1px solid #f0ebe4' }}>{item.quantity}</td>
                  <td style={{ padding: '10px', fontSize: 13, color: '#8C7B6B', borderBottom: '1px solid #f0ebe4' }}>{fmt(item.price)}</td>
                  <td style={{ padding: '10px', fontSize: 13, color: '#2C2420', borderBottom: '1px solid #f0ebe4' }}>{fmt(item.price * item.quantity)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #f0ebe4' }}>
                    <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} style={{ padding: '12px 10px', textAlign: 'right', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C7B6B' }}>Total</td>
                <td style={{ padding: '12px 10px', fontSize: 16, fontFamily: 'Georgia, serif', color: '#2C2420' }}>{fmt(total)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Observações */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Observações internas</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Ex: Pedido via WhatsApp, cliente pagou em dinheiro..."
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      {error && <p style={{ fontSize: 13, color: '#c0392b', marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} disabled={saving}
          style={{ padding: '14px 32px', background: saving ? '#8C7B6B' : '#2C2420', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {saving ? 'Salvando...' : 'Criar pedido'}
        </button>
      </div>
    </div>
  )
}
