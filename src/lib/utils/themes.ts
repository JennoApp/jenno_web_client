
export interface ThemeConfig {
  background: string;         // CSS gradient or color
  buttonBg: string;           // Button background color
  buttonText: string;         // Button text color
  accentColor?: string;       // Optional accent color
  cardBg?: string;            // Optional card background
}

export const themes: Record<string, ThemeConfig> = {
  default: {
    background: 'transparent',
    buttonBg: 'var(--primary)',
    buttonText: 'var(--primary-foreground)',
  },
  ocean_blue: {
    // Increased opacity for better visibility
    background: 'linear-gradient(180deg, rgba(1,87,155,0.5) 0%, rgba(1,87,155,0.7) 100%)',
    buttonBg: '#0288D1',
    buttonText: '#ffffff',
    accentColor: '#4FC3F7',
  },
  sky_blue: {
    background: 'linear-gradient(180deg, rgba(33,150,243,0.5) 0%, rgba(33,150,243,0.7) 100%)',
    buttonBg: '#2196F3',
    buttonText: '#ffffff',
    accentColor: '#BBDEFB',
  },
  nature_green: {
    background: 'linear-gradient(180deg, rgba(46,125,107,0.5) 0%, rgba(46,125,107,0.7) 100%)',
    buttonBg: '#2E7D6B',
    buttonText: '#ffffff',
    accentColor: '#C8E6C9',
  },
  mint_green: {
    background: 'linear-gradient(180deg, rgba(67,160,71,0.5) 0%, rgba(67,160,71,0.7) 100%)',
    buttonBg: '#43A047',
    buttonText: '#ffffff',
    accentColor: '#E8F5E9',
  },
  sunset_orange: {
    background: 'linear-gradient(180deg, rgba(239,108,0,0.5) 0%, rgba(239,108,0,0.7) 100%)',
    buttonBg: '#F57C00',
    buttonText: '#ffffff',
    accentColor: '#FFE0B2',
  },
  clay_red: {
    background: 'linear-gradient(180deg, rgba(165,57,48,0.5) 0%, rgba(165,57,48,0.7) 100%)',
    buttonBg: '#C0392B',
    buttonText: '#ffffff',
    accentColor: '#F5B7B1',
  },
  orchid_purple: {
    background: 'linear-gradient(180deg, rgba(126,87,194,0.5) 0%, rgba(126,87,194,0.7) 100%)',
    buttonBg: '#673AB7',
    buttonText: '#ffffff',
    accentColor: '#D1C4E9',
  },
  moon_gray: {
    background: 'linear-gradient(180deg, rgba(97,97,97,0.5) 0%, rgba(97,97,97,0.7) 100%)',
    buttonBg: '#9E9E9E',
    buttonText: '#ffffff',
    accentColor: '#E0E0E0',
  },
  eclipse_black: {
    background: 'linear-gradient(180deg, rgba(224,224,224,0.5) 0%, rgba(224,224,224,0.7) 100%)',
    buttonBg: '#212121',
    buttonText: '#ffffff',
    accentColor: '#2A2A2A',
  },
  sun_yellow: {
    background: 'linear-gradient(180deg, rgba(251,192,45,0.5) 0%, rgba(251,192,45,0.7) 100%)',
    buttonBg: '#FDD835',
    buttonText: '#000000',
    accentColor: '#FFF59D',
  }
};


/**
 * Returns the theme configuration for a given name.
 * If not found, returns the "default" theme.
 */
export function getThemeConfig(name: string): ThemeConfig {
  return themes[name] || themes.default;
}
