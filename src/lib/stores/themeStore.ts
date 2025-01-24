import { writable } from 'svelte/store'

// Detectar el tema del sistema
function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return 'light'
}

const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
export const theme = writable(storedTheme || 'system')
export const isDarkMode = writable<boolean>(false)


// Actualizar el tema en el store y en el 'localstorage'
theme.subscribe(value => {
  if (typeof window !== 'undefined') {
    if (value === 'system') {
      const systemTheme = getSystemTheme()
      document.documentElement.classList.toggle('dark', systemTheme === 'dark')
    } else {
      document.documentElement.classList.toggle('dark', value === 'dark')
    }
    localStorage.setItem('theme', value)
  }
})

// Escuchar los cambios en el tema del sistema
if (typeof window !== 'undefined') {
  const systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  systemThemeMediaQuery.addEventListener('change', event => {
    if (storedTheme === 'system') {
      const newSystemTheme = event.matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newSystemTheme === 'dark');
    }
  });
}
