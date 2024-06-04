import { theme } from '$lib/stores/themeStore'

function applyTheme(themeValue: string) {
  const root = document.documentElement;

  if (themeValue === 'dark' || (themeValue === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function setupTheme() {
  if (typeof window !== 'undefined') {
    theme.subscribe(applyTheme);
  }
}
