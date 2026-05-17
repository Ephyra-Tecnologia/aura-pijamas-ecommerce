import { NextRequest, NextResponse } from 'next/server'
import { criarPagamentoPix, criarPagamentoCartao } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, cartItems, shipping, paymentMethod, cardToken, paymentMethodId, total } = body

    const description = cartItems.map((i: any) => i.name).join(', ').slice(0, 100)
    const [firstName, ...rest] = (customer.name as string).trim().split(' ')
    const lastName = rest.join(' ') || firstName

    let mpPayment: any

    if (paymentMethod === 'pix') {
      mpPayment = await criarPagamentoPix({
        amount: total,
        email: customer.email,
        firstName,
        lastName,
        cpf: customer.document,
        description,
      })
    } else {
      mpPayment = await criarPagamentoCartao({
        amount: total,
        token: cardToken,
        installments: body.installments ?? 1,
        paymentMethodId: paymentMethodId ?? 'visa',
        email: customer.email,
        cpf: customer.document,
        description,
      })
    }

    if (mpPayment.error || mpPayment.status === 'rejected') {
      const detail = mpPayment.message ?? mpPayment.cause?.[0]?.description ?? 'Pagamento recusado'
      return NextResponse.json({ error: detail }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        status: mpPayment.status === 'approved' ? 'PAID' : 'PENDING',
        total,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        zipCode: shipping.address.zip_code,
        address: shipping.address.line_1,
        city: shipping.address.city,
        state: shipping.address.state,
        pagarmeId: String(mpPayment.id),
        items: {
          create: cartItems.map((item: any) => ({
            quantity: item.qty,
            price: item.price,
            productId: String(item.id),
          }))
        }
      }
    })

    const pixData = paymentMethod === 'pix'
      ? mpPayment.point_of_interaction?.transaction_data
      : null

    const cardStatus = paymentMethod === 'credit_card'
      ? { status: mpPayment.status, statusDetail: mpPayment.status_detail }
      : null

    return NextResponse.json({
      orderId: order.id,
      mpPaymentId: mpPayment.id,
      pix: pixData ? {
        qrCode: pixData.qr_code,
        qrCodeUrl: `data:image/png;base64,${pixData.qr_code_base64}`,
      } : null,
      card: cardStatus,
    })
  } catch (error) {
    console.error('Erro no pagamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
