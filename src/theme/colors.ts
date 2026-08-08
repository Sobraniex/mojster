/** Mojster design system — restrained, editorial, premium */
export const colors = {
  // Core
  ink: '#0A0A0A',
  inkSoft: '#1C1C1C',
  primary: '#0A0A0A',
  primaryDark: '#000000',
  primaryLight: '#2A2A2A',
  primarySoft: '#F0F0F0',

  // Accent — quiet bronze, craft not carnival
  accent: '#8A734A',
  accentSoft: '#F7F3EB',
  accentMuted: '#B8A78A',

  secondary: '#3A3A3A',
  secondarySoft: '#F5F5F5',

  background: '#F3F2EF',
  surface: '#FFFFFF',
  surfaceAlt: '#EBEAE6',
  surfaceElevated: '#FFFFFF',

  text: '#0A0A0A',
  textSecondary: '#4A4A4A',
  textMuted: '#8A8A8A',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#F5F5F5',

  border: '#E2E0DB',
  borderLight: '#ECEAE6',
  borderStrong: '#C8C5BE',

  success: '#1F4D3A',
  successSoft: '#E8F0EC',
  warning: '#8A6A1F',
  warningSoft: '#F7F1E0',
  danger: '#8B1E1E',
  dangerSoft: '#F8EAEA',
  info: '#1E3A5F',
  infoSoft: '#E9EEF4',

  shadow: 'rgba(10, 10, 10, 0.06)',
  shadowStrong: 'rgba(10, 10, 10, 0.12)',
  overlay: 'rgba(10, 10, 10, 0.48)',

  // Phone chrome
  phoneBezel: '#1A1A1A',
  phoneScreen: '#F3F2EF',
  phoneIsland: '#0A0A0A',
  desk: '#0E0E0E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const font = {
  // Tracking for label-style text
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};

export const shadow = {
  sm: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
};
