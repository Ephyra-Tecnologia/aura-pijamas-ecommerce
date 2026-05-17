import { NextRequest, NextResponse } from 'next/server'
import { criarPedidoPagarme } from '@/lib/pagarme'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, shipping, cartItems, paymentMethod, cardData } = body

    // Cria o pedido no Pagar.me
    const pagarmeOrder = await criarPedidoPagarme({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      items: items,
      shipping: shipping,
      paymentMethod: paymentMethod ?? 'pix',
      cardData: cardData,
    })

    if (!pagarmeOrder.id) {
      console.error('Pagar.me error:', pagarmeOrder)
      const msg = pagarmeOrder.message ?? pagarmeOrder.errors?.[0]?.message ?? 'Erro ao criar pedido no Pagar.me'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (pagarmeOrder.status === 'failed') {
      const failedCharge = pagarmeOrder.charges?.[0]
      const failedTx = failedCharge?.last_transaction
      const detail = failedTx?.acquirer_message ?? failedTx?.gateway_response?.errors?.[0]?.message ?? failedCharge?.status ?? 'recusado'
      console.error('Pagar.me charge failed:', JSON.stringify(failedTx, null, 2))
      return NextResponse.json({ error: `Pagamento recusado: ${detail}` }, { status: 400 })
    }

    // Salva o pedido no banco
    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
        total: body.total,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        zipCode: shipping.address.zip_code,
        address: shipping.address.line_1,
        city: shipping.address.city,
        state: shipping.address.state,
        pagarmeId: pagarmeOrder.id,
        items: {
          create: cartItems.map((item: any) => ({
            quantity: item.qty,
            price: item.price,
            productId: String(item.id),
          }))
        }
      }
    })

    const charge = pagarmeOrder.charges?.[0]
    const lastTransaction = charge?.last_transaction

    const pix = paymentMethod === 'pix' && lastTransaction ? {
      qrCode: lastTransaction.qr_code,
      qrCodeUrl: lastTransaction.qr_code_url,
      expiresAt: lastTransaction.expires_at,
    } : null

    const cardStatus = paymentMethod === 'credit_card' ? {
      status: charge?.status ?? pagarmeOrder.status,
      authCode: lastTransaction?.acquirer_auth_code,
    } : null

    return NextResponse.json({
      orderId: order.id,
      pagarmeOrderId: pagarmeOrder.id,
      pix,
      card: cardStatus,
    })
  } catch (error) {
    console.error('Erro no pagamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}