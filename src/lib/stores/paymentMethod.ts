import { writable } from 'svelte/store'


export const paymentMethod = writable<string>()

export function updatePaymentMethod(method: string) {
  paymentMethod.set(method)
}
