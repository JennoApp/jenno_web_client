// fetchNotifications.js
import { writable } from 'svelte/store';

export const notifications= writable([]);
export const totalPages = writable(1);

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
