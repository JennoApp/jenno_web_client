import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const cartItems = await request.json();
    const cartString = JSON.stringify(cartItems);

    console.log('Carrito guardado:', cartItems);


    return new Response('Carrito guardado', {
      status: 200,
      headers: {
        'Set-Cookie': `cartItems=${encodeURIComponent(cartString)}; Path=/; HttpOnly;`
      }
    })
  } catch (error) {
    console.error('Error guardando el carrito:', error);
    return new Response('Error al guardar el carrito', { status: 500 });
  }
}
