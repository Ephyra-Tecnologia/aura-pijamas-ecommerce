import { Footer } from '@/components/index'

export default function AAuraPage() {
  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'var(--bark)',
        color: 'var(--cream)',
        padding: '100px 6vw 80px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6vw',
        alignItems: 'center',
        minHeight: '60vh',
      }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 24 }}>
            Nossa história
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 300, lineHeight: 1.05, marginBottom: 32 }}>
            A <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Aura</em><br />
            Pijamas
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--stone)', maxWidth: 480 }}>
            Escreva aqui o texto de apresentação da Aura Pijamas. Conte a história da marca, os valores, a missão e o que torna os pijamas únicos.
          </p>
        </div>
        <div style={{
          aspectRatio: '3/4',
          background: 'var(--earth)',
          opacity: 0.3,
          borderRadius: 2,
        }} />
      </section>

      {/* Valores */}
      <section style={{ padding: '100px 6vw', background: 'var(--cream)' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16, textAlign: 'center' }}>
          O que nos move
        </p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, textAlign: 'center', marginBottom: 64 }}>
          Nossos valores
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, maxWidth: 960, margin: '0 auto' }}>
          {[
            { titulo: 'Conforto', texto: 'Descreva o valor de conforto da marca aqui.' },
            { titulo: 'Qualidade', texto: 'Descreva o compromisso com qualidade dos materiais.' },
            { titulo: 'Ritual', texto: 'Descreva a filosofia de tornar o descanso um ritual.' },
          ].map((v, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 1, background: 'var(--accent)', margin: '0 auto 24px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, marginBottom: 16 }}>{v.titulo}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--stone)' }}>{v.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* História */}
      <section style={{ padding: '100px 6vw', background: 'var(--sand)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>
            Como tudo começou
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 300, marginBottom: 40, lineHeight: 1.2 }}>
            &ldquo;Adicione aqui uma frase marcante da história da Aura.&rdquo;
          </h2>
          <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--earth)' }}>
            Escreva aqui o parágrafo de história da marca — como surgiu a ideia, quem são as fundadoras, o que inspirou a criação. Este é o espaço para conectar a cliente com o propósito da Aura Pijamas.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
