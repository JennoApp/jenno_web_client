import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      const response = await fetch(`http://localhost:3000/products/user/${user?.sub}`)

      const { data } = await response.json()

      return {
        products: data,
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