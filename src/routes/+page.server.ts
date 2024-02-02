import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch('http://localhost:3000/products')

  const data = await response.json()

  return {
    products: data
  }
}