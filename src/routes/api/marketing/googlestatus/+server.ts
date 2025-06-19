import type { RequestHandler } from '@sveltejs/kit';
import { PRIVATE_SERVER_URL } from '$env/static/private';

export const GET: RequestHandler = async ({ cookies }) => {
  const token = cookies.get('session');

  console.log('🟡 PRIVATE_SERVER_URL:', PRIVATE_SERVER_URL);
  console.log('🟡 Token en cookies:', token);

  if (!token) {
    console.error('🔴 No hay token en cookies');
    return new Response(JSON.stringify({ error: 'Token no proporcionado en cookies' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🟡 Haciendo fetch al backend:', `${PRIVATE_SERVER_URL}/marketing/googlestatus`);

    const res = await fetch(`${PRIVATE_SERVER_URL}/marketing/googlestatus`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

     console.log('🟢 Código de respuesta del backend:', res.status);

    const data = await res.json();
     console.log('🟢 Cuerpo de respuesta del backend:', data);

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('🔴 Error en el fetch al backend:', error);
    return new Response(JSON.stringify({ error: 'Error al contactar el backend' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
