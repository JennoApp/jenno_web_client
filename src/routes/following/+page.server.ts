import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'


export const load: PageServerLoad = async ({ fetch, cookies }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      const response = await fetch(`${PRIVATE_SERVER_URL}/products/randomfollowed/${user?.sub}?page=${1}&limit=${20}&country=Colombia`)

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
