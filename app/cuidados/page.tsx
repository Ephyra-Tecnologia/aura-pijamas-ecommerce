import Link from 'next/link'

export default function CuidadosPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px, 8vw, 96px) clamp(24px, 6vw, 48px)' }}>

        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>
          Informações
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 300, color: 'var(--dark)', marginBottom: 48, lineHeight: 1.2 }}>
          Cuidados com as peças
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <section>
            <p style={{ fontSize: 15, color: 'var(--dark)', lineHeight: 1.9 }}>
              Queremos que você tenha a melhor experiência possível com os Pijamas Aura. Por isso, as garantias são dadas diretamente pelos fabricantes e variam para cada item — você pode conferir os prazos e condições na própria página do produto. Ficou com alguma dúvida? É só falar com a gente!
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, color: 'var(--dark)', marginBottom: 16 }}>
              Trocas e devoluções
            </h2>
            <p style={{ fontSize: 15, color: 'var(--dark)', lineHeight: 1.9 }}>
              Se precisar devolver algo, o produto deve ser enviado de volta em sua embalagem original. Vale lembrar que, se nossa equipe técnica constatar mau uso do produto — o que inclui o descumprimento das instruções de lavagem indicadas na etiqueta de composição da peça — o custo do envio será por conta do comprador.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, color: 'var(--dark)', marginBottom: 16 }}>
              Como conservar suas peças
            </h2>
            <p style={{ fontSize: 15, color: 'var(--dark)', lineHeight: 1.9 }}>
              Para garantir a durabilidade das suas peças e evitar danos, recomendamos sempre checar a etiqueta antes de lavar. Use a máquina no nível leve e não misture com outras cores fortes que possam migrar para o seu pijama Aura.
            </p>
          </section>

        </div>

        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--sand)', display: 'flex', gap: 24 }}>
          <Link href="/trocas-devolucoes" style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--earth)', textDecoration: 'none', borderBottom: '1px solid var(--stone)', paddingBottom: 2 }}>
            Trocas e devoluções →
          </Link>
          <Link href="/" style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', textDecoration: 'none' }}>
            Voltar para a loja
          </Link>
        </div>

      </div>
    </div>
  )
}
