import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const cartItems = locals.cartItems || [];
  const user = locals.user || null;

  console.log("Carrito en el servidor:", cartItems);
  console.log("Usuario en el servidor:", user);

  return {
    cartItems,
    user
  }
}
