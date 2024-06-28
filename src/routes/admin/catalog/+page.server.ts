import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      const response = await fetch(`http://localhost:3000/products/admin/user/${user?.sub}?page=${1}&limit=${20}&country=Colombia`)

      const { data, meta } = await response.json()

      return {
        products: data,
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
