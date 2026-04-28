import Link from 'next/link'
import Image from 'next/image'

interface Props {
  config?: Record<string, string>
}

export default function Hero({ config = {} }: Props) {
  const bannerHero = config.banner_hero
  const tag = config.hero_tag || 'Coleção Sonhar'
  const title = config.hero_title || 'Pijamas <em>Aura</em><br>feito para sonhar...'
  const desc = config.hero_desc || 'Aura é o conjunto invisível de energia, emoção e presença. E nós queremos que você transmita a sua melhor versão ao dormir.'
  const cta = config.hero_cta || 'Explorar a coleção'
  const ctaHref = config.hero_cta_href || '#colecao'
  const textColor = config.hero_text_color || undefined

  return (
    <section className="hero">
      <div className="hero-image">
        {bannerHero ? (
          <Image
            src={bannerHero}
            alt="Hero Aura"
            fill
            className="hero-img"
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
        ) : (
          <div className="hero-img-placeholder" />
        )}
        <span className="hero-label">Nova Coleção 2025</span>
      </div>
      <div className="hero-content">
        <p className="hero-tag" style={{ color: textColor }}>{tag}</p>
        <h1 className="hero-title" style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: title }} />
        <p className="hero-desc" style={{ color: textColor }}>{desc}</p>
        <Link href={ctaHref} className="hero-cta" style={{ color: textColor, borderColor: textColor }}>
          {cta}
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