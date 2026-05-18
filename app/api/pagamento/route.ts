import { NextRequest, NextResponse } from 'next/server'
import { criarPagamentoPix, criarPreferencia } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, cartItems, shipping, paymentMethod, total } = body

    const [firstName, ...rest] = (customer.name as string).trim().split(' ')
    const lastName = rest.join(' ') || firstName

    const itemsInfo = cartItems.map((i: any) => ({
      id: String(i.id),
      name: i.name,
      qty: i.qty,
      price: i.price,
    }))

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
          pagarmeId: 'checkout_pro_pending',
          items: {
            create: cartItems.map((item: any) => ({
              quantity: item.qty,
              price: item.price,
              productId: String(item.id),
            }))
          }
        }
      })

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aurapijamas.com.br'
      const preference = await criarPreferencia({
        items: itemsInfo,
        payer: { email: customer.email, firstName, lastName, cpf: customer.document, phone: customer.phone },
        externalReference: order.id,
        baseUrl,
        notificationUrl: `${baseUrl}/api/pagamento/webhook`,
      })

      if (preference.error || !preference.init_point) {
        await prisma.order.delete({ where: { id: order.id } })
        return NextResponse.json({ error: preference.message ?? 'Erro ao criar preferência' }, { status: 400 })
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { pagarmeId: preference.id },
      })

      return NextResponse.json({ checkoutUrl: preference.init_point })
    }

    // PIX
    const description = cartItems.map((i: any) => i.name).join(', ').slice(0, 100)
    const addressInfo = shipping?.address ? {
      zipCode: shipping.address.zip_code ?? '',
      street: shipping.address.line_1 ?? '',
      number: '',
      city: shipping.address.city ?? '',
      state: shipping.address.state ?? '',
    } : undefined

    const mpPayment = await criarPagamentoPix({
      amount: total,
      email: customer.email,
      firstName,
      lastName,
      cpf: customer.document,
      phone: customer.phone,
      description,
      items: itemsInfo,
      address: addressInfo,
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
          }))
        }
      }
    })

    const pixData = mpPayment.point_of_interaction?.transaction_data

    return NextResponse.json({
      orderId: order.id,
      pix: pixData ? {
        qrCode: pixData.qr_code,
        qrCodeUrl: `data:image/png;base64,${pixData.qr_code_base64}`,
      } : null,
    })
  } catch (error) {
    console.error('Erro no pagamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
