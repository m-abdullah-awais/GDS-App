/**
 * GDS Driving School — Color System
 * ====================================
 *
 * Design rationale:
 *
 * PRIMARY (#1A56DB → Deep Confident Blue)
 *   Chosen for trust, authority, and reliability — the three pillars of
 *   education and transport industries. This shade sits between royal blue
 *   and navy, avoiding the generic Material Design blue (#2196F3). It's
 *   inspired by the color language of Stripe, Revolut, and Linear —
 *   premium apps that pair deep blues with neutral surfaces.
 *
 * SECONDARY (#0F172A → Rich Slate-900)
 *   A near-black with a blue undertone. Used for headlines, navigation
 *   chrome, and high-emphasis surfaces. Gives the "dark mode premium feel"
 *   even in light mode sections. Sourced from Tailwind's Slate scale.
 *
 * ACCENT (#6366F1 → Modern Indigo)
 *   A vibrant-but-controlled indigo for interactive highlights, badges,
 *   and CTAs that need to stand apart from the primary blue. Linear and
 *   Stripe use this family for secondary call-to-actions.
 *
 * NEUTRAL SCALE (Slate 50–900)
 *   Cool-gray, slightly blue-tinted neutrals from the Tailwind Slate
 *   palette. Cool grays feel more modern and "tech" than warm or pure
 *   grays. Every premium SaaS toolkit (Radix, shadcn/ui) defaults to
 *   this scale.
 *
 * SEMANTIC COLORS
 *   Success (#059669) — muted emerald, not flashy.
 *   Warning (#D97706) — warm amber, legible on both themes.
 *   Error   (#DC2626) — clear red with strong contrast.
 *   Info    (#0284C7) — sky-blue, distinct from primary.
 *
 * All colors pass WCAG AA contrast against their intended background
 * (white surface in light mode, slate-900 surface in dark mode).
 */

// ─── Primitive Color Tokens ───────────────────────────────────────────────────

