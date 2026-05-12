import { Footer } from '@/components/index'

const sections = [
  {
    title: 'Solicitação de troca ou devolução',
    content: 'Toda solicitação de troca ou devolução deve ser comunicada à Central de Atendimento para instruções detalhadas sobre o processo. No rodapé do site ou na página de Fale Conosco possui os dados de contato com a nossa central de atendimento.',
  },
  {
    title: 'Condições para troca, devolução ou arrependimento da compra',
    content: `O prazo máximo é de 7 dias após o recebimento do produto.\n\nA mercadoria deverá retornar nas mesmas condições em que foi entregue, ou seja: lacres intactos do fabricante e na embalagem original e com todos acessórios que acompanham o produto. É importante ressaltar que a caixa do produto também deve estar em perfeitas condições, isto é, a embalagem não pode ter sido danificada ou violada.\n\nEsclare-se que o produto NÃO PODE TER SIDO USADO.`,
  },
  {
    title: 'Envio para troca, devolução ou arrependimento da compra',
    content: `O custo de frete para o retorno da mercadoria será de responsabilidade da loja virtual, não tendo custo adicional ao consumidor.\n\nSendo necessário que o consumidor solicite a troca, devolução ou direito de arrependimento no prazo máximo de 7 dias após o recebimento da mercadoria.\n\nO fluxo de envio será explicado por nossa equipe de atendimento, onde irá depender da quantidade e tamanho do produto que será retornado.\n\nAtenção! Ao chegar o produto será analisado sua condição e caso seja constatado uso do produto, poderá ser recusado a troca ou devolução, sendo retornado o produto.`,
  },
  {
    title: 'Devolução do valor para cartão',
    content: `Após o recebimento do produto em nosso Centro de Distribuição e aprovação da devolução ou troca mediante análise dos itens, enviaremos a solicitação de estorno para a administradora do cartão de crédito que esta por sua vez tem o prazo para processar a requisição de acordo com a política de cada administradora de cartão de crédito.\n\nPoderá ocorrer do valor estornado ser devolvido em faturas futuras, sendo política da administradora de cartão.`,
  },
  {
    title: 'Devolução do valor — Boleto, Pix ou transferência',
    content: `A restituição do valor será processada após a aprovação da devolução mediante análise dos itens em nosso Centro de Distribuição e será realizada através de reembolso em uma conta corrente ou poupança.\n\nNo momento da solicitação da troca ou devolução deverá ser informado os dados bancários.`,
  },
]

export default function TrocasDevolucoesPage() {
  return (
    <>
      <section style={{ background: 'var(--bark)', padding: '80px 6vw 60px' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 16 }}>
          Políticas
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1 }}>
          Trocas e Devoluções
        </h1>
      </section>

      <section style={{ padding: '80px 6vw', maxWidth: 860, margin: '0 auto' }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 56 }}>
            <div style={{ width: 32, height: 1, background: 'var(--accent)', marginBottom: 20 }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, color: 'var(--dark)', marginBottom: 16 }}>
              {s.title}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--earth)', whiteSpace: 'pre-wrap' }}>
              {s.content}
            </p>
          </div>
        ))}

        <div style={{ background: 'var(--sand)', padding: '32px 40px', marginTop: 40 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 300, marginBottom: 8 }}>Ficou com dúvidas?</p>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--earth)' }}>
            Entre em contato com nossa central de atendimento. Os dados de contato estão disponíveis no rodapé do site ou na página de Fale Conosco.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
