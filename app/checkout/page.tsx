'use client'
import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import Image from 'next/image'

interface FreteOption { name: string; price: number; days: number }
interface FormData {
  name: string; email: string; phone: string
  zipCode: string; address: string; number: string
  complement: string; neighborhood: string; city: string; state: string
}

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
const SEM_JUROS = 3
const MAX_PARCELAS = 12
const TAXA_MENSAL = 0.0299

// ── Cálculo de parcelas ────────────────────────────────────────────────────────
function calcParcelas(principal: number, n: number) {
  if (n <= SEM_JUROS) return { valorParcela: principal / n, totalComJuros: principal, juros: 0 }
  const r = TAXA_MENSAL
  const pmt = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  const totalComJuros = pmt * n
  return { valorParcela: pmt, totalComJuros, juros: totalComJuros - principal }
}

// ── Validações ─────────────────────────────────────────────────────────────────
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
const validatePhone = (v: string) => { const n = v.replace(/\D/g, ''); return n.length === 10 || n.length === 11 }
const validateCPF = (cpf: string): boolean => {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  const calc = (digits: number[], len: number) => {
    const sum = digits.slice(0, len).reduce((acc, d, i) => acc + d * (len + 1 - i), 0)
    const rem = (sum * 10) % 11
    return rem >= 10 ? 0 : rem
  }
  const d = n.split('').map(Number)
  return calc(d, 9) === d[9] && calc(d, 10) === d[10]
}

// ── Formatações ────────────────────────────────────────────────────────────────
const formatPhone = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 11)
  if (n.length <= 2) return n
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}
const formatCPF = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 11)
  if (n.length <= 3) return n
  if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`
  if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`
}

// ── Campo com validação inline ─────────────────────────────────────────────────
function Field({ label, hint, value, onChange, onBlur, error, type = 'text', placeholder = '', maxLength, inputMode, autoComplete }: {
  label: string; hint?: string; value: string
  onChange: (v: string) => void; onBlur?: () => void; error?: string
  type?: string; placeholder?: string; maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <label className="checkout-label">
        {label}
        {hint && <span style={{ fontSize: 9, color: 'var(--stone)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>{hint}</span>}
      </label>
      <input
        className="checkout-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete ?? 'on'}
        style={error ? { borderBottomColor: '#c0392b', outline: 'none' } : undefined}
      />
      {error && (
        <span style={{ fontSize: 11, color: '#c0392b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span> {error}
        </span>
      )}
    </div>
  )
}

// ── Resumo do pedido ───────────────────────────────────────────────────────────
function OrderSummary({ items, totalItems, selectedFrete, totalFinal }: {
  items: any[]; totalItems: () => number; selectedFrete: FreteOption | null; totalFinal: number
}) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 48, height: 64, background: 'var(--sand)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
              {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>Tam. {item.size} · Qtd. {item.qty}</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--earth)', flexShrink: 0 }}>{fmt(item.price * item.qty)}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)' }}>
          <span>Subtotal</span><span>{fmt(totalItems())}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--stone)' }}>
          <span>Frete</span><span>{selectedFrete ? (selectedFrete.price === 0 ? 'Grátis' : fmt(selectedFrete.price)) : '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 6, borderTop: '1px solid var(--sand)', paddingTop: 12 }}>
          <span>Total</span><span>{fmt(totalFinal)}</span>
        </div>
      </div>
    </>
  )
}

// ── Seletor de parcelas ────────────────────────────────────────────────────────
function InstallmentSelector({ totalFinal, parcelas, setParcelas }: {
  totalFinal: number; parcelas: number; setParcelas: (n: number) => void
}) {
  const minParcela = 10
  const maxParcelas = Math.min(MAX_PARCELAS, Math.floor(totalFinal / minParcela))
  const options = Array.from({ length: Math.max(maxParcelas, 1) }, (_, i) => i + 1)
  const { valorParcela, juros } = calcParcelas(totalFinal, parcelas)

  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 12 }}>Parcelamento</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {options.map(n => {
          const { valorParcela: vp } = calcParcelas(totalFinal, n)
          const semJuros = n <= SEM_JUROS
          const ativo = parcelas === n
          return (
            <div key={n} onClick={() => setParcelas(n)} style={{ border: `1px solid ${ativo ? 'var(--dark)' : 'var(--sand)'}`, background: ativo ? 'var(--dark)' : 'white', padding: '10px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 14, fontFamily: 'var(--font-serif)', color: ativo ? 'var(--cream)' : 'var(--dark)', marginBottom: 2 }}>{n}x</div>
              <div style={{ fontSize: 10, color: ativo ? 'var(--sand)' : 'var(--earth)' }}>{fmt(vp)}</div>
              <div style={{ fontSize: 9, color: ativo ? '#C4B5A5' : semJuros ? '#16a34a' : 'var(--stone)', marginTop: 2, letterSpacing: '0.04em' }}>{semJuros ? 'sem juros' : 'c/ juros'}</div>
            </div>
          )
        })}
      </div>
      <div style={{ padding: '12px 14px', background: 'var(--cream)', border: '1px solid var(--sand)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--dark)', fontFamily: 'var(--font-serif)', fontSize: 14 }}>{parcelas}x de {fmt(valorParcela)}</span>
        <span style={{ color: parcelas <= SEM_JUROS ? '#16a34a' : 'var(--stone)', fontSize: 11 }}>{parcelas <= SEM_JUROS ? '✓ sem juros' : `+ ${fmt(juros)} juros`}</span>
      </div>
    </div>
  )
}

