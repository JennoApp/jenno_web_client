import { json } from '@sveltejs/kit'
import { PRIVATE_PAYPAL_CLIENTID } from '$env/static/private'


export async function GET() {
  return json({
    clientId: PRIVATE_PAYPAL_CLIENTID
  })
}
