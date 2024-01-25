import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  try {
    // Obtener información del usuario
    const userFetch = await fetch(`http://localhost:3000/users/findOne/${params.username}`);

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
      userData
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "Error interno del servidor"
    }
  }
};
