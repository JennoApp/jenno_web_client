import type { RequestHandler } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  const res = await fetch(`${PRIVATE_SERVER_URL}/users/google-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
