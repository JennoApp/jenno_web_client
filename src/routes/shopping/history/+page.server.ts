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

      // Fetch the orders list data
      const response = await fetch(`http://localhost:3000/users/orderscompleted/${user?.sub}?page=${page}&limit=${limit}`);
      const { data, meta } = await response.json()

      // Fetch details for each order
      const salesList = await Promise.all(
        data.map(async (orderId: string) => {
        const orderResponse = await fetch(`http://localhost:3000/orders/${orderId}`);
        return await orderResponse.json();
      })
    );

      return {
        salesList,
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
