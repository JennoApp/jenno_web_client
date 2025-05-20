import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const POST: RequestHandler = async ({ request, url, cookies }) => {
  const productId = url.searchParams.get('productId');
  const token = cookies.get('session'); // Asegúrate de que el token esté disponible

  if (!productId || !token) {
    throw error(400, 'Faltan parámetros');
  }

  const formData = new FormData();
  const body = await request.formData();
  const files = body.getAll('file') as File[];

  if (!files.length) {
    throw error(400, 'No se subió ningún archivo');
  }

  // Agregar los archivos al formData que se enviará al backend NestJS
  for (const file of files) {
    formData.append('files', file);
  }

  const backendUrl = `${PRIVATE_SERVER_URL}/products/upload-additional-info/${productId}`;

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData
  });

  if (!res.ok) {
    throw error(res.status, 'Error al subir la imagen al backend');
  }

  const result = await res.json();

  return json(result);
};
