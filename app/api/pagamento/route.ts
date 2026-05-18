import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { criarPagamentoPix } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, cartItems, shipping, paymentMethod, total } = body
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aurapijamas.com.br'

    // ─── Cartão de crédito via Stripe Checkout ───────────────────────────────
    if (paymentMethod === 'credit_card') {
      const stripe = getStripe()

      const order = await prisma.order.create({
        data: {
          status: 'PENDING',
          total,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          zipCode: shipping.address.zip_code,
          address: shipping.address.line_1,
          city: shipping.address.city,
          state: shipping.address.state,
          pagarmeId: 'stripe_pending',
          items: {
            create: cartItems.map((item: any) => ({
              quantity: item.qty,
              price: item.price,
              productId: String(item.id),
            })),
          },
        },
      })

      const lineItems: any[] = cartItems.map((item: any) => ({
        price_data: {
          currency: 'brl',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      }))

      if (shipping.price > 0) {
        lineItems.push({
          price_data: {
            currency: 'brl',
            product_data: { name: shipping.method ?? 'Frete' },
            unit_amount: Math.round(shipping.price * 100),
          },
          quantity: 1,
        })
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customer.email,
        line_items: lineItems,
        success_url: `${baseUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancelado`,
        metadata: { orderId: order.id },
        payment_intent_data: { metadata: { orderId: order.id } },
        payment_method_options: {
          card: {
            installments: { enabled: true },
          },
        },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { pagarmeId: session.id },
      })

      return NextResponse.json({ checkoutUrl: session.url })
    }

    // ─── Pix via MercadoPago ──────────────────────────────────────────────────
    const [firstName, ...rest] = (customer.name as string).trim().split(' ')
    const lastName = rest.join(' ') || firstName
    const description = cartItems.map((i: any) => i.name).join(', ').slice(0, 100)

    const mpPayment = await criarPagamentoPix({
      amount: total,
      email: customer.email,
      firstName,
      lastName,
      cpf: customer.document ?? '',
      phone: customer.phone,
      description,
      items: cartItems.map((i: any) => ({ id: String(i.id), name: i.name, qty: i.qty, price: i.price })),
      address: shipping?.address ? {
        zipCode: shipping.address.zip_code ?? '',
        street: shipping.address.line_1 ?? '',
        number: '',
        city: shipping.address.city ?? '',
        state: shipping.address.state ?? '',
      } : undefined,
    })

    if (mpPayment.error || mpPayment.status === 'rejected') {
      const detail = mpPayment.status_detail ?? mpPayment.cause?.[0]?.description ?? mpPayment.message ?? 'Pagamento recusado'
      return NextResponse.json({ error: detail }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
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
          })),
        },
      },
    })

    const pixData = mpPayment.point_of_interaction?.transaction_data

    return NextResponse.json({
      orderId: order.id,
      pix: pixData ? {
        qrCode: pixData.qr_code,
        qrCodeUrl: `data:image/png;base64,${pixData.qr_code_base64}`,
      } : null,
    })
  } catch (error: any) {
    console.error('Erro no pagamento:', error)
    return NextResponse.json({ error: error?.message ?? 'Erro interno' }, { status: 500 })
  }
}
