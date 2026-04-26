import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-image">
        <div className="hero-img-placeholder" />
        {/* Troque por: <Image src="/assets/banner-hero.jpg" alt="Coleção Aura" fill className="hero-img" /> */}
        <span className="hero-label">Nova Coleção 2025</span>
      </div>
      <div className="hero-content">
        <p className="hero-tag">Coleção Sonhar</p>
        <h1 className="hero-title">
          Pijamas <em>Aura</em><br />feito para sonhar...
        </h1>
        <p className="hero-desc">
          Aura é o conjunto invisível de energia, emoção e presença.
          E nós queremos que você transmita a sua melhor versão ao dormir.
        </p>
        <Link href="#colecao" className="hero-cta">
          Explorar a coleção
          <svg width="20" height="8" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 20 8">
            <path d="M0 4h18m-4-3.5L18 4l-4 3.5"/>
          </svg>
        </Link>
        <div style={{ marginTop: 'auto', paddingTop: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: 40, height: 1, background: 'var(--stone)', display: 'inline-block' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>
            Rolar para baixo
          </span>
        </div>
      </div>
    </section>
  )
}
