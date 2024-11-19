import { json } from '@sveltejs/kit'
import { PRIVATE_SOCKET_URL } from '$env/static/private'


export async function GET() {
  return json({
    socket_url: PRIVATE_SOCKET_URL
  })
}
