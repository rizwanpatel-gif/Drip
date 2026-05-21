export const COLORS = {
  bg: '#0D0D0D',
  card: '#1A1A1A',
  cardBorder: '#2A2A2A',
  accent: '#D4AF37',
  accentDim: 'rgba(212,175,55,0.15)',
  accentShadow: '#9A7D1A',
  textPrimary: '#FFFFFF',
  textSecondary: '#8A8A8A',
  textMuted: '#3A3A3A',
  success: '#4CAF50',
  danger: '#FF4444',
  warning: '#FF9800',
} as const;

export const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  hero: 48,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const SHADOW = {
  neopop: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
