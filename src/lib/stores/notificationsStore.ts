// fetchNotifications.js
import { writable } from 'svelte/store';

export const notifications = writable([]);
export const totalPages = writable(1);
export const unreadNotificationsCount = writable(0);

export async function fetchNotifications(serverUrl: string, userId: string, page = 1, limit = 10) {
  try {
    const response = await fetch(`${serverUrl}/users/notifications/${userId}?page=${page}&limit=${limit}`);
    const data = await response.json();

    if (response.ok) {
      notifications.set(data.data);
      totalPages.set(data.meta.pageCount);
    } else {
      console.error('Error fetching notifications:', data.message);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}


export const fetchUnreadNotificationsCount = async (serverUrl: string, userId: string) => {
  try {
    const response = await fetch(`${serverUrl}/users/notifications/count/${userId}`);
    if (!response.ok) {
      throw new Error('Error al obtener el conteo de notificaciones.');
    }
    const data = await response.json();
    unreadNotificationsCount.set(data.unread);
  } catch (error) {
    console.error('Error al cargar las notificaciones no leídas:', error);
  }
};
