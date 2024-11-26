import { writable } from 'svelte/store';

// Tipos para las variables
interface MessageType {
  _id: string;
  text: string;
  sender: string;
  conversationId: string;
}

interface ConversationType {
  _id: string;
  members: string[];
  lastMessage?: MessageType;
}

// Stores tipados
export const messages = writable<MessageType[]>([]);
export const currentChat = writable<ConversationType | null>(null);
export const isLoadingMessages = writable<boolean>(false);
