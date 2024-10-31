import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      const response = await fetch(`${PRIVATE_SERVER_URL}/users/orderscompleted/${user?.sub}?page=${1}&limit=${10}`)
      const { data, meta } = await response.json()

      const salesList = await Promise.all(
        data.map(async (orderId: string) => {
          const orderResponse = await fetch(`${PRIVATE_SERVER_URL}/orders/${orderId}`)
          return await orderResponse.json()
        })
      )

      return  {
        salesList,
        meta: meta,
        sucess: true
      }
    } else {
      return {
        sucess: false
      }
    }

  } catch(error: any) {
    return {
      error: error?.message,
      sucess: false
    }
  }
}
