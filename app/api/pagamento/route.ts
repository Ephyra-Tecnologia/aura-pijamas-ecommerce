import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { criarPedidoPagarme } from '@/lib/pagarme'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, cartItems, shipping, paymentMethod, total, parcelas = 1 } = body
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aurapijamas.com.br'

    // ─── Cartão de crédito via Stripe Checkout ───────────────────────────────
    if (paymentMethod === 'credit_card') {
      const stripe = getStripe()
      const SEM_JUROS = 3
      const TAXA_MENSAL = 0.0299

      let totalComJuros = total
      let valorParcela = total / parcelas
      let juros = 0
      if (parcelas > SEM_JUROS) {
        const r = TAXA_MENSAL
        const n = parcelas
        const pmt = total * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
        valorParcela = pmt
        totalComJuros = pmt * n
        juros = totalComJuros - total
      }

      const order = await prisma.order.create({
        data: {
          status: 'PENDING',
          total: totalComJuros,
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

      if (juros > 0) {
        lineItems.push({
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Juros de parcelamento (${parcelas}x · ${(TAXA_MENSAL * 100).toFixed(2).replace('.', ',')}%/mês)`,
            },
            unit_amount: Math.round(juros * 100),
          },
          quantity: 1,
        })
      }

      const parcelaLabel = `${parcelas}x de R$ ${valorParcela.toFixed(2).replace('.', ',')}${parcelas <= SEM_JUROS ? ' sem juros' : ` com juros de ${(TAXA_MENSAL * 100).toFixed(2).replace('.', ',')}%/mês`}`

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customer.email,
        line_items: lineItems,
        success_url: `${baseUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancelado`,
        metadata: { orderId: order.id, parcelas: String(parcelas) },
        payment_intent_data: { metadata: { orderId: order.id, parcelas: String(parcelas) } },
        custom_text: {
          submit: { message: `Parcelado em ${parcelaLabel}` },
        },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { pagarmeId: session.id },
      })

      return NextResponse.json({ checkoutUrl: session.url })
    }

    // ─── Pix via Pagar.me ─────────────────────────────────────────────────────
    const pmResult = await criarPedidoPagarme({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document ?? '',
      items: cartItems.map((item: any) => ({
        name: item.name,
        amount: Math.round(item.price * 100),
        quantity: item.qty,
      })),
      shipping: {
        amount: Math.round((shipping?.price || 0) * 100),
        address: {
          line_1: shipping.address.line_1 ?? '',
          zip_code: (shipping.address.zip_code ?? '').replace(/\D/g, ''),
          city: shipping.address.city ?? '',
          state: shipping.address.state ?? '',
          country: 'BR',
        },
      },
      paymentMethod: 'pix',
    })

    // Pagar.me retorna erros com status != pending/waiting_payment
    if (pmResult.status === 'failed' || pmResult.errors) {
      const errMsg = pmResult.message ?? pmResult.errors?.[0]?.message ?? 'Erro ao gerar Pix. Verifique seus dados e tente novamente.'
      console.error('PAGARME PIX ERRO:', JSON.stringify(pmResult, null, 2))
      return NextResponse.json({ error: errMsg }, { status: 400 })
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
        pagarmeId: pmResult.id,
        items: {
          create: cartItems.map((item: any) => ({
            quantity: item.qty,
            price: item.price,
            productId: String(item.id),
          })),
        },
      },
    })

    // Extrai QR code do Pagar.me
    const charge = pmResult.charges?.[0]
    const lastTx = charge?.last_transaction
    const qrCode = lastTx?.qr_code ?? null
    const qrCodeUrl = lastTx?.qr_code_url ?? null

    return NextResponse.json({
      orderId: order.id,
      pix: qrCode ? { qrCode, qrCodeUrl } : null,
    })

  } catch (error: any) {
    console.error('Erro no pagamento:', error)
    return NextResponse.json({ error: error?.message ?? 'Erro interno' }, { status: 500 })
  }
}
