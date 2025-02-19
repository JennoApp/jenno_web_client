import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, cookies }) => {
  let cartItems: any
  const user = locals.user || null;

  const cartCookie = cookies.get('cartItems');
  if (cartCookie) {
    try {
      cartItems = JSON.parse(cartCookie);
    } catch (error) {
      console.error('Error al parsear la cookie cartItems:', error);
    }
  }

  console.log("Carrito en el servidor:", cartItems);
  console.log("Usuario en el servidor:", user);

  return {
    cartItems,
    user
  }
}
