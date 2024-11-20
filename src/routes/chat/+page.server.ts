import type { PageServerLoad } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'


// Obtener conversaciones
const getConversations = async (userid: string) => {
  try {
    const response = await fetch(`${PRIVATE_SERVER_URL}/chat/conversations/${userid}`);
    const data = await response.json();

    if (response.ok && data?.conversations) {
      return data.conversations;
    } else {
      console.warn('No conversations found, initializing as empty array');
      return [];
    }
  } catch (error) {
    console.error('Error obteniendo conversaciones:', error);
    return [];
  }
};

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?._id
  if (!userId) {
    return {
      status: 401,
      error: new Error('No autorizado')
    }
  }

  // Llamar a la función para obtener conversaciones
  const conversations = await getConversations(userId);

  return {
    conversations,
  }
}
