import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, fetch }) => {
  const response = await fetch(`http://localhost:3000/products/${params.productid}`)

  const data = await response.json()

  return {
    product: data
  }
}