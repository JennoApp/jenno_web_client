import type { RequestHandler } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;

  if (!user || !user._id) {
    return new Response(JSON.stringify({ error: 'Usuario no autenticado o sin ID' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await fetch(`${PRIVATE_SERVER_URL}/marketing/googleauthurl?storeId=${user._id}`);

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al contactar con el backend' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
