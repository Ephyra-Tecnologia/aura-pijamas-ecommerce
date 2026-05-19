import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { criarPagamentoPix } from '@/lib/mercadopago'
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

      // Calcula juros se necessário
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
          total: totalComJuros, // salva o total real cobrado
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

      // Line items: produtos + frete + juros (se houver)
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

      // Texto de parcelamento visível na tela do Stripe
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
      // Log completo para diagnóstico
      const causeCode = mpPayment.cause?.[0]?.code
      const causeDesc = mpPayment.cause?.[0]?.description
      console.error('MP PIX ERRO:', JSON.stringify({
        status: mpPayment.status,
        status_detail: mpPayment.status_detail,
        error: mpPayment.error,
        message: mpPayment.message,
        cause: mpPayment.cause,
      }, null, 2))

      // Mapeia erros do MP para mensagens claras em português
      const MP_ERRORS: Record<string, string> = {
        '2072': 'Não foi possível verificar a identidade financeira do pagador. Tente com outro e-mail ou entre em contato conosco.',
        '2001': 'CPF inválido ou não encontrado. Verifique o número informado.',
        '2067': 'E-mail inválido para pagamento Pix.',
        '2073': 'Identidade do pagador não verificada. Confirme seus dados e tente novamente.',
        'cc_rejected_bad_filled_security_code': 'Código de segurança do cartão incorreto.',
        'cc_rejected_blacklist': 'Pagamento não autorizado. Entre em contato com seu banco.',
        'cc_rejected_insufficient_amount': 'Saldo insuficiente.',
      }

      const userMsg = (causeCode && MP_ERRORS[String(causeCode)])
        ?? MP_ERRORS[mpPayment.status_detail ?? '']
        ?? causeDesc
        ?? mpPayment.message
        ?? 'Pagamento recusado. Tente novamente ou escolha outra forma de pagamento.'

      return NextResponse.json({ error: userMsg }, { status: 400 })
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
