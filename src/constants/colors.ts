/**
 * GDS Driving School — Bright Color System
 * ==========================================
 * Updated to a more vibrant, high-visibility palette with elegant contrast.
 */

export const palette = {
  // Brand / utility families
  blue50: '#EAF1FF',
  blue100: '#D8E5FF',
  blue200: '#B6CCFF',
  blue300: '#8EB0FF',
  blue400: '#6595FF',
  blue500: '#3F7EFF',
  blue600: '#2F6BFF',
  blue700: '#1F4FCC',
  blue800: '#163B99',
  blue900: '#102B73',

  violet50: '#F2EEFF',
  violet100: '#E7DFFF',
  violet200: '#D4C2FF',
  violet300: '#BA9BFF',
  violet400: '#9D74FF',
  violet500: '#8658FF',
  violet600: '#7141F4',
  violet700: '#5E31D3',

  fuchsia500: '#D946EF',
  fuchsia600: '#C026D3',

  emerald500: '#22C55E',
  emerald600: '#16A34A',
  amber500: '#F59E0B',
  amber600: '#D97706',
  red500: '#EF4444',
  red600: '#DC2626',
  sky500: '#0EA5E9',
  sky600: '#0284C7',

  // Cool neutral family
  slate50: '#F3F6FB',
  slate100: '#E8EDF6',
  slate200: '#D6E0EE',
  slate300: '#BCC9DE',
  slate400: '#8EA0BE',
  slate500: '#667A99',
  slate600: '#4A5E80',
  slate700: '#334664',
  slate800: '#202F4D',
  slate900: '#0F1A33',
  slate950: '#080F24',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const lightColors = {
  // Brand
  primary: palette.blue600,
  primaryDark: palette.blue700,
  primaryLight: palette.blue100,
  secondary: palette.slate900,
  accent: palette.fuchsia500,

  // Semantic
  success: palette.emerald500,
  successLight: '#EAFBF1',
  warning: palette.amber500,
  warningLight: '#FFF6E6',
  error: palette.red500,
  errorLight: '#FFECEC',
  info: palette.sky500,
  infoLight: '#EAF7FE',
  highlight: palette.fuchsia500,
  highlightLight: '#FDEAFE',

  // Neutral scale
  neutral50: palette.slate50,
  neutral100: palette.slate100,
  neutral200: palette.slate200,
  neutral300: palette.slate300,
  neutral400: palette.slate400,
  neutral500: palette.slate500,
  neutral600: palette.slate600,
  neutral700: palette.slate700,
  neutral800: palette.slate800,
  neutral900: palette.slate900,

  // Surfaces
  background: palette.slate50,
  surface: palette.white,
  surfaceSecondary: palette.slate100,
  overlay: 'rgba(15, 26, 51, 0.54)',

  // Text
  textPrimary: palette.slate900,
  textSecondary: palette.slate600,
  textTertiary: palette.slate400,
  textInverse: palette.white,
  textLink: palette.blue600,

  // Borders & Dividers
  border: palette.slate200,
  borderFocused: palette.blue600,
  divider: palette.slate200,

  // States
  disabled: palette.slate300,
  disabledText: palette.slate400,
  placeholder: palette.slate400,
  ripple: 'rgba(47, 107, 255, 0.1)',
  pressed: 'rgba(47, 107, 255, 0.14)',

  // Misc
  skeleton: palette.slate200,
  statusBar: 'dark-content' as const,
} as const;

export const darkColors = {
  // Brand
  primary: palette.blue400,
  primaryDark: palette.blue500,
  primaryLight: 'rgba(63,126,255,0.24)',
  secondary: '#ECF3FF',
  accent: '#F472F8',

  // Semantic
  success: '#4ADE80',
  successLight: 'rgba(34,197,94,0.22)',
  warning: '#FBBF24',
  warningLight: 'rgba(245,158,11,0.22)',
  error: '#F87171',
  errorLight: 'rgba(239,68,68,0.22)',
  info: '#38BDF8',
  infoLight: 'rgba(14,165,233,0.22)',
  highlight: '#F472F8',
  highlightLight: 'rgba(217,70,239,0.22)',

  // Neutral scale
  neutral50: palette.slate950,
  neutral100: palette.slate900,
  neutral200: palette.slate800,
  neutral300: palette.slate700,
  neutral400: palette.slate600,
  neutral500: palette.slate500,
  neutral600: palette.slate400,
  neutral700: palette.slate300,
  neutral800: palette.slate200,
  neutral900: '#F3F6FB',

  // Surfaces
  background: palette.slate950,
  surface: '#101C39',
  surfaceSecondary: '#16264A',
  overlay: 'rgba(0, 0, 0, 0.64)',

  // Text
  textPrimary: '#ECF3FF',
  textSecondary: '#AEC1DF',
  textTertiary: '#7F95B8',
  textInverse: '#101C39',
  textLink: '#7DA5FF',

  // Borders & Dividers
  border: '#29406A',
  borderFocused: '#5D8BFF',
  divider: '#22375F',

  // States
  disabled: '#2B3E66',
  disabledText: '#6F85AA',
  placeholder: '#748CB4',
  ripple: 'rgba(125,165,255,0.16)',
  pressed: 'rgba(125,165,255,0.22)',

  // Misc
  skeleton: '#233963',
  statusBar: 'light-content' as const,
} as const;

// ─── Type ─────────────────────────────────────────────────────────────────────

export type StatusBarStyle = 'dark-content' | 'light-content';

export type ColorTokens = {
  [K in keyof typeof lightColors]: K extends 'statusBar'
    ? StatusBarStyle
    : string;
};
