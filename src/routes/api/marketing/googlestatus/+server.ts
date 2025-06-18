import type { RequestHandler } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const GET: RequestHandler = async ({ cookies }) => {
  const token = cookies.get('session');

  console.log('PRIVATE_SERVER_URL:', PRIVATE_SERVER_URL);

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token no proporcionado en cookies' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await fetch(`${PRIVATE_SERVER_URL}/marketing/googlestatus`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al contactar el backend' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
