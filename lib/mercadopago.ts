const MP_API = 'https://api.mercadopago.com'
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!

function mpHeaders(idempotencyKey?: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
  }
}

interface CartItem {
  id: string
  name: string
  qty: number
  price: number
}

interface PayerAddress {
  zipCode: string
  street: string
  number: string
  city: string
  state: string
}

interface PixData {
  amount: number
  email: string
  firstName: string
  lastName: string
  cpf: string
  phone?: string
  description: string
  items?: CartItem[]
  address?: PayerAddress
}

interface CartaoData {
  amount: number
  token: string
  installments: number
  paymentMethodId: string
  email: string
  firstName?: string
  lastName?: string
  cpf: string
  phone?: string
  description: string
  items?: CartItem[]
  address?: PayerAddress
}

function buildAdditionalInfo(data: { firstName?: string; lastName?: string; phone?: string; items?: CartItem[]; address?: PayerAddress }) {
  const phoneDigits = data.phone?.replace(/\D/g, '') ?? ''
  const areaCode = phoneDigits.slice(0, 2)
  const phoneNumber = phoneDigits.slice(2)

  return {
    items: (data.items ?? []).map(item => ({
      id: String(item.id),
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      category_id: 'fashion',
    })),
    payer: {
      first_name: data.firstName ?? '',
      last_name: data.lastName ?? '',
      ...(areaCode && phoneNumber ? { phone: { area_code: areaCode, number: phoneNumber } } : {}),
      ...(data.address ? {
        address: {
          zip_code: data.address.zipCode.replace(/\D/g, ''),
          street_name: data.address.street,
          street_number: data.address.number,
        }
      } : {}),
    },
    ...(data.address ? {
      shipments: {
        receiver_address: {
          zip_code: data.address.zipCode.replace(/\D/g, ''),
          street_name: data.address.street,
          street_number: data.address.number,
          city_name: data.address.city,
          state_name: data.address.state,
        }
      }
    } : {}),
  }
}

export async function criarPagamentoPix(data: PixData) {
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
      additional_info: buildAdditionalInfo(data),
    }),
  })
  const result = await res.json()
  console.log('MP PIX RESPONSE:', JSON.stringify(result, null, 2))
  return result
}

export async function criarPagamentoCartao(data: CartaoData) {
  const res = await fetch(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: mpHeaders(crypto.randomUUID()),
    body: JSON.stringify({
      transaction_amount: data.amount,
      description: data.description,
      token: data.token,
      installments: data.installments,
      payment_method_id: data.paymentMethodId,
      three_d_secure_mode: 'optional',
      payer: {
        email: data.email,
        first_name: data.firstName ?? '',
        last_name: data.lastName ?? '',
        identification: { type: 'CPF', number: data.cpf.replace(/\D/g, '') },
      },
      additional_info: buildAdditionalInfo(data),
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
