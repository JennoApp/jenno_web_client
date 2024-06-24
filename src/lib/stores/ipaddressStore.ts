import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export const ip_address = writable<string | null>(null)
export const location_data = writable<any |null>(null)

if (browser) {
  try {
    if (localStorage.getItem('ip_address')) {
    ip_address.set(JSON.parse(localStorage.getItem('ip_address')!))
  }
  if (localStorage.getItem('location_data')) {
    location_data.set(JSON.parse(localStorage.getItem('location_data')!))
  }
  } catch (error) {
    console.error('Error parsing local storage data: ', error)
  }
  

  ip_address.subscribe((ip) => {
    if (ip !== null) {
      localStorage.setItem('ip_address', JSON.stringify(ip))
    } else {
      localStorage.removeItem('ip_address')
    }
  })

  location_data.subscribe((data) => {
    if (data !== null) {
      localStorage.setItem('location_data', JSON.stringify(data))
    } else {
      localStorage.removeItem('location_data')
    }
  })
}

export function addIpAddress(ip: string) {
  ip_address.set(ip)
}

export function addLocationData(data: any) {
  location_data.set(data)
}
