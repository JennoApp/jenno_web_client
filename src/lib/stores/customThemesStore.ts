import { writable, derived } from 'svelte/store';
import { getThemeConfig, type ThemeConfig } from '$lib/utils/themes';

export const themeName = writable<string>('default');

export const themeConfig = derived(themeName, ($themeName) =>
  getThemeConfig($themeName)
);

export function applyTheme(name: string) {
  themeName.set(name);
  const config: ThemeConfig = getThemeConfig(name);

  document.documentElement.style.setProperty('--store-bg', config.background);
  document.documentElement.style.setProperty('--button-bg', config.buttonBg);
  document.documentElement.style.setProperty('--button-text', config.buttonText);

  if (config.accentColor) {
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
  }
  if (config.cardBg) {
    document.documentElement.style.setProperty('--card-bg', config.cardBg);
  }
}
