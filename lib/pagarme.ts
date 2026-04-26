const PAGARME_API = 'https://api.pagar.me/core/v5'
const SECRET_KEY = process.env.PAGARME_SECRET_KEY!
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${Buffer.from(SECRET_KEY + ':').toString('base64')}`,
}

export async function criarPedidoPagarme(data: {
  name: string
  email: string
  phone: string
  document: string
  items: { name: string; amount: number; quantity: number }[]
  shipping: { amount: number; address: { line_1: string; zip_code: string; city: string; state: string; country: string } }
}) {
  const res = await fetch(`${PAGARME_API}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer: {
        name: data.name,
        email: data.email,
        type: 'individual',
        document: data.document.replace(/\D/g, ''),
        phones: {
          mobile_phone: {
            country_code: '55',
            area_code: data.phone.replace(/\D/g, '').slice(0, 2),
            number: data.phone.replace(/\D/g, '').slice(2),
          }
        }
      },
      items: data.items.map(item => ({
        amount: item.amount,
        description: item.name,
        quantity: item.quantity,
        code: item.name.toLowerCase().replace(/\s/g, '-'),
      })),
      shipping: {
        amount: data.shipping.amount,
        description: 'Entrega',
        address: data.shipping.address,
      },
      payments: [{
        payment_method: 'pix',
        pix: { expires_in: 3600 }
      }]
    })
  })
  const result = await res.json()
  console.log('PAGARME RESPONSE:', JSON.stringify(result, null, 2))
  return result
}

export async function criarCobrancaCartao(orderId: string, cardData: {
  number: string
  holder_name: string
  exp_month: number
  exp_year: number
  cvv: string
  installments: number
  amount: number
}) {
  const res = await fetch(`${PAGARME_API}/orders/${orderId}/charges`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      payment_method: 'credit_card',
      amount: cardData.amount,
      installments: cardData.installments,
      credit_card: {
        installments: cardData.installments,
        card: {
          number: cardData.number,
          holder_name: cardData.holder_name,
          exp_month: cardData.exp_month,
          exp_year: cardData.exp_year,
          cvv: cardData.cvv,
        }
      }
    })
  })
  return res.json()
}