import { writable } from "svelte/store";
import type { Conversation } from '$lib/interfaces/Conversation'

export const conversations = writable<Conversation[]>([])


