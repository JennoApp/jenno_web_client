import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const cartItems = await request.json();

    locals.cartItems = cartItems;

    console.log('Carrito guardado:', cartItems);

    return new Response('Carrito guardado', { status: 200 });
  } catch (error) {
    console.error('Error guardando el carrito:', error);
    return new Response('Error al guardar el carrito', { status: 500 });
  }
}
