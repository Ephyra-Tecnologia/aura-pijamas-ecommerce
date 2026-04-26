import { NextRequest, NextResponse } from 'next/server'
import { criarPedidoPagarme } from '@/lib/pagarme'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, shipping, cartItems } = body

    // Cria o pedido no Pagar.me
    const pagarmeOrder = await criarPedidoPagarme({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      items: items,
      shipping: shipping,
    })

    if (pagarmeOrder.status === 'failed') {
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 400 })
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

    // Retorna dados do Pix se for pagamento Pix
    const pixCharge = pagarmeOrder.charges?.[0]
    const pixData = pixCharge?.last_transaction

    return NextResponse.json({
      orderId: order.id,
      pagarmeOrderId: pagarmeOrder.id,
      pix: pixData ? {
        qrCode: pixData.qr_code,
        qrCodeUrl: pixData.qr_code_url,
        expiresAt: pixData.expires_at,
      } : null,
    })
  } catch (error) {
    console.error('Erro no pagamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}