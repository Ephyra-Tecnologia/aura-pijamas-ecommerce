'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'

function PendenteContent() {
  const params = useSearchParams()
  const externalReference = params.get('external_reference') ?? ''
  const orderId = externalReference.slice(-8).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ borderBottom: '1px solid var(--sand)', padding: '20px 6vw', display: 'flex', justifyContent: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/assets/aura-header.png" alt="Aura Pijamas" height={40} width={140} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 81px)', gap: 24, padding: '40px 6vw', textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>⏳</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 300, color: 'var(--dark)', margin: 0 }}>
          Pedido recebido!
        </h1>
        <p style={{ fontSize: 14, color: 'var(--stone)', maxWidth: 420, lineHeight: 1.8, margin: 0 }}>
          Seu pedido foi registrado com sucesso. O pagamento está sendo processado e você receberá uma confirmação por e-mail assim que aprovado.
        </p>
        {orderId && (
          <p style={{ fontSize: 13, color: 'var(--earth)', margin: 0 }}>
            Pedido #{orderId}
          </p>
        )}
        <a href="/" style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '14px 40px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', textDecoration: 'none', marginTop: 8 }}>
          Voltar para a loja
        </a>
      </div>
    </div>
  )
}

export default function PendentePage() {
  return (
    <Suspense>
      <PendenteContent />
    </Suspense>
  )
}
