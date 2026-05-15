'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import Image from 'next/image'

interface FreteOption {
  name: string
  price: number
  days: number
}

interface FormData {
  name: string
  email: string
  phone: string
  zipCode: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

function PixConfirmacao({ qrCode, qrCodeUrl, orderId }: { qrCode: string; qrCodeUrl: string; orderId: string }) {
  const [status, setStatus] = useState<'waiting' | 'paid'>('waiting')

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pedidos/${orderId}`)
        const data = await res.json()
        if (data.status === 'PAID') {
          setStatus('paid')
          clearInterval(interval)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [orderId])

  if (status === 'paid') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center', padding: '40px 0' }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300, color: 'var(--dark)' }}>
        Pagamento confirmado!
      </h2>
      <p style={{ fontSize: 14, color: 'var(--stone)', maxWidth: 360, lineHeight: 1.7 }}>
        Seu pedido foi confirmado. Em breve você receberá um e-mail com os detalhes.
      </p>
      <p style={{ fontSize: 13, color: 'var(--earth)' }}>
        Pedido #{orderId.slice(-8).toUpperCase()}
      </p>
      <a href="/" style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '14px 32px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', textDecoration: 'none', marginTop: 8 }}>
        Voltar para a loja
      </a>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>⚡</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300 }}>Pix gerado!</h2>
      <p style={{ fontSize: 14, color: 'var(--stone)', maxWidth: 360, lineHeight: 1.7 }}>
        Escaneie o QR Code ou copie o código Pix abaixo. O pedido será confirmado automaticamente após o pagamento.
      </p>
      {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code Pix" style={{ width: 200, height: 200 }} />}
      <div style={{ width: '100%', background: 'white', border: '1px solid var(--sand)', padding: '16px', wordBreak: 'break-all', fontSize: 11, color: 'var(--stone)', textAlign: 'left' }}>
        {qrCode}
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(qrCode).then(() => alert('Código copiado!'))}
        style={{ background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '14px 32px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
      >
        Copiar código Pix
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--stone)', fontSize: 13 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0ad4e' }} />
        Aguardando pagamento...
      </div>
      <p style={{ fontSize: 12, color: 'var(--stone)' }}>
        Pedido #{orderId.slice(-8).toUpperCase()} · Válido por 1 hora
      </p>
    </div>
  )
}

export default function CheckoutPage() {
  const { items, total } = useCartStore()
  const [step, setStep] = useState(1)
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingFrete, setLoadingFrete] = useState(false)
  const [freteOptions, setFreteOptions] = useState<FreteOption[]>([])
  const [selectedFrete, setSelectedFrete] = useState<FreteOption | null>(null)
  const [documento, setDocumento] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix')
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeUrl: string } | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '',
    zipCode: '', address: '', number: '',
    complement: '', neighborhood: '', city: '', state: '',
  })

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

  const setField = (key: keyof FormData, value: string) =>
    setForm(f => ({ ...f, [key]: value }))

  const buscarCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(f => ({
          ...f,
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        }))
      }
    } catch {}
    setLoadingCep(false)
  }

  const calcularFrete = async () => {
    setLoadingFrete(true)
    await new Promise(r => setTimeout(r, 800))
    setFreteOptions([
      { name: 'Combinar Retirada Grátis - SP', price: 0, days: 0 },
      { name: 'PAC', price: 18.90, days: 8 },
      { name: 'SEDEX', price: 34.50, days: 3 },
    ])
    setLoadingFrete(false)
  }

  const totalFinal = total() + (selectedFrete?.price || 0)

  const handlePayment = async () => {
    setProcessingPayment(true)
    try {
      const res = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: form.name, email: form.email, phone: form.phone, document: documento },
          items: items.map(item => ({ name: item.name, amount: Math.round(item.price * 100), quantity: item.qty })),
          shipping: {
            amount: Math.round((selectedFrete?.price || 0) * 100),
            address: { line_1: `${form.address}, ${form.number}`, zip_code: form.zipCode.replace(/\D/g, ''), city: form.city, state: form.state, country: 'BR' }
          },
          cartItems: items,
          total: totalFinal,
        })
      })
      const data = await res.json()
      if (data.pix) {
        setPixData(data.pix)
        setOrderId(data.orderId)
      }
    } catch {
      alert('Erro ao processar pagamento. Tente novamente.')
    }
    setProcessingPayment(false)
  }

  if (items.length === 0) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', gap: 24 }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--dark)' }}>Seu carrinho está vazio</p>
      <Link href="/" style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--earth)', textDecoration: 'none', borderBottom: '1px solid var(--stone)', paddingBottom: 2 }}>
        Voltar para a loja
      </Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ borderBottom: '1px solid var(--sand)', padding: '20px 6vw', display: 'flex', justifyContent: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/assets/aura-header.png" alt="Aura Pijamas" height={40} width={140} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 6vw', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 60 }}>
        <div>
          {/* Steps */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 40, alignItems: 'center' }}>
            {['Dados', 'Endereço', 'Pagamento'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i + 1 ? 'var(--earth)' : step === i + 1 ? 'var(--dark)' : 'var(--sand)', color: step >= i + 1 ? 'var(--cream)' : 'var(--stone)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 400 }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: step === i + 1 ? 'var(--dark)' : 'var(--stone)' }}>{s}</span>
                {i < 2 && <span style={{ color: 'var(--sand)', margin: '0 4px' }}>—</span>}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Seus dados</h2>
              {[
                { label: 'Nome completo', key: 'name' as const, type: 'text' },
                { label: 'E-mail', key: 'email' as const, type: 'email' },
                { label: 'Telefone / WhatsApp', key: 'phone' as const, type: 'tel' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>{field.label}</label>
                  <input type={field.type} value={form[field.key]} onChange={e => setField(field.key, e.target.value)} required style={{ background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }} />
                </div>
              ))}
              <button onClick={() => { if (form.name && form.email && form.phone) setStep(2) }} style={{ background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '16px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', marginTop: 8 }}>
                Continuar
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Endereço de entrega</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>CEP</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input type="text" value={form.zipCode} onChange={e => { setField('zipCode', e.target.value); buscarCep(e.target.value) }} maxLength={9} placeholder="00000-000" style={{ flex: 1, background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }} />
                  {loadingCep && <span style={{ fontSize: 12, color: 'var(--stone)', alignSelf: 'center' }}>Buscando...</span>}
                </div>
              </div>
              {[
                { label: 'Endereço', key: 'address' as const },
                { label: 'Número', key: 'number' as const },
                { label: 'Complemento', key: 'complement' as const },
                { label: 'Bairro', key: 'neighborhood' as const },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>{field.label}</label>
                  <input type="text" value={form[field.key]} onChange={e => setField(field.key, e.target.value)} style={{ background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>Cidade</label>
                  <input type="text" value={form.city} onChange={e => setField('city', e.target.value)} style={{ background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>UF</label>
                  <input type="text" value={form.state} onChange={e => setField('state', e.target.value)} maxLength={2} style={{ width: 60, background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 20, marginTop: 4 }}>
                <button onClick={calcularFrete} disabled={!form.zipCode || loadingFrete} style={{ background: 'transparent', border: '1px solid var(--dark)', color: 'var(--dark)', padding: '12px 24px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', opacity: !form.zipCode ? 0.5 : 1 }}>
                  {loadingFrete ? 'Calculando...' : 'Calcular frete'}
                </button>
                {freteOptions.length > 0 && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {freteOptions.map((f, i) => (
                      <div key={i} onClick={() => setSelectedFrete(f)} style={{ border: `1px solid ${selectedFrete?.name === f.name ? 'var(--dark)' : 'var(--sand)'}`, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedFrete?.name === f.name ? 'var(--sand)' : 'white' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--dark)' }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--stone)' }}>{f.days === 0 ? 'A combinar' : `até ${f.days} dias úteis`}</div>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--earth)' }}>{f.price === 0 ? 'Grátis' : fmt(f.price)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--sand)', color: 'var(--dark)', padding: '14px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Voltar</button>
                <button onClick={() => { if (form.address && form.city && selectedFrete) setStep(3) }} style={{ flex: 2, background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '14px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Continuar</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && !pixData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Pagamento</h2>
              <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
                <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>Entrega</h3>
                <p style={{ fontSize: 14, color: 'var(--dark)', lineHeight: 1.7 }}>
                  {form.name}<br/>{form.address}, {form.number} {form.complement}<br/>{form.neighborhood} — {form.city}/{form.state}<br/>CEP {form.zipCode}
                </p>
                <p style={{ fontSize: 13, color: 'var(--earth)', marginTop: 12 }}>{selectedFrete?.name} — {fmt(selectedFrete?.price || 0)} · até {selectedFrete?.days} dias úteis</p>
              </div>
              <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
                <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>CPF</h3>
                <input type="text" placeholder="000.000.000-00" value={documento} onChange={e => setDocumento(e.target.value)} maxLength={14} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--sand)', padding: '10px 0', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }} />
              </div>
              <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
                <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>Forma de pagamento</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['pix', 'credit_card'] as const).map(method => (
                    <div key={method} onClick={() => setPaymentMethod(method)} style={{ flex: 1, border: `1px solid ${paymentMethod === method ? 'var(--dark)' : 'var(--sand)'}`, padding: '16px', cursor: 'pointer', textAlign: 'center', background: paymentMethod === method ? 'var(--sand)' : 'white' }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{method === 'pix' ? '⚡' : '💳'}</div>
                      <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dark)' }}>{method === 'pix' ? 'Pix' : 'Cartão'}</div>
                      {method === 'pix' && <div style={{ fontSize: 11, color: 'var(--earth)', marginTop: 4 }}>Aprovação imediata</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)', marginBottom: 8 }}><span>Subtotal</span><span>{fmt(total())}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)', marginBottom: 16 }}><span>Frete ({selectedFrete?.name})</span><span>{fmt(selectedFrete?.price || 0)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-serif)', fontSize: 20, borderTop: '1px solid var(--sand)', paddingTop: 16 }}><span>Total</span><span>{fmt(totalFinal)}</span></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--sand)', color: 'var(--dark)', padding: '14px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Voltar</button>
                <button onClick={handlePayment} disabled={processingPayment || !documento} style={{ flex: 2, background: 'var(--bark)', color: 'var(--cream)', border: 'none', padding: '14px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: processingPayment ? 'not-allowed' : 'pointer', opacity: processingPayment || !documento ? 0.7 : 1 }}>
                  {processingPayment ? 'Processando...' : paymentMethod === 'pix' ? 'Gerar Pix →' : 'Pagar com cartão →'}
                </button>
              </div>
            </div>
          )}

          {/* Pix Confirmação */}
          {pixData && orderId && (
            <PixConfirmacao
              qrCode={pixData.qrCode}
              qrCodeUrl={pixData.qrCodeUrl}
              orderId={orderId}
            />
          )}
        </div>

        {/* RESUMO */}
        <div>
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px', position: 'sticky', top: 24 }}>
            <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 20 }}>Seu pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 64, background: 'var(--sand)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--sand)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--stone)' }}>Tam. {item.size} · Qtd. {item.qty}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--earth)' }}>{fmt(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)' }}><span>Subtotal</span><span>{fmt(total())}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)' }}><span>Frete</span><span>{selectedFrete ? fmt(selectedFrete.price) : '—'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 8, borderTop: '1px solid var(--sand)', paddingTop: 12 }}><span>Total</span><span>{fmt(totalFinal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}