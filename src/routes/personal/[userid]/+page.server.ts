import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({params, cookies}) => {
  try {
    const session = cookies.get('session')

    // obtener informacion del usuario
    const userFetch = await fetch(`http://localhost:3000/users/findOnePersonal/${params.userid}`)

    // verificar el estado de la respuesta
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

    const userData = await userFetch.json()

    return {
      userData,
      session
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      error: "Error interno del servidor"
    }
  }
}