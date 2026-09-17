export const colors = {
  background: '#F6F6F7',
  surface: '#FFFFFF',
  border: '#E8E8EC',
  textPrimary: '#1C1C1E',
  textSecondary: '#6B6B72',
  textMuted: '#9A9AA2',
  primary: '#2F6FED',
  primarySoft: '#E9F0FE',
  neutral: '#5B5B63',
  neutralSoft: '#EEEEF1',
  danger: '#D64545',
  dangerSoft: '#FBEAEA',
  success: '#2F9E52',
  successSoft: '#E7F6EC',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  heading: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

export const theme = { colors, spacing, radii, typography, shadow };
