import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

// Colors mirror global.css variables exactly
export const THEME = {
  light: {
    background: 'hsl(100 20% 97%)',
    foreground: 'hsl(140 6% 18%)',
    card: 'hsl(100 20% 100%)',
    cardForeground: 'hsl(140 6% 18%)',
    popover: 'hsl(100 20% 100%)',
    popoverForeground: 'hsl(140 6% 18%)',
    primary: 'hsl(164 16% 59%)',
    primaryForeground: 'hsl(100 20% 97%)',
    secondary: 'hsl(100 15% 92%)',
    secondaryForeground: 'hsl(140 6% 18%)',
    muted: 'hsl(100 15% 92%)',
    mutedForeground: 'hsl(140 5% 45%)',
    accent: 'hsl(1 82% 74%)',
    accentForeground: 'hsl(100 20% 97%)',
    destructive: 'hsl(0 62% 60%)',
    destructiveForeground: 'hsl(100 20% 97%)',
    border: 'hsl(100 12% 88%)',
    input: 'hsl(100 12% 88%)',
    ring: 'hsl(164 16% 59%)',
    radius: '0.5rem',
  },
  dark: {
    background: 'hsl(140 8% 13%)',
    foreground: 'hsl(100 20% 97%)',
    card: 'hsl(140 7% 17%)',
    cardForeground: 'hsl(100 20% 97%)',
    popover: 'hsl(140 7% 17%)',
    popoverForeground: 'hsl(100 20% 97%)',
    primary: 'hsl(164 20% 65%)',
    primaryForeground: 'hsl(140 8% 13%)',
    secondary: 'hsl(140 7% 22%)',
    secondaryForeground: 'hsl(100 20% 97%)',
    muted: 'hsl(140 7% 22%)',
    mutedForeground: 'hsl(100 10% 60%)',
    accent: 'hsl(1 75% 68%)',
    accentForeground: 'hsl(100 20% 97%)',
    destructive: 'hsl(0 60% 55%)',
    destructiveForeground: 'hsl(100 20% 97%)',
    border: 'hsl(140 7% 25%)',
    input: 'hsl(140 7% 25%)',
    ring: 'hsl(164 20% 65%)',
    radius: '0.5rem',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
