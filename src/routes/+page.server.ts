import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, url}) => {

  const limit: number = 20
  
  const response = await fetch(`http://localhost:3000/products?page=${1}&limit=${limit}`)

  if (!response.ok) {
    return {
      status: response.status,
      error: new Error(response.statusText)
    }
  }


  const { data, meta } = await response.json()

  return {
    products: data,
    meta
  }
}