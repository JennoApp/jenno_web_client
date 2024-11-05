import { json } from '@sveltejs/kit'
import { PRIVATE_POSITIONSTACK_ACCESS_KEY } from '$env/static/private'


export async function GET() {
  return json({
    accessKey: PRIVATE_POSITIONSTACK_ACCESS_KEY
  })
}
