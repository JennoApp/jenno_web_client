import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {

  let followers: any[] = []
  let currentPage = 1
  let limitPerPage = 10
  try {
    const response = await fetch(
      `http://localhost:3000/users/followers/${locals?.user?._id}?page=${currentPage}&limit=${limitPerPage}`
    );
    const {data} = await response.json();
    // NextPage = meta.hasNextPage;
    // PreviousPage = meta.hasPreviousPage;

    for (const followerId of data) {
      const response = await fetch(`http://localhost:3000/users/${followerId}`);
      const followerData = await response.json();
      followers = [...followers, followerData]
    }
    return {
      followers
    }

  } catch (err) {
    console.error('Error la recuperar la lista de seguidores:', err);
  }
}
