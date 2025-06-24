import { json, type RequestHandler } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private';


export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
  const { idToken } = await request.json();

  // Llama al backend y pasa el token
  const res = await fetch(`${PRIVATE_SERVER_URL}/users/google/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  const data = await res.json();

  if (!res.ok) {
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Guarda el token como cookie httpOnly
  cookies.set('session', data.access_token, {
    httpOnly: true,
    secure: true, // en prod
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 días
  });

  return json({ success: true });
};
