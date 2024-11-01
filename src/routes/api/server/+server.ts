import { json } from '@sveltejs/kit'
import { PRIVATE_SERVER_URL } from '$env/static/private'


export async function GET() {
  return json({
    server_url: PRIVATE_SERVER_URL
  })
}
