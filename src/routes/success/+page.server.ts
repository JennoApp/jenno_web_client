import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ url, locals }) => {
  const status = url.searchParams.get('collection_status');

  if (status === 'approved' && locals.user) {
  try {
    const cartItems = locals.cartItems || [];

    console.log({ cartItems, user: locals.user });

  } catch (error: any) {
      console.error('Error al procesar órdenes:', error);
      return { status: 'error', message: error.message };
    }
  }

  return { status }
};
