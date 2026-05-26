import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Aura Pijamas <noreply@aurapijamas.com.br>'

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Aguardando pagamento',
  PAID:      'Pagamento confirmado',
  PREPARING: 'Em preparação',
  SHIPPED:   'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

const STATUS_ICONS: Record<string, string> = {
  PENDING:   '⏳',
  PAID:      '✅',
  PREPARING: '📦',
  SHIPPED:   '🚚',
  DELIVERED: '🎉',
  CANCELLED: '❌',
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Aura Pijamas</title>
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
        <!-- Card -->
        <tr><td style="background:#fff;border-radius:2px;padding:40px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="font-size:11px;color:#8C7B6B;margin:0;line-height:1.7;">
            Dúvidas? Responda este e-mail ou fale pelo WhatsApp:<br/>
            <a href="https://wa.me/5511922521920" style="color:#8C7B6B;">+55 11 92252-1920</a>
          </p>
          <p style="font-size:10px;color:#B5A899;margin:12px 0 0;">© 2026 Aura Pijamas · São Paulo, SP</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function enviarEmailConfirmacaoPedido(order: {
  id: string
  name: string
  email: string
  total: number
  address: string
  city: string
  state: string
  zipCode: string
  items: { quantity: number; price: number; size?: string | null; product: { name: string } }[]
}) {
  if (!process.env.RESEND_API_KEY) return

  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',')
  const shortId = order.id.slice(-8).toUpperCase()

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F5F0EB;font-size:14px;color:#2C2420;">
        ${item.product.name}${item.size ? ` <span style="color:#8C7B6B;font-size:12px;">· Tam. ${item.size}</span>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #F5F0EB;font-size:13px;color:#8C7B6B;text-align:center;">Qtd: ${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F5F0EB;font-size:14px;color:#8C7B6B;text-align:right;">${fmt(item.price * item.quantity)}</td>
    </tr>`).join('')

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:300;color:#2C2420;margin:0 0 8px;">Pedido recebido ✨</h1>
    <p style="font-size:13px;color:#8C7B6B;margin:0 0 32px;">Olá, ${order.name.split(' ')[0]}! Seu pedido foi confirmado.</p>

    <div style="background:#F5F0EB;padding:16px;margin-bottom:32px;border-radius:2px;">
      <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#8C7B6B;margin:0 0 4px;">Número do pedido</p>
      <p style="font-size:20px;font-family:monospace;color:#2C2420;margin:0;letter-spacing:0.1em;">#${shortId}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#8C7B6B;font-weight:400;padding-bottom:10px;text-align:left;border-bottom:1px solid #F5F0EB;">Produto</th>
          <th style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#8C7B6B;font-weight:400;padding-bottom:10px;text-align:center;border-bottom:1px solid #F5F0EB;">Qtd</th>
          <th style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#8C7B6B;font-weight:400;padding-bottom:10px;text-align:right;border-bottom:1px solid #F5F0EB;">Valor</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="text-align:right;margin-bottom:32px;">
      <span style="font-family:Georgia,serif;font-size:18px;color:#2C2420;">Total: ${fmt(order.total)}</span>
    </div>

    <div style="border-top:1px solid #F5F0EB;padding-top:24px;">
      <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8C7B6B;margin:0 0 8px;">Entrega para</p>
      <p style="font-size:14px;color:#2C2420;margin:0;line-height:1.7;">${order.address}<br/>${order.city}/${order.state} · CEP ${order.zipCode}</p>
    </div>

    <div style="background:#F5F0EB;padding:16px;margin-top:24px;border-radius:2px;text-align:center;">
      <p style="font-size:13px;color:#8C7B6B;margin:0;">Você receberá um e-mail quando seu pedido for enviado. 🌙</p>
    </div>`

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Pedido #${shortId} confirmado · Aura Pijamas`,
    html: baseTemplate(content),
  })
}

export async function enviarEmailAtualizacaoStatus(order: {
  id: string
  name: string
  email: string
  status: string
  trackingCode?: string | null
}) {
  if (!process.env.RESEND_API_KEY) return

  const shortId = order.id.slice(-8).toUpperCase()
  const label = STATUS_LABELS[order.status] ?? order.status
  const icon = STATUS_ICONS[order.status] ?? '📋'

  const trackingHtml = order.trackingCode ? `
    <div style="background:#F5F0EB;padding:16px;margin-top:24px;border-radius:2px;">
      <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8C7B6B;margin:0 0 4px;">Código de rastreio</p>
      <p style="font-size:16px;font-family:monospace;color:#2C2420;margin:0;letter-spacing:0.1em;">${order.trackingCode}</p>
    </div>` : ''

  const msgByStatus: Record<string, string> = {
    PAID:      'Ótima notícia! Recebemos a confirmação do seu pagamento. Seu pedido já está sendo preparado.',
    PREPARING: 'Seu pedido entrou na fila de preparação! Em breve será embalado com todo o cuidado.',
    SHIPPED:   'Seu pedido foi enviado! Acompanhe pelo código de rastreio abaixo.',
    DELIVERED: 'Seu pedido foi entregue! Esperamos que você ame seu novo pijama. 🌙',
    CANCELLED: 'Seu pedido foi cancelado. Se tiver alguma dúvida, entre em contato conosco.',
  }

  const msg = msgByStatus[order.status] ?? `O status do seu pedido foi atualizado para: ${label}.`

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:300;color:#2C2420;margin:0 0 8px;">${icon} ${label}</h1>
    <p style="font-size:13px;color:#8C7B6B;margin:0 0 32px;">Olá, ${order.name.split(' ')[0]}!</p>

    <div style="background:#F5F0EB;padding:20px;border-radius:2px;margin-bottom:24px;">
      <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8C7B6B;margin:0 0 4px;">Pedido</p>
      <p style="font-size:18px;font-family:monospace;color:#2C2420;margin:0;">#${shortId}</p>
    </div>

    <p style="font-size:14px;color:#4A3F35;line-height:1.7;margin:0;">${msg}</p>
    ${trackingHtml}`

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `${icon} Pedido #${shortId} · ${label} · Aura Pijamas`,
    html: baseTemplate(content),
  })
}
