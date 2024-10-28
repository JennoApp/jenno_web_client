import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies, locals, url }) => {
  try {
    const session = cookies.get('session') as string
    if (session) {
      const user = jwt.decode(session)

      let followers: any[] = []

      // Obtener la pagina actual
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = 10

      const response = await fetch(
        `http://localhost:3000/users/followers/${user?.sub}?page=${page}&limit=${limit}`
      );
      const { data, meta } = await response.json();

      for (const followerId of data) {
        const response = await fetch(`http://localhost:3000/users/${followerId}`);
        const followerData = await response.json();
        followers = [...followers, followerData]
      }

      return {
        followers,
        meta: meta,
        sucess: true
      }
    } else {
      return {
        sucess: false
      }
    }
  } catch (err: any) {
    return {
      error: err?.message,
      sucess: false
    } 
  }
}
