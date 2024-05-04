import { get, writable } from 'svelte/store'


export const paymentMethod = writable('payu')

// export function getPaymentMethod() {
//   return get(paymentMethod)
// }

export function updatePaymentMethod(p: string) {
  paymentMethod.set(p)
}
