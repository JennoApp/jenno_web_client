import { PRIVATE_MERCADOPAGO_ACCESS_TOKEN } from '$env/static/private'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import type { RequestHandler } from '@sveltejs/kit'

// Configuración de credenciales de MercadoPago

const client = new MercadoPagoConfig({
  accessToken: PRIVATE_MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'idempotencyKey'
  }
})

const preference = new Preference(client)

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json()

    const externalReference = `order_${Date.now()}_${Math.floor(Math.random()*1000)}`;

    const now = new Date()
    const expirationDateFrom = now.toISOString()
    const expirationDateTo = new Date(now.getTime() + 10 * 60 * 1000).toISOString() // 10 minutes from now

    const preferenceBody = {
      external_reference: externalReference,
      items: body.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        currency_id: 'COP',
        unit_price: item.unit_price
      })),
      payer: {
        email: body.email,
      },
      back_urls: {
        success: 'https://www.jenno.com.co/cart/success',
        failure: 'https://www.jenno.com.co/cart/failure',
        pending: 'https://www.jenno.com.co/cart/pending'
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [
          {
            id: 'ticket'
          }
        ]
      },
      expires: true,
      expiration_date_from: expirationDateFrom,
      expiration_date_to: expirationDateTo,
    }

    const response = await preference.create({
      body: preferenceBody
    })

    return new Response(JSON.stringify({
      init_point: response.init_point,
      external_reference: externalReference,
    }),
      { status: 200 })
  } catch (error: any) {
    console.error('Error creando preferencia Mercado Pago:', error)
    return new Response(JSON.stringify({
      error: error.message
    }),
      {
        status: 500
      })
  }
}
