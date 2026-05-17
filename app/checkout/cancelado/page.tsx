'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function CanceladoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ borderBottom: '1px solid var(--sand)', padding: '20px 6vw', display: 'flex', justifyContent: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/assets/aura-header.png" alt="Aura Pijamas" height={40} width={140} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 81px)', gap: 24, padding: '40px 6vw', textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>❌</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 300, color: 'var(--dark)', margin: 0 }}>
          Pagamento não realizado
        </h1>
        <p style={{ fontSize: 14, color: 'var(--stone)', maxWidth: 400, lineHeight: 1.8, margin: 0 }}>
          Seu pagamento não foi concluído. Nenhum valor foi cobrado. Tente novamente com outro cartão ou utilize o Pix.
        </p>
        <a href="/checkout" style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '14px 40px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', textDecoration: 'none', marginTop: 8 }}>
          Tentar novamente
        </a>
        <a href="/" style={{ fontSize: 12, color: 'var(--stone)', letterSpacing: '0.08em', textDecoration: 'none', borderBottom: '1px solid var(--sand)', paddingBottom: 2 }}>
          Voltar para a loja
        </a>
      </div>
    </div>
  )
}
