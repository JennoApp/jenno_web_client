import { writable } from 'svelte/store'

const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
export const theme = writable(storedTheme || 'system')

theme.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', value)
  }
})

