import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      // Obtener la pagina actual
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = 10

      const response = await fetch(`http://localhost:3000/products/admin/user/${user?.sub}?page=${page}&limit=${limit}&country=Colombia`)

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
  } catch (error: any) {
    return {
      error: error?.message,
      sucess: false
    }
  }
}
