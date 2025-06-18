import type { RequestHandler } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const GET: RequestHandler = async () => {
  try {
    const res = await fetch(`${PRIVATE_SERVER_URL}/marketing/googleauthurl`);

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