// ── Pix confirmação ────────────────────────────────────────────────────────────
function PixConfirmacao({ qrCode, qrCodeUrl, orderId }: { qrCode: string; qrCodeUrl: string; orderId: string }) {
  const [status, setStatus] = useState<'waiting' | 'paid'>('waiting')
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pedidos/${orderId}`)
        const data = await res.json()
        if (data.status === 'PAID') { setStatus('paid'); clearInterval(interval) }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [orderId])

  if (status === 'paid') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 56 }}>✅</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300 }}>Pagamento confirmado!</h2>
      <p style={{ fontSize: 14, color: 'var(--stone)', lineHeight: 1.7 }}>Seu pedido foi confirmado. Em breve você receberá um e-mail.</p>
      <p style={{ fontSize: 12, color: 'var(--earth)' }}>Pedido #{orderId.slice(-8).toUpperCase()}</p>
      <a href="/" style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '16px 32px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>Voltar para a loja</a>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: 40 }}>⚡</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300 }}>Pix gerado!</h2>
      <p style={{ fontSize: 13, color: 'var(--stone)', lineHeight: 1.7 }}>Escaneie o QR Code ou copie o código. O pedido será confirmado automaticamente.</p>
      {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code Pix" style={{ width: 180, height: 180 }} />}
      <div style={{ width: '100%', background: 'var(--sand)', padding: '14px', wordBreak: 'break-all', fontSize: 10, color: 'var(--stone)', textAlign: 'left', lineHeight: 1.6 }}>{qrCode}</div>
      <button onClick={() => navigator.clipboard.writeText(qrCode).then(() => alert('Código copiado!'))} style={{ width: '100%', background: 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '16px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
        Copiar código Pix
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--stone)', fontSize: 13 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0ad4e' }} />
        Aguardando pagamento...
      </div>
      <p style={{ fontSize: 12, color: 'var(--stone)' }}>Pedido #{orderId.slice(-8).toUpperCase()} · Válido por 1 hora</p>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
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
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [parcelas, setParcelas] = useState(1)
  const [paymentError, setPaymentError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const topRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '',
    zipCode: '', address: '', number: '',
    complement: '', neighborhood: '', city: '', state: '',
  })

  const setField = (key: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    // Limpa erro do campo ao editar
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  const setError = (key: string, msg: string) => setErrors(e => ({ ...e, [key]: msg }))

  // ── Validação por campo (on blur) ──────────────────────────────────────────
  const blurEmail = () => {
    if (form.email && !validateEmail(form.email))
      setError('email', 'E-mail inválido. Ex: nome@email.com')
  }
  const blurPhone = () => {
    if (form.phone && !validatePhone(form.phone))
      setError('phone', 'Telefone deve ter DDD + 8 ou 9 dígitos')
  }
  const blurCPF = () => {
    if (documento && !validateCPF(documento))
      setError('documento', 'CPF inválido. Verifique o número informado.')
    else if (errors.documento)
      setErrors(e => { const n = { ...e }; delete n.documento; return n })
  }

  // ── CEP: busca endereço e já calcula frete ─────────────────────────────────
  const buscarCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(f => ({ ...f, address: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }))
        // Já calcula frete automaticamente
        await calcularFrete()
      } else {
        setError('zipCode', 'CEP não encontrado. Verifique e tente novamente.')
      }
    } catch {}
    setLoadingCep(false)
  }

  const calcularFrete = async () => {
    setLoadingFrete(true)
    await new Promise(r => setTimeout(r, 600))
    setFreteOptions([
      { name: 'Combinar Retirada Grátis - SP', price: 0, days: 0 },
      { name: 'PAC', price: 18.90, days: 8 },
      { name: 'SEDEX', price: 34.50, days: 3 },
    ])
    setSelectedFrete(null)
    setLoadingFrete(false)
  }

  const totalFinal = total() + (selectedFrete?.price || 0)
  const { valorParcela, totalComJuros } = calcParcelas(totalFinal, parcelas)

  // ── Validar e avançar step 1 ───────────────────────────────────────────────
  const goStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Nome obrigatório'
    if (!form.email.trim()) newErrors.email = 'E-mail obrigatório'
    else if (!validateEmail(form.email)) newErrors.email = 'E-mail inválido. Ex: nome@email.com'
    if (!form.phone.trim()) newErrors.phone = 'Telefone obrigatório'
    else if (!validatePhone(form.phone)) newErrors.phone = 'Telefone deve ter DDD + 8 ou 9 dígitos'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) setStep(2)
  }

  // ── Validar e avançar step 2 ───────────────────────────────────────────────
  const goStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!form.zipCode.trim()) newErrors.zipCode = 'CEP obrigatório'
    if (!form.address.trim()) newErrors.address = 'Endereço obrigatório'
    if (!form.number.trim()) newErrors.number = 'Número obrigatório'
    if (!form.city.trim()) newErrors.city = 'Cidade obrigatória'
    if (!selectedFrete) newErrors.frete = 'Selecione uma opção de frete'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) setStep(3)
  }

  // ── Pagamento ──────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    // Validação inline de CPF antes de enviar
    const newErrors: Record<string, string> = {}
    if (!documento.trim()) {
      newErrors.documento = 'CPF obrigatório'
    } else if (!validateCPF(documento)) {
      newErrors.documento = 'CPF inválido. Verifique o número informado.'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(e => ({ ...e, ...newErrors }))
      return
    }

    setPaymentError('')
    setProcessingPayment(true)
    try {
      const res = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: form.name, email: form.email, phone: form.phone, document: documento },
          shipping: {
            method: selectedFrete?.name,
            price: selectedFrete?.price || 0,
            address: { line_1: `${form.address}, ${form.number}`, zip_code: form.zipCode.replace(/\D/g, ''), city: form.city, state: form.state, country: 'BR' },
          },
          cartItems: items,
          total: totalFinal,
          paymentMethod,
          parcelas: paymentMethod === 'credit_card' ? parcelas : 1,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPaymentError(data.error ?? 'Erro ao processar pagamento.')
        return
      }
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return }
      setOrderId(data.orderId)
      if (data.pix) setPixData(data.pix)
    } catch {
      setPaymentError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      // Sempre libera o botão, mesmo que dê erro
      setProcessingPayment(false)
    }
  }

  if (items.length === 0) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', gap: 24, padding: '0 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--dark)' }}>Seu carrinho está vazio</p>
      <Link href="/" style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--earth)', textDecoration: 'none', borderBottom: '1px solid var(--stone)', paddingBottom: 2 }}>Voltar para a loja</Link>
    </div>
  )

  const cardStyle = { background: 'white', border: '1px solid var(--sand)', padding: '20px' }

  return (
    <div ref={topRef} style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--sand)', padding: '16px 6vw', display: 'flex', justifyContent: 'center' }}>
        <Link href="/"><Image src="/assets/aura-header.png" alt="Aura Pijamas" height={36} width={120} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} /></Link>
      </div>

      {/* Resumo mobile */}
      <div className="checkout-summary-mobile">
        <button onClick={() => setSummaryOpen(o => !o)} style={{ width: '100%', background: 'var(--sand)', border: 'none', borderBottom: '1px solid #d4c9bc', padding: '14px 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
          <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--earth)' }}>{summaryOpen ? 'Ocultar resumo ▲' : 'Ver resumo do pedido ▼'}</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--dark)' }}>{fmt(totalFinal)}</span>
        </button>
        {summaryOpen && (
          <div style={{ background: 'white', borderBottom: '1px solid var(--sand)', padding: '20px 5vw' }}>
            <OrderSummary items={items} totalItems={total} selectedFrete={selectedFrete} totalFinal={totalFinal} />
          </div>
        )}
      </div>

      <div className="checkout-layout">
        <div style={{ padding: 'clamp(20px, 5vw, 0px)' }}>

          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: '24px 0 0' }}>
            {['Dados', 'Endereço', 'Pagamento'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: i < 2 ? '1 1 auto' : undefined }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: step > i + 1 ? 'var(--earth)' : step === i + 1 ? 'var(--dark)' : 'var(--sand)', color: step >= i + 1 ? 'var(--cream)' : 'var(--stone)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: step === i + 1 ? 'var(--dark)' : 'var(--stone)', whiteSpace: 'nowrap' }}>{s}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--sand)', minWidth: 12 }} />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Dados pessoais ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300, margin: '0 0 4px' }}>Seus dados</h2>
              <Field
                label="Nome completo"
                value={form.name}
                onChange={v => setField('name', v)}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="E-mail"
                value={form.email}
                onChange={v => setField('email', v.trim())}
                onBlur={blurEmail}
                error={errors.email}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
              />
              <Field
                label="Telefone / WhatsApp"
                hint="DDD + 8 ou 9 dígitos"
                value={form.phone}
                onChange={v => setField('phone', formatPhone(v))}
                onBlur={blurPhone}
                error={errors.phone}
                type="tel"
                placeholder="(11) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
              />
              <button className="checkout-btn-primary" onClick={goStep2} style={{ marginTop: 8 }}>
                Continuar
              </button>
            </div>
          )}

          {/* ── Step 2: Endereço ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300, margin: '0 0 4px' }}>Endereço de entrega</h2>

              {/* CEP */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <label className="checkout-label">
                  CEP
                  {loadingCep && <span style={{ fontSize: 9, color: 'var(--stone)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>buscando...</span>}
                  {loadingFrete && !loadingCep && <span style={{ fontSize: 9, color: 'var(--stone)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>calculando frete...</span>}
                </label>
                <input
                  className="checkout-input"
                  type="text"
                  value={form.zipCode}
                  onChange={e => {
                    setField('zipCode', e.target.value)
                    buscarCep(e.target.value)
                  }}
                  maxLength={9}
                  placeholder="00000-000"
                  inputMode="numeric"
                  style={errors.zipCode ? { borderBottomColor: '#c0392b' } : undefined}
                />
                {errors.zipCode && <span style={{ fontSize: 11, color: '#c0392b', marginTop: 4 }}>⚠ {errors.zipCode}</span>}
              </div>

              <Field label="Endereço" value={form.address} onChange={v => setField('address', v)} error={errors.address} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
                <Field label="Número" value={form.number} onChange={v => setField('number', v)} error={errors.number} inputMode="numeric" />
                <Field label="UF" value={form.state} onChange={v => setField('state', v.toUpperCase())} maxLength={2} />
              </div>
              <Field label="Complemento" value={form.complement} onChange={v => setField('complement', v)} placeholder="Apto, bloco, referência..." />
              <Field label="Bairro" value={form.neighborhood} onChange={v => setField('neighborhood', v)} />
              <Field label="Cidade" value={form.city} onChange={v => setField('city', v)} error={errors.city} />

              {/* Opções de frete */}
              {(loadingFrete || freteOptions.length > 0) && (
                <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 4 }}>Frete</p>
                  {loadingFrete ? (
                    <p style={{ fontSize: 13, color: 'var(--stone)' }}>Calculando opções de frete...</p>
                  ) : (
                    freteOptions.map((f, i) => (
                      <div key={i} onClick={() => { setSelectedFrete(f); if (errors.frete) setErrors(e => { const n = { ...e }; delete n.frete; return n }) }}
                        style={{ border: `1px solid ${selectedFrete?.name === f.name ? 'var(--dark)' : 'var(--sand)'}`, padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedFrete?.name === f.name ? 'var(--sand)' : 'white' }}>
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--dark)' }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>{f.days === 0 ? 'A combinar' : `até ${f.days} dias úteis`}</div>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--earth)' }}>{f.price === 0 ? 'Grátis' : fmt(f.price)}</div>
                      </div>
                    ))
                  )}
                  {errors.frete && <span style={{ fontSize: 11, color: '#c0392b' }}>⚠ {errors.frete}</span>}
                </div>
              )}

              {/* Botão de calcular frete manual (caso CEP já esteja preenchido mas frete não calculou) */}
              {!loadingFrete && freteOptions.length === 0 && form.zipCode.replace(/\D/g, '').length === 8 && (
                <button onClick={calcularFrete} style={{ background: 'transparent', border: '1px solid var(--dark)', color: 'var(--dark)', padding: '13px 20px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', borderRadius: 0, WebkitAppearance: 'none' }}>
                  Calcular frete
                </button>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button className="checkout-btn-secondary" onClick={() => setStep(1)}>Voltar</button>
                <button className="checkout-btn-primary" style={{ flex: 2 }} onClick={goStep3}>Continuar</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Pagamento ── */}
          {step === 3 && !pixData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300, margin: '0 0 4px' }}>Pagamento</h2>

              {/* Resumo entrega */}
              <div style={cardStyle}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 12 }}>Entrega</p>
                <p style={{ fontSize: 13, color: 'var(--dark)', lineHeight: 1.8 }}>
                  {form.name}<br />{form.address}, {form.number}{form.complement ? ` — ${form.complement}` : ''}<br />
                  {form.neighborhood} · {form.city}/{form.state}<br />CEP {form.zipCode}
                </p>
                <p style={{ fontSize: 12, color: 'var(--earth)', marginTop: 10 }}>
                  {selectedFrete?.name} · {selectedFrete?.price === 0 ? 'Grátis' : fmt(selectedFrete?.price || 0)}
                  {selectedFrete?.days ? ` · até ${selectedFrete.days} dias úteis` : ''}
                </p>
                <button onClick={() => setStep(2)} style={{ marginTop: 12, background: 'none', border: 'none', fontSize: 11, color: 'var(--stone)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Alterar</button>
              </div>

              {/* CPF */}
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                <label className="checkout-label">
                  CPF
                  <span style={{ fontSize: 9, color: 'var(--stone)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>obrigatório para Pix</span>
                </label>
                <input
                  className="checkout-input"
                  type="text"
                  placeholder="000.000.000-00"
                  value={documento}
                  onChange={e => {
                    const formatted = formatCPF(e.target.value)
                    setDocumento(formatted)
                    if (errors.documento) setErrors(er => { const n = { ...er }; delete n.documento; return n })
                  }}
                  onBlur={blurCPF}
                  maxLength={14}
                  inputMode="numeric"
                  style={{ border: 'none', borderBottom: `1px solid ${errors.documento ? '#c0392b' : 'var(--sand)'}`, padding: '10px 0', background: 'transparent' }}
                />
                {errors.documento && <span style={{ fontSize: 11, color: '#c0392b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {errors.documento}</span>}
              </div>

              {/* Método */}
              <div style={cardStyle}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 14 }}>Forma de pagamento</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['pix', 'credit_card'] as const).map(method => (
                    <div key={method} onClick={() => setPaymentMethod(method)}
                      style={{ border: `1px solid ${paymentMethod === method ? 'var(--dark)' : 'var(--sand)'}`, padding: '16px 12px', cursor: 'pointer', textAlign: 'center', background: paymentMethod === method ? 'var(--sand)' : 'white' }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{method === 'pix' ? '⚡' : '💳'}</div>
                      <div style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dark)' }}>{method === 'pix' ? 'Pix' : 'Cartão'}</div>
                      <div style={{ fontSize: 10, color: 'var(--earth)', marginTop: 3 }}>{method === 'pix' ? 'Aprovação imediata' : 'Até 12x'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parcelamento */}
              {paymentMethod === 'credit_card' && (
                <div style={cardStyle}>
                  <InstallmentSelector totalFinal={totalFinal} parcelas={parcelas} setParcelas={setParcelas} />
                  {parcelas > SEM_JUROS && (
                    <p style={{ fontSize: 11, color: 'var(--stone)', marginTop: 12, lineHeight: 1.6 }}>
                      Total com juros: <strong style={{ color: 'var(--dark)' }}>{fmt(totalComJuros)}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Erro de pagamento inline */}
              {paymentError && (
                <div style={{ background: '#fdf2f2', border: '1px solid #f5c6cb', padding: '14px 16px', borderRadius: 0 }}>
                  <span style={{ fontSize: 13, color: '#c0392b', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}>
                    <span style={{ flexShrink: 0 }}>⚠</span>
                    {paymentError}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="checkout-btn-secondary" onClick={() => setStep(2)}>Voltar</button>
                <button
                  className="checkout-btn-primary"
                  style={{ flex: 2, opacity: processingPayment ? 0.7 : 1 }}
                  onClick={handlePayment}
                  disabled={processingPayment}
                >
                  {processingPayment
                    ? 'Aguarde...'
                    : paymentMethod === 'pix'
                    ? `Gerar Pix · ${fmt(totalFinal)}`
                    : parcelas > 1
                    ? `Pagar · ${parcelas}x de ${fmt(valorParcela)}`
                    : `Pagar · ${fmt(totalFinal)}`}
                </button>
              </div>

              {paymentMethod === 'credit_card' && (
                <p style={{ fontSize: 11, color: 'var(--stone)', textAlign: 'center' }}>
                  🔒 Você será redirecionado para o Stripe para inserir os dados do cartão
                </p>
              )}
            </div>
          )}

          {pixData && orderId && (
            <PixConfirmacao qrCode={pixData.qrCode} qrCodeUrl={pixData.qrCodeUrl} orderId={orderId} />
          )}

          <div style={{ height: 48 }} />
        </div>

        {/* Resumo desktop */}
        <div className="checkout-summary-desktop">
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px', position: 'sticky', top: 24 }}>
            <h3 style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 20 }}>Seu pedido</h3>
            <OrderSummary items={items} totalItems={total} selectedFrete={selectedFrete} totalFinal={totalFinal} />
          </div>
        </div>
      </div>
    </div>
  )
}
