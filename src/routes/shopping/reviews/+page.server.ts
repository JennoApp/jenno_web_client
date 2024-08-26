import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      // Fetch the orders list data
      const response = await fetch(`http://localhost:3000/users/shoppingwithoutreviews/${user?.sub}?page=${1}&limit=${10}`);
      const { data, meta } = await response.json()

      // Fetch details for each order
      const shoppingWithoutReviews = await Promise.all(
        data.map(async (orderId: string) => {
        const orderResponse = await fetch(`http://localhost:3000/orders/${orderId}`);
        return await orderResponse.json();
      })
    );

      return {
        shoppingWithoutReviews,
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
