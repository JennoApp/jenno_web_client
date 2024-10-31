import type { PageServerLoad } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const load: PageServerLoad = async ({ params, fetch }) => {
  const response = await fetch(`${PRIVATE_SERVER_URL}/products/${params.productid}`)

  const data = await response.json()

  return {
    product: data
  }
}
