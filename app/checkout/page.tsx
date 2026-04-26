'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
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

export default function CheckoutPage() {
  const { items, total, removeItem } = useCartStore()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingFrete, setLoadingFrete] = useState(false)
  const [freteOptions, setFreteOptions] = useState<FreteOption[]>([])
  const [selectedFrete, setSelectedFrete] = useState<FreteOption | null>(null)
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '',
    zipCode: '', address: '', number: '',
    complement: '', neighborhood: '', city: '', state: '',
  })

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')

  const set = (key: keyof FormData, value: string) =>
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
    // Placeholder até integrar Melhor Envio
    await new Promise(r => setTimeout(r, 800))
    setFreteOptions([
      { name: 'PAC', price: 18.90, days: 8 },
      { name: 'SEDEX', price: 34.50, days: 3 },
    ])
    setLoadingFrete(false)
  }

  const totalFinal = total() + (selectedFrete?.price || 0)

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
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--sand)', padding: '20px 6vw', display: 'flex', justifyContent: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/assets/aura-header.png" alt="Aura Pijamas" height={40} width={140} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 6vw', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 60 }}>

        {/* FORMULÁRIO */}
        <div>
          {/* Steps */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 40, alignItems: 'center' }}>
            {['Dados', 'Endereço', 'Revisão'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step > i + 1 ? 'var(--earth)' : step === i + 1 ? 'var(--dark)' : 'var(--sand)',
                  color: step >= i + 1 ? 'var(--cream)' : 'var(--stone)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 400,
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: step === i + 1 ? 'var(--dark)' : 'var(--stone)' }}>
                  {s}
                </span>
                {i < 2 && <span style={{ color: 'var(--sand)', margin: '0 4px' }}>—</span>}
              </div>
            ))}
          </div>

          {/* Step 1 — Dados pessoais */}
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
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => set(field.key, e.target.value)}
                    required
                    style={{ background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }}
                  />
                </div>
              ))}
              <button
                onClick={() => { if (form.name && form.email && form.phone) setStep(2) }}
                style={{ background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '16px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', marginTop: 8 }}
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2 — Endereço */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Endereço de entrega</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>CEP</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={e => { set('zipCode', e.target.value); buscarCep(e.target.value) }}
                    maxLength={9}
                    placeholder="00000-000"
                    style={{ flex: 1, background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }}
                  />
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
                  <input
                    type="text"
                    value={form[field.key]}
                    onChange={e => set(field.key, e.target.value)}
                    style={{ background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>Cidade</label>
                  <input type="text" value={form.city} onChange={e => set('city', e.target.value)} style={{ background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>Estado</label>
                  <input type="text" value={form.state} onChange={e => set('state', e.target.value)} maxLength={2} style={{ width: 60, background: 'white', border: '1px solid var(--sand)', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)' }} />
                </div>
              </div>

              {/* Frete */}
              <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 20, marginTop: 4 }}>
                <button
                  onClick={calcularFrete}
                  disabled={!form.zipCode || loadingFrete}
                  style={{ background: 'transparent', border: '1px solid var(--dark)', color: 'var(--dark)', padding: '12px 24px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', opacity: !form.zipCode ? 0.5 : 1 }}
                >
                  {loadingFrete ? 'Calculando...' : 'Calcular frete'}
                </button>

                {freteOptions.length > 0 && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {freteOptions.map((f, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedFrete(f)}
                        style={{
                          border: `1px solid ${selectedFrete?.name === f.name ? 'var(--dark)' : 'var(--sand)'}`,
                          padding: '12px 16px', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: selectedFrete?.name === f.name ? 'var(--sand)' : 'white',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--dark)' }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--stone)' }}>até {f.days} dias úteis</div>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--earth)' }}>{fmt(f.price)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--sand)', color: 'var(--dark)', padding: '14px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
                  Voltar
                </button>
                <button
                  onClick={() => { if (form.address && form.city && selectedFrete) setStep(3) }}
                  style={{ flex: 2, background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '14px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Revisão */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Revisão do pedido</h2>

              <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
                <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>Entrega</h3>
                <p style={{ fontSize: 14, color: 'var(--dark)', lineHeight: 1.7 }}>
                  {form.name}<br/>
                  {form.address}, {form.number} {form.complement}<br/>
                  {form.neighborhood} — {form.city}/{form.state}<br/>
                  CEP {form.zipCode}
                </p>
                <p style={{ fontSize: 13, color: 'var(--earth)', marginTop: 12 }}>
                  {selectedFrete?.name} — {fmt(selectedFrete?.price || 0)} · até {selectedFrete?.days} dias úteis
                </p>
              </div>

              <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
                <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>Total</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)', marginBottom: 8 }}>
                  <span>Subtotal</span><span>{fmt(total())}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)', marginBottom: 16 }}>
                  <span>Frete ({selectedFrete?.name})</span><span>{fmt(selectedFrete?.price || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-serif)', fontSize: 20, borderTop: '1px solid var(--sand)', paddingTop: 16 }}>
                  <span>Total</span><span>{fmt(totalFinal)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--sand)', color: 'var(--dark)', padding: '14px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
                  Voltar
                </button>
                <button
                  onClick={() => alert('Integração com Pagar.me em breve!')}
                  style={{ flex: 2, background: 'var(--bark)', color: 'var(--cream)', border: 'none', padding: '14px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                >
                  Ir para pagamento →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RESUMO DO CARRINHO */}
        <div>
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px', position: 'sticky', top: 24 }}>
            <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 20 }}>Seu pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 64, background: item.color || 'var(--sand)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--stone)' }}>Tam. {item.size} · Qtd. {item.qty}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--earth)' }}>{fmt(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)' }}>
                <span>Subtotal</span><span>{fmt(total())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)' }}>
                <span>Frete</span>
                <span>{selectedFrete ? fmt(selectedFrete.price) : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 8, borderTop: '1px solid var(--sand)', paddingTop: 12 }}>
                <span>Total</span><span>{fmt(totalFinal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}