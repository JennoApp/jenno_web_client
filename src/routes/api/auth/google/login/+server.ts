import type { RequestHandler } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request, cookies }) => {
  // 1) Lee el idToken que viene del cliente
  const body = await request.json();

  // 2) Manda la petición al backend NestJS
  const res = await fetch(`${PRIVATE_SERVER_URL}/users/google-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    // si tu backend usa cookies de sesión, incluye esta línea:
    credentials: 'include',
    body: JSON.stringify(body)
  });

  const data = await res.json();

  // 3) Retransmite al cliente el mismo status y cuerpo JSON
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
