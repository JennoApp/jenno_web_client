import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export const ip_address = writable<string | null>(null)
export const location_data = writable<any | null>(null)

if (browser) {
  try {
    const storedIp = localStorage.getItem('ip_address')
    const storedLocationData = localStorage.getItem('location_data')

    if (storedIp) {
      ip_address.set(JSON.parse(storedIp))
    }
    if (storedLocationData) {
      location_data.set(JSON.parse(storedLocationData))
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
