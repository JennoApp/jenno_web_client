import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      // Fetch the shopping list data
      const response = await fetch(`http://localhost:3000/users/shopping/${user?.sub}?page=${1}&limit=${20}`)
      const { data, meta } = await response.json()

      // Fetch details for each product
      const products = await Promise.all(
        data.map(async (id: string) => {
          const productResponse = await fetch(`http://localhost:3000/orders/${id}`)
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

  } catch (error) {
    return {
      error: error?.message,
      sucess: false
    }
  }
}
