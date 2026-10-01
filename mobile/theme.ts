// "Workshop Paper" design tokens: warm paper ground, white hairline cards,
// IBM Plex Sans for text and IBM Plex Mono for regs, dates, money and labels.

export const colors = {
  background: '#F3F1EC',
  surface: '#FFFFFF',
  border: '#E1DDD4',
  divider: '#ECE9E2',
  controlBorder: '#DAD6CD',
  inputBorder: '#CFCAC0',
  textPrimary: '#1A1A18',
  textSecondary: '#5E5A52',
  textTab: '#4F4C45',
  iconMuted: '#7A766C',
  tabTrack: '#E7E4DD',
  chipBg: '#EEECE6',
  chipText: '#3F3C36',
  danger: '#D64545',
  dangerSoft: '#F8E6E6',
  success: '#2F9E52',
  successSoft: '#E3F2E8',
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

export const radii = { xs: 4, sm: 8, md: 10, lg: 12, pill: 999 };

// Minimum touch target edge, in points.
export const TOUCH_TARGET = 44;

export const fonts = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semibold: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
};

export const typography = {
  // Screen title (32/38).
  title: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  // Car name on the detail screen (28/34).
  carName: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  rowTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  // Secondary text (14).
  caption: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Overline / section labels: mono caps.
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    color: colors.textSecondary,
  },
  // Regs, dates and costs.
  mono: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textPrimary,
  },
};

// Cards use hairline borders instead of shadows.
export const shadow = { card: {} };

export const PAINTS = [
  { name: 'British Racing Green', fill: '#1E5E47', on: '#FFFFFF', text: '#1E5E47', soft: '#E2EAE7' },
  { name: 'Rosso Corsa', fill: '#D40000', on: '#FFFFFF', text: '#B80000', soft: '#F9DEDE' },
  { name: 'Bleu de France', fill: '#1F4E9C', on: '#FFFFFF', text: '#1F4E9C', soft: '#E2E8F2' },
  { name: 'Laguna Seca Blue', fill: '#2A6FB8', on: '#FFFFFF', text: '#2867AE', soft: '#E2ECF6' },
  { name: 'Speed Yellow', fill: '#F4C300', on: '#1A1A18', text: '#7F6500', soft: '#FEF7DE' },
  { name: 'Hugger Orange', fill: '#E8601C', on: '#1A1A18', text: '#A84512', soft: '#FCEAE1' },
  { name: 'Plum Crazy', fill: '#5B2A6E', on: '#FFFFFF', text: '#5B2A6E', soft: '#EAE3EC' },
  { name: 'Nardo Grey', fill: '#6E7174', on: '#FFFFFF', text: '#5F6265', soft: '#ECEDED' },
  { name: 'Lime Rock Green', fill: '#7FB539', on: '#1A1A18', text: '#517424', soft: '#EEF5E5' },
] as const;

export type Paint = (typeof PAINTS)[number];
export type PaintName = Paint['name'];
export const DEFAULT_PAINT: PaintName = 'British Racing Green';

export const theme = { colors, spacing, radii, typography, shadow, fonts, PAINTS };
