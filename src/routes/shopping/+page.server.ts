import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      // Obtener la pagina actual
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = 10

      // Fetch the shopping list data
      const response = await fetch(`${PRIVATE_SERVER_URL}/users/shopping/${user?.sub}?page=${page}&limit=${limit}`)
      const { data, meta } = await response.json()

      // Fetch details for each product
      const products = await Promise.all(
        data.map(async (id: string) => {
          const productResponse = await fetch(`${PRIVATE_SERVER_URL}/orders/${id}`)
          return await productResponse.json()
        })
      )

      return {
        products,
        meta: meta,
        sucess: true
      }
    } else {
      return {
        sucess: false
      }
    }

  } catch (error: any) {
    return {
      error: error?.message,
      sucess: false
    }
  }
}