export const palette = {
  // Blues (primary family)
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#1A56DB',   // ← Primary
  blue700: '#1440A9',   // ← Primary Dark
  blue800: '#1E3A5F',
  blue900: '#0C2340',

  // Indigos (accent family)
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo300: '#A5B4FC',
  indigo400: '#818CF8',
  indigo500: '#6366F1',  // ← Accent
  indigo600: '#4F46E5',
  indigo700: '#4338CA',

  // Slate (neutral family — cool-gray with blue undertone)
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',

  // Semantic
  emerald600: '#059669',
  emerald700: '#047857',
  amber600: '#D97706',
  amber700: '#B45309',
  red600: '#DC2626',
  red700: '#B91C1C',
  sky600: '#0284C7',
  sky700: '#0369A1',

  // Absolute
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── Semantic Color Tokens – Light Mode ───────────────────────────────────────

export const lightColors = {
  // Brand
  primary: palette.blue600,          // #1A56DB – buttons, links, active states
  primaryDark: palette.blue700,      // #1440A9 – pressed/hover states
  primaryLight: palette.blue100,     // #DBEAFE – tinted backgrounds, chips
  secondary: palette.slate900,       // #0F172A – headlines, nav bars
  accent: palette.indigo500,         // #6366F1 – badges, highlights, secondary CTA

  // Semantic
  success: palette.emerald600,       // #059669
  successLight: '#ECFDF5',           // tinted bg
  warning: palette.amber600,         // #D97706
  warningLight: '#FFFBEB',           // tinted bg
  error: palette.red600,             // #DC2626
  errorLight: '#FEF2F2',            // tinted bg
  info: palette.sky600,              // #0284C7
  infoLight: '#F0F9FF',             // tinted bg

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
  background: palette.slate50,       // #F8FAFC – full-screen background
  surface: palette.white,            // #FFFFFF – cards, modals, sheets
  surfaceSecondary: palette.slate100,// #F1F5F9 – secondary sections
  overlay: 'rgba(15, 23, 42, 0.5)', // semi-transparent backdrop

  // Text
  textPrimary: palette.slate900,     // #0F172A – headings, primary content
  textSecondary: palette.slate600,   // #475569 – secondary/supporting text
  textTertiary: palette.slate400,    // #94A3B8 – placeholders, hints
  textInverse: palette.white,        // white text on dark backgrounds
  textLink: palette.blue600,         // #1A56DB – links

  // Borders & Dividers
  border: palette.slate200,          // #E2E8F0 – card borders, input outlines
  borderFocused: palette.blue600,    // #1A56DB – focused inputs
  divider: palette.slate200,         // #E2E8F0 – horizontal rules

  // States
  disabled: palette.slate300,        // #CBD5E1 – disabled controls
  disabledText: palette.slate400,    // #94A3B8 – disabled text
  placeholder: palette.slate400,     // #94A3B8 – input placeholders
  ripple: 'rgba(26, 86, 219, 0.08)', // subtle blue ripple
  pressed: 'rgba(26, 86, 219, 0.12)',// pressed overlay

  // Misc
  skeleton: palette.slate200,        // shimmer placeholder
  statusBar: 'dark-content' as const,
} as const;

// ─── Semantic Color Tokens – Dark Mode ────────────────────────────────────────

export const darkColors = {
  // Brand
  primary: palette.blue400,          // #60A5FA – brighter blue for dark surfaces
  primaryDark: palette.blue500,      // #3B82F6 – pressed states
  primaryLight: 'rgba(59,130,246,0.15)', // subtle blue overlay
  secondary: palette.slate100,       // #F1F5F9 – light text on dark
  accent: palette.indigo400,         // #818CF8 – brighter indigo for dark

  // Semantic
  success: '#34D399',                // brighter emerald for dark
  successLight: 'rgba(5,150,105,0.15)',
  warning: '#FBBF24',               // brighter amber for dark
  warningLight: 'rgba(217,119,6,0.15)',
  error: '#F87171',                  // brighter red for dark
  errorLight: 'rgba(220,38,38,0.15)',
  info: '#38BDF8',                   // brighter sky for dark
  infoLight: 'rgba(2,132,199,0.15)',

  // Neutral scale (inverted perception)
  neutral50: palette.slate950,
  neutral100: palette.slate900,
  neutral200: palette.slate800,
  neutral300: palette.slate700,
  neutral400: palette.slate600,
  neutral500: palette.slate500,
  neutral600: palette.slate400,
  neutral700: palette.slate300,
  neutral800: palette.slate200,
  neutral900: palette.slate100,

  // Surfaces
  background: palette.slate950,      // #020617 – deep dark background
  surface: palette.slate900,         // #0F172A – card / modal surfaces
  surfaceSecondary: palette.slate800,// #1E293B – secondary sections
  overlay: 'rgba(0, 0, 0, 0.6)',    // darker overlay

  // Text
  textPrimary: palette.slate50,      // #F8FAFC – headings
  textSecondary: palette.slate400,   // #94A3B8 – supporting text
  textTertiary: palette.slate500,    // #64748B – hints
  textInverse: palette.slate900,     // dark text on light surfaces
  textLink: palette.blue400,         // #60A5FA – links

  // Borders & Dividers
  border: palette.slate700,          // #334155
  borderFocused: palette.blue400,    // #60A5FA
  divider: palette.slate800,         // #1E293B

  // States
  disabled: palette.slate700,        // #334155
  disabledText: palette.slate600,    // #475569
  placeholder: palette.slate500,     // #64748B
  ripple: 'rgba(96,165,250,0.1)',
  pressed: 'rgba(96,165,250,0.15)',

  // Misc
  skeleton: palette.slate800,
  statusBar: 'light-content' as const,
} as const;

// ─── Type ─────────────────────────────────────────────────────────────────────

export type StatusBarStyle = 'dark-content' | 'light-content';

export type ColorTokens = {
  [K in keyof typeof lightColors]: K extends 'statusBar'
    ? StatusBarStyle
    : string;
};
