import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionToken = cookies.get('session')

  return {
    sessionToken
  }
}
