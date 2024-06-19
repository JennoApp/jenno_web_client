import { writable } from 'svelte/store'


export const ip_address = writable()
export const location_data = writable<{}>()

export function addIpAddress(ip: string) {
  ip_address.set(ip)
}

export function addLocationData(data: Object) {
  location_data.set(data)
}
