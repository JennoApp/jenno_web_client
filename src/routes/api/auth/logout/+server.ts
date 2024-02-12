import { json } from '@sveltejs/kit'

export async function POST({cookies, locals}) {
  locals.user = null
  locals.sessionExpired = true

  const cookieOptions = {
    path: '/',
  }

  cookies.delete('session', cookieOptions)

  return json({
    status: 'success'
  })
}