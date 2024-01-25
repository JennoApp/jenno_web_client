import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    // Obtener información del usuario
    const userFetch = await fetch(`http://localhost:3000/users/findOne/${params.username}`);

    // Verificar el estado de la respuesta del usuario
    if (!userFetch.ok) {
      if (userFetch.status === 500) {
        return {
          status: 500,
          error: "Error interno del servidor"
        };
      } else {
        return {
          status: userFetch.status,
          error: "Error en la solicitud"
        };
      }
    }

    const userData = await userFetch.json();

    return {
      user: userData
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "Error interno del servidor"
    };
  }
};



/*
    // Obtener los productos del usuario usando la información del usuario
    const productsFetch = await fetch(`http://localhost:3000/products/users/${userData._id}`);

    // Verificar el estado de la respuesta de productos
    if (!productsFetch.ok) {
      if (productsFetch.status === 500) {
        return {
          status: 500,
          error: "Error interno del servidor al obtener productos del usuario",
        };
      } else {
        return {
          status: productsFetch.status,
          error: "Error en la solicitud al obtener productos del usuario",
        };
      }
    }

    const productsData = await productsFetch.json();

*/