import { NextRequest, NextResponse } from 'next/server'
import { criarPedidoPagarme } from '@/lib/pagarme'
import { prisma } from '@/lib/prisma'
import { enviarEmailConfirmacaoPedido } from '@/lib/email'

async function decrementarEstoque(cartItems: { id: string | number; size?: string; qty: number }[]) {
  for (const item of cartItems) {
    const product = await prisma.product.findUnique({ where: { id: String(item.id) } })
    if (!product) continue
    const sizes = (product.sizes as { size: string; quantity: number }[] | null) ?? []
    const updatedSizes = sizes.map(s =>
      s.size === item.size ? { ...s, quantity: Math.max(0, s.quantity - item.qty) } : s
    )
    const newStock = updatedSizes.reduce((acc, s) => acc + s.quantity, 0)
    await prisma.product.update({
      where: { id: String(item.id) },
      data: { sizes: updatedSizes, stock: newStock },
    })
  }
}

const SEM_JUROS = 3
const TAXA_MENSAL = 0.0299

function calcParcelas(total: number, n: number) {
  if (n <= SEM_JUROS) return { totalComJuros: total, valorParcela: total / n, juros: 0 }
  const r = TAXA_MENSAL
  const pmt = total * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  const totalComJuros = pmt * n
  return { totalComJuros, valorParcela: pmt, juros: totalComJuros - total }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, cartItems, shipping, paymentMethod, total, parcelas = 1, cardData } = body

    if (!process.env.PAGARME_SECRET_KEY) {
      console.error('PAGARME_SECRET_KEY não configurada')
      return NextResponse.json({ error: 'Gateway de pagamento não configurado. Entre em contato conosco.' }, { status: 500 })
    }

    // ─── Cartão via Pagar.me (parcelamento real) ──────────────────────────────
    if (paymentMethod === 'credit_card') {
      if (!cardData) {
        return NextResponse.json({ error: 'Dados do cartão não informados.' }, { status: 400 })
      }

      const { totalComJuros } = calcParcelas(total, parcelas)

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
        paymentMethod: 'credit_card',
        cardData: {
          number: cardData.number,
          holder_name: cardData.holder_name,
          exp_month: cardData.exp_month,
          exp_year: cardData.exp_year,
          cvv: cardData.cvv,
          installments: parcelas,
        },
      })

      if (!pmResult.id || pmResult.status === 'failed' || pmResult.errors || pmResult.type === 'invalid_request_error') {
        console.error('PAGARME CARTÃO ERRO:', JSON.stringify(pmResult, null, 2))
        const errMsg = pmResult.message ?? pmResult.errors?.[0]?.message ?? 'Pagamento recusado. Verifique os dados do cartão e tente novamente.'
        return NextResponse.json({ error: errMsg }, { status: 400 })
      }

      const order = await prisma.order.create({
        data: {
          status: pmResult.status === 'paid' ? 'PAID' : 'PENDING',
          total: totalComJuros,
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
              size: item.size ?? null,
              productId: String(item.id),
            })),
          },
        },
        include: { items: { include: { product: true } } },
      })

      enviarEmailConfirmacaoPedido(order).catch(console.error)

      // Decrementa estoque imediatamente para cartão
      decrementarEstoque(cartItems).catch(console.error)

      // Cartão aprovado na hora
      if (pmResult.status === 'paid') {
        return NextResponse.json({ orderId: order.id, paid: true })
      }

      // Pendente (raro em cartão, mas possível)
      return NextResponse.json({ orderId: order.id, paid: false })
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

    if (!pmResult.id || pmResult.status === 'failed' || pmResult.errors || pmResult.type === 'invalid_request_error') {
      console.error('PAGARME PIX ERRO:', JSON.stringify(pmResult, null, 2))
      const errMsg = pmResult.message ?? pmResult.errors?.[0]?.message ?? 'Erro ao gerar Pix. Verifique seus dados e tente novamente.'
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
            size: item.size ?? null,
            productId: String(item.id),
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    enviarEmailConfirmacaoPedido(order).catch(console.error)

    // Decrementa estoque ao gerar o PIX (reserva o item)
    decrementarEstoque(cartItems).catch(console.error)

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
