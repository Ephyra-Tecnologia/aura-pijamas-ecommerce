import { Footer } from '@/components/index'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

async function getConfigs() {
  try {
    const settings = await prisma.setting.findMany()
    const result: Record<string, string> = {}
    settings.forEach(s => { result[s.key] = s.value })
    return result
  } catch {
    return {}
  }
}

export default async function AAuraPage() {
  const config = await getConfigs()

  const title = config.about_title || 'Valorizamos o <em>desacelerar</em>,<br />o sentir e o viver o momento.'
  const desc = config.about_desc || 'Pijamas Aura nasceu para proporcionar conforto, presença e clima de leveza na sua melhor hora do dia. Desacelerar, sentir e se reconectar com a sua essência, esse é o verdadeiro luxo.'
  const bannerSobre = config.banner_sobre

  return (
    <>
      {/* Hero com título + texto */}
      <section style={{
        background: 'var(--bark)',
        padding: '100px 6vw 80px',
        display: 'grid',
        gridTemplateColumns: bannerSobre ? '1fr 1fr' : '1fr',
        gap: '6vw',
        alignItems: 'center',
        minHeight: '55vh',
      }}>
        <div style={{ maxWidth: bannerSobre ? '100%' : 760 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 24 }}>
            Filosofia Aura
          </p>
          <h1
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 4.5vw, 64px)', fontWeight: 400, lineHeight: 1.15, color: 'var(--cream)', marginBottom: 40 }}
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p style={{ fontSize: 15, lineHeight: 2, color: 'var(--stone)', maxWidth: 600 }}>
            {desc}
          </p>
        </div>

        {bannerSobre && (
          <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 2, overflow: 'hidden' }}>
            <Image src={bannerSobre} alt="A Aura Pijamas" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
          </div>
        )}
      </section>

      <Footer />
    </>
  )
}
