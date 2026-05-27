'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const TEMPLATE_BASE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:'Helvetica Neue',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="font-family:Georgia,serif;font-size:28px;font-weight:300;letter-spacing:0.15em;color:#2C2420;margin:0;">AURA</p>
          <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8C7B6B;margin:4px 0 0;">Pijamas</p>
        </td></tr>

        <!-- Conteúdo -->
        <tr><td style="background:#fff;border-radius:2px;padding:40px;">

          <!-- Imagem (opcional) -->
          <!-- <img src="URL_DA_IMAGEM" alt="" style="width:100%;margin-bottom:24px;"/> -->

          <!-- Título -->
          <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:300;color:#2C2420;margin:0 0 16px;">Título da mensagem</h1>

          <!-- Texto -->
          <p style="font-size:14px;color:#4A3F35;line-height:1.8;margin:0 0 24px;">
            Escreva sua mensagem aqui. Você pode usar HTML para formatar o conteúdo.
          </p>

          <!-- Botão (opcional) -->
          <a href="https://aurapijamas.com.br" style="display:inline-block;background:#2C2420;color:#F5F0EB;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">
            Ver coleção
          </a>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="font-size:11px;color:#8C7B6B;margin:0;line-height:1.7;">
            Dúvidas? Fale pelo WhatsApp:
            <a href="https://wa.me/5511922521920" style="color:#8C7B6B;">+55 11 92252-1920</a>
          </p>
          <p style="font-size:10px;color:#B5A899;margin:12px 0 0;">© 2026 Aura Pijamas · São Paulo, SP</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

type Segment = 'all' | 'buyers' | 'newsletter_only'

const SEGMENT_LABELS: Record<Segment, string> = {
  all:              'Todos',
  buyers:           '🛍 Compradores',
  newsletter_only:  '💌 Só newsletter',
}

