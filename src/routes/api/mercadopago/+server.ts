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

    const preferenceBody = {
      external_reference: externalReference,
      notification_url: 'https://www.jenno.com.co/api/webhook/mercadopago',
      items: body.items.map((item: any) => ({
        id: item.productId,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        currency_id: 'COP',
        unit_price: item.price
      })),
      payer: {
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
      },
      back_urls: {
        success: 'https://www.jenno.com.co/cart/success',
        failure: 'https://www.jenno.com.co/failure',
        pending: 'https://www.jenno.com.co/pending'
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [
          {
            id: 'ticket'
          }
        ]
      },
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
