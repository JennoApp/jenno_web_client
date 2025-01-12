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

      // Fetch the orders list data
      const response = await fetch(`${PRIVATE_SERVER_URL}/users/shoppingwithoutreviews/${user?.sub}?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch shopping without reviews: ${response.statusText}`);
      }

      const { data, meta } = await response.json()

      // Fetch details for each order
      const shoppingWithoutReviews = await Promise.all(
        data.map(async (orderId: string) => {
          const orderResponse = await fetch(`${PRIVATE_SERVER_URL}/orders/${orderId}`);
          if (!orderResponse.ok) {
            throw new Error(`Failed to fetch order details for ID ${orderId}: ${orderResponse.statusText}`);
          }
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
  } catch (error: any) {
    console.error('Error loading shoppingWithoutReviews:', error);
    return {
      error: error?.message || 'Unknown error occurred',
      sucess: false
    }
  }
}
