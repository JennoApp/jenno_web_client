import type { PageServerLoad } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const load: PageServerLoad = async ({ params, cookies, locals }) => {
  try {
    const session = cookies.get('session')

    // Obtener información del usuario
    const userFetch = await fetch(`${PRIVATE_SERVER_URL}/users/findOne/${params.username}`);

    // Verificar el estado de la respuesta del usuario
    if (!userFetch.ok) {
      if (userFetch.status === 500) {
        return {
          status: 500,
          error: "Error interno del servidor"
        }
      } else {
        return {
          status: userFetch.status,
          error: "Error en la solicitud"
        }
      }
    }

    const userData = await userFetch.json();

    return {
      userData,
      session,
      isSession : locals.isSession
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "Error interno del servidor"
    }
  }
};
