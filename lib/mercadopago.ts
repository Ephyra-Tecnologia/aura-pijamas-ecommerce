const MP_API = 'https://api.mercadopago.com'
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!

function mpHeaders(idempotencyKey?: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
  }
}

export async function criarPagamentoPix(data: {
  amount: number
  email: string
  firstName: string
  lastName: string
  cpf: string
  description: string
}) {
  const res = await fetch(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: mpHeaders(crypto.randomUUID()),
    body: JSON.stringify({
      transaction_amount: data.amount,
      description: data.description,
      payment_method_id: 'pix',
      payer: {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        identification: { type: 'CPF', number: data.cpf.replace(/\D/g, '') },
      },
    }),
  })
  const result = await res.json()
  console.log('MP PIX RESPONSE:', JSON.stringify(result, null, 2))
  return result
}

export async function criarPagamentoCartao(data: {
  amount: number
  token: string
  installments: number
  paymentMethodId: string
  email: string
  cpf: string
  description: string
}) {
  const res = await fetch(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: mpHeaders(crypto.randomUUID()),
    body: JSON.stringify({
      transaction_amount: data.amount,
      description: data.description,
      token: data.token,
      installments: data.installments,
      payment_method_id: data.paymentMethodId,
      payer: {
        email: data.email,
        identification: { type: 'CPF', number: data.cpf.replace(/\D/g, '') },
      },
    }),
  })
  const result = await res.json()
  console.log('MP CARD RESPONSE:', JSON.stringify(result, null, 2))
  return result
}

export async function buscarPagamento(paymentId: string) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: mpHeaders(),
  })
  return res.json()
}
