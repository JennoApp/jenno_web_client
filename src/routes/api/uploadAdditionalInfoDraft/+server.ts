import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get('session');
  if (!token) throw error(401, 'No autorizado');

  const body = await request.formData();
  const file = body.get('file') as File;
  if (!file) throw error(400, 'No se subió ningún archivo');

  // reenviar al backend NestJS que hace uploadFile(..., 'draft')
  const proxy = new FormData();
  proxy.append('file', file);

  const res = await fetch(
    `${PRIVATE_SERVER_URL}/products/upload-additional-info-draft`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: proxy
    }
  );
  if (!res.ok) throw error(res.status, 'Error al subir draft');

  const data = await res.json();
  return json({ url: data.url });
};
