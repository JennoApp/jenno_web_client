import type { PageServerLoad } from './$types'


export const load: PageServerLoad = ({ url }) => {
  const token = url.searchParams.get('token')

  if (!token || token.trim() === '') {
    return {
      token: null,
      error: 'Token no válido o no proporcionado.',
    };
  }

  return {
    token,
    error: null
  }
}
