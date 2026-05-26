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
interface CardData {
  number: string; holderName: string; expiry: string; cvv: string
}

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
const SEM_JUROS = 3
const MAX_PARCELAS = 12
const TAXA_MENSAL = 0.0299

function calcParcelas(principal: number, n: number) {
  if (n <= SEM_JUROS) return { valorParcela: principal / n, totalComJuros: principal, juros: 0 }
  const r = TAXA_MENSAL
  const pmt = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  const totalComJuros = pmt * n
  return { valorParcela: pmt, totalComJuros, juros: totalComJuros - principal }
}

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
const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const formatExpiry = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 4)
  return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n
}

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

// ── Formulário de cartão ───────────────────────────────────────────────────────
function CardForm({ card, setCard, errors }: {
  card: CardData
  setCard: (c: CardData) => void
  errors: Record<string, string>
}) {
  const inputStyle = (err?: string): React.CSSProperties => ({
    border: 'none',
    borderBottom: `1px solid ${err ? '#c0392b' : 'var(--sand)'}`,
    padding: '10px 0',
    background: 'transparent',
    fontSize: 15,
    fontFamily: 'var(--font-sans)',
    color: 'var(--dark)',
    width: '100%',
    outline: 'none',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', margin: 0 }}>Dados do cartão</p>

      <div>
        <label className="checkout-label">Número do cartão</label>
        <input
          style={inputStyle(errors.cardNumber)}
          type="text"
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          value={card.number}
          maxLength={19}
          autoComplete="cc-number"
          onChange={e => setCard({ ...card, number: formatCard(e.target.value) })}
        />
        {errors.cardNumber && <span style={{ fontSize: 11, color: '#c0392b', marginTop: 4, display: 'block' }}>⚠ {errors.cardNumber}</span>}
      </div>

      <div>
        <label className="checkout-label">Nome impresso no cartão</label>
        <input
          style={inputStyle(errors.holderName)}
          type="text"
          placeholder="NOME SOBRENOME"
          value={card.holderName}
          autoComplete="cc-name"
          onChange={e => setCard({ ...card, holderName: e.target.value.toUpperCase() })}
        />
        {errors.holderName && <span style={{ fontSize: 11, color: '#c0392b', marginTop: 4, display: 'block' }}>⚠ {errors.holderName}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="checkout-label">Validade</label>
          <input
            style={inputStyle(errors.expiry)}
            type="text"
            inputMode="numeric"
            placeholder="MM/AA"
            value={card.expiry}
            maxLength={5}
            autoComplete="cc-exp"
            onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
          />
          {errors.expiry && <span style={{ fontSize: 11, color: '#c0392b', marginTop: 4, display: 'block' }}>⚠ {errors.expiry}</span>}
        </div>
        <div>
          <label className="checkout-label">CVV</label>
          <input
            style={inputStyle(errors.cvv)}
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={card.cvv}
            maxLength={4}
            autoComplete="cc-csc"
            onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
          />
          {errors.cvv && <span style={{ fontSize: 11, color: '#c0392b', marginTop: 4, display: 'block' }}>⚠ {errors.cvv}</span>}
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--stone)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        🔒 Seus dados são criptografados e não ficam armazenados
      </p>
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
  const [card, setCard] = useState<CardData>({ number: '', holderName: '', expiry: '', cvv: '' })
  const topRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '',
    zipCode: '', address: '', number: '',
    complement: '', neighborhood: '', city: '', state: '',
  })

  const setField = (key: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  const setError = (key: string, msg: string) => setErrors(e => ({ ...e, [key]: msg }))

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

  const buscarCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(f => ({ ...f, address: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }))
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

  const validateCard = () => {
    const newErrors: Record<string, string> = {}
    if (card.number.replace(/\s/g, '').length < 13) newErrors.cardNumber = 'Número do cartão inválido'
    if (!card.holderName.trim()) newErrors.holderName = 'Nome no cartão obrigatório'
    const [mm, yy] = card.expiry.split('/')
    if (!mm || !yy || +mm < 1 || +mm > 12 || yy.length < 2) newErrors.expiry = 'Data de validade inválida'
    if (card.cvv.length < 3) newErrors.cvv = 'CVV inválido'
    return newErrors
  }

  const handlePayment = async () => {
    const newErrors: Record<string, string> = {}
    if (!documento.trim()) {
      newErrors.documento = 'CPF obrigatório'
    } else if (!validateCPF(documento)) {
      newErrors.documento = 'CPF inválido. Verifique o número informado.'
    }

    // Valida campos do cartão
    if (paymentMethod === 'credit_card') {
      const cardErrors = validateCard()
      Object.assign(newErrors, cardErrors)
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(e => ({ ...e, ...newErrors }))
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setPaymentError('')
    setProcessingPayment(true)
    try {
      // Monta dados do cartão para Pagar.me
      let cardPayload = undefined
      if (paymentMethod === 'credit_card') {
        const [expMonth, expYear] = card.expiry.split('/')
        cardPayload = {
          number: card.number.replace(/\s/g, ''),
          holder_name: card.holderName,
          exp_month: parseInt(expMonth),
          exp_year: parseInt('20' + expYear),
          cvv: card.cvv,
          installments: parcelas,
        }
      }

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
          cardData: cardPayload,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPaymentError(data.error ?? 'Erro ao processar pagamento.')
        topRef.current?.scrollIntoView({ behavior: 'smooth' })
        return
      }
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return }
      setOrderId(data.orderId)
      if (data.pix) setPixData(data.pix)
      // Cartão aprovado: redireciona para sucesso
      if (data.paid) { window.location.href = `/checkout/sucesso?order=${data.orderId}`; return }
    } catch {
      setPaymentError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
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

      <div style={{ borderBottom: '1px solid var(--sand)', padding: '16px 6vw', display: 'flex', justifyContent: 'center' }}>
        <Link href="/"><Image src="/assets/aura-header.png" alt="Aura Pijamas" height={36} width={120} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} /></Link>
      </div>

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

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300, margin: '0 0 4px' }}>Seus dados</h2>
              <Field label="Nome completo" value={form.name} onChange={v => setField('name', v)} error={errors.name} autoComplete="name" />
              <Field label="E-mail" value={form.email} onChange={v => setField('email', v.trim())} onBlur={blurEmail} error={errors.email} type="email" placeholder="seu@email.com" autoComplete="email" />
              <Field label="Telefone / WhatsApp" hint="DDD + 8 ou 9 dígitos" value={form.phone} onChange={v => setField('phone', formatPhone(v))} onBlur={blurPhone} error={errors.phone} type="tel" placeholder="(11) 99999-9999" inputMode="tel" autoComplete="tel" />
              <button className="checkout-btn-primary" onClick={goStep2} style={{ marginTop: 8 }}>Continuar</button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300, margin: '0 0 4px' }}>Endereço de entrega</h2>

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
                  onChange={e => { setField('zipCode', e.target.value); buscarCep(e.target.value) }}
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

              {!loadingFrete && freteOptions.length === 0 && form.zipCode.replace(/\D/g, '').length === 8 && (
                <button onClick={calcularFrete} style={{ background: 'transparent', border: '1px solid var(--dark)', color: 'var(--dark)', padding: '13px 20px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
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
          {step === 3 && !pixData && !orderId && (
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
                <label className="checkout-label">CPF</label>
                <input
                  className="checkout-input"
                  type="text"
                  placeholder="000.000.000-00"
                  value={documento}
                  onChange={e => { const f = formatCPF(e.target.value); setDocumento(f); if (errors.documento) setErrors(er => { const n = { ...er }; delete n.documento; return n }) }}
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

              {/* Cartão + Parcelamento */}
              {paymentMethod === 'credit_card' && (
                <div style={cardStyle}>
                  <CardForm card={card} setCard={setCard} errors={errors} />
                  <div style={{ marginTop: 20, borderTop: '1px solid var(--sand)', paddingTop: 20 }}>
                    <InstallmentSelector totalFinal={totalFinal} parcelas={parcelas} setParcelas={setParcelas} />
                    {parcelas > SEM_JUROS && (
                      <p style={{ fontSize: 11, color: 'var(--stone)', marginTop: 12, lineHeight: 1.6 }}>
                        Total com juros: <strong style={{ color: 'var(--dark)' }}>{fmt(totalComJuros)}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {paymentError && (
                <div style={{ background: '#fdf2f2', border: '1px solid #f5c6cb', padding: '14px 16px' }}>
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
                    ? 'Processando...'
                    : paymentMethod === 'pix'
                    ? `Gerar Pix · ${fmt(totalFinal)}`
                    : parcelas > 1
                    ? `Pagar · ${parcelas}x de ${fmt(valorParcela)}`
                    : `Pagar · ${fmt(totalFinal)}`}
                </button>
              </div>
            </div>
          )}

          {pixData && orderId && (
            <PixConfirmacao qrCode={pixData.qrCode} qrCodeUrl={pixData.qrCodeUrl} orderId={orderId} />
          )}

          <div style={{ height: 48 }} />
        </div>

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
