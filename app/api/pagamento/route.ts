import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, cartItems, shipping, paymentMethod, total } = body
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aurapijamas.com.br'

    // ─── Cartão de crédito via Stripe Checkout ───────────────────────────────
    if (paymentMethod === 'credit_card') {
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
        payment_intent_data: {
          metadata: { orderId: order.id },
        },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { pagarmeId: session.id },
      })

      return NextResponse.json({ checkoutUrl: session.url })
    }

    // ─── Pix via Stripe Payment Intent ───────────────────────────────────────
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'brl',
      payment_method_types: ['pix'],
      confirm: true,
      payment_method_data: { type: 'pix' },
      return_url: `${baseUrl}/checkout/sucesso`,
      payment_method_options: {
        pix: { expires_after_seconds: 3600 },
      },
    })

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
        pagarmeId: intent.id,
        items: {
          create: cartItems.map((item: any) => ({
            quantity: item.qty,
            price: item.price,
            productId: String(item.id),
          })),
        },
      },
    })

    const pixAction = (intent as any).next_action?.pix_display_qr_code

    return NextResponse.json({
      orderId: order.id,
      pix: pixAction
        ? {
            qrCode: pixAction.data,
            qrCodeUrl: pixAction.image_url_png,
          }
        : null,
    })
  } catch (error: any) {
    console.error('Erro no pagamento Stripe:', error)
    return NextResponse.json(
      { error: error?.message ?? 'Erro interno ao processar pagamento' },
      { status: 500 }
    )
  }
}