function NewsletterForm() {
  const searchParams = useSearchParams()
  const idsParam   = searchParams.get('ids')
  const segParam   = (searchParams.get('segment') as Segment) || 'all'

  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState(TEMPLATE_BASE)
  const [tab, setTab] = useState<'editor' | 'preview'>('editor')
  const [segment, setSegment] = useState<Segment>(idsParam ? 'all' : segParam)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [error, setError] = useState('')
  const [counts, setCounts] = useState<Record<Segment, number>>({ all: 0, buyers: 0, newsletter_only: 0 })
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    fetch('/api/admin/clientes')
      .then(r => r.json())
      .then((data: any[]) => {
        setCounts({
          all: data.length,
          buyers: data.filter(c => c.hasPurchased).length,
          newsletter_only: data.filter(c => c.source === 'newsletter' && !c.hasPurchased).length,
        })
      })
  }, [])

  useEffect(() => {
    if (tab === 'preview' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) { doc.open(); doc.write(html); doc.close() }
    }
  }, [tab, html])

  const recipientCount = idsParam ? idsParam.split(',').length : counts[segment]

  const send = async () => {
    if (!subject.trim()) { setError('Insira o assunto do e-mail.'); return }
    if (!html.trim()) { setError('O conteúdo está vazio.'); return }
    setError('')
    setSending(true)
    setResult(null)

    const body: any = { subject, html }
    if (idsParam) body.recipientIds = idsParam.split(',')
    else body.segment = segment

    const res = await fetch('/api/admin/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setError(data.error || 'Erro ao enviar.'); return }
    setResult(data)
  }

  const insertImg = () => {
    const url = prompt('URL da imagem:')
    if (!url) return
    const tag = `<img src="${url}" alt="" style="width:100%;margin-bottom:24px;display:block;"/>`
    setHtml(h => h.replace('<!-- <img src="URL_DA_IMAGEM"', tag + '\n          <!-- <img src="URL_DA_IMAGEM"'))
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px', background: active ? '#2C2420' : 'transparent',
    color: active ? '#fff' : '#8C7B6B', border: '1px solid #e8ddd0',
    cursor: 'pointer', fontSize: 12, letterSpacing: '0.08em',
  })

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 300, color: '#2C2420', margin: 0 }}>Enviar Newsletter</h1>
        <p style={{ fontSize: 13, color: '#8C7B6B', margin: '4px 0 0' }}>
          {idsParam
            ? `${recipientCount} destinatário(s) selecionados manualmente`
            : `${recipientCount} destinatário(s) · segmento: ${SEGMENT_LABELS[segment]}`}
        </p>
      </div>

      {/* Segmento — só aparece se não veio com IDs fixos */}
      {!idsParam && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
          {(Object.keys(SEGMENT_LABELS) as Segment[]).map(s => (
            <button key={s} onClick={() => setSegment(s)}
              style={{ padding: '8px 18px', background: segment === s ? '#2C2420' : 'transparent', color: segment === s ? '#fff' : '#8C7B6B', border: '1px solid #e8ddd0', cursor: 'pointer', fontSize: 12, letterSpacing: '0.08em' }}>
              {SEGMENT_LABELS[s]} ({counts[s]})
            </button>
          ))}
        </div>
      )}

      {result ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 24, borderRadius: 2, marginBottom: 24 }}>
          <p style={{ fontSize: 16, color: '#16a34a', margin: 0 }}>✅ Newsletter enviada!</p>
          <p style={{ fontSize: 13, color: '#4A3F35', margin: '8px 0 0' }}>
            {result.sent} enviado{result.sent !== 1 ? 's' : ''} com sucesso
            {result.failed > 0 ? ` · ${result.failed} falha(s)` : ''}
          </p>
          <button onClick={() => { setResult(null); setSubject(''); setHtml(TEMPLATE_BASE) }}
            style={{ marginTop: 16, padding: '10px 20px', background: '#2C2420', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, letterSpacing: '0.1em' }}>
            Nova campanha
          </button>
        </div>
      ) : (
        <>
          {/* Assunto */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C7B6B', display: 'block', marginBottom: 6 }}>Assunto do e-mail</label>
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Ex: Novidades da Aura Pijamas 🌙"
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e8ddd0', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#2C2420' }}
            />
          </div>

          {/* Tabs + ações */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 0 }}>
              <button style={btnStyle(tab === 'editor')} onClick={() => setTab('editor')}>✏ Editor HTML</button>
              <button style={btnStyle(tab === 'preview')} onClick={() => setTab('preview')}>👁 Preview</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={insertImg} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #e8ddd0', fontSize: 12, color: '#8C7B6B', cursor: 'pointer' }}>
                🖼 Inserir imagem
              </button>
              <button onClick={() => setHtml(TEMPLATE_BASE)} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #e8ddd0', fontSize: 12, color: '#8C7B6B', cursor: 'pointer' }}>
                ↺ Restaurar template
              </button>
            </div>
          </div>

          {/* Editor */}
          {tab === 'editor' && (
            <textarea
              value={html} onChange={e => setHtml(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%', height: 480, padding: 16, border: '1px solid #e8ddd0',
                fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box', color: '#2C2420', background: '#faf7f4',
              }}
            />
          )}

          {/* Preview */}
          {tab === 'preview' && (
            <iframe
              ref={iframeRef}
              style={{ width: '100%', height: 480, border: '1px solid #e8ddd0', background: '#fff' }}
              title="Preview"
            />
          )}

          {error && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 8 }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={send} disabled={sending}
              style={{ padding: '14px 32px', background: sending ? '#8C7B6B' : '#2C2420', color: '#fff', border: 'none', cursor: sending ? 'not-allowed' : 'pointer', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {sending ? 'Enviando...' : `✉ Enviar newsletter`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function NewsletterPage() {
  return (
    <Suspense>
      <NewsletterForm />
    </Suspense>
  )
}
