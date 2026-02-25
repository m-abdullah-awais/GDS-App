/**
 * GDS Driving School — Typography System
 * ========================================
 *
 * Font families:
 *   iOS  → SF Pro (system default) — Apple's modern workhorse.
 *   Android → Roboto (system default) — Google's Material standard.
 *
 * React Native maps 'System' to the platform default, which gives us
 * SF Pro on iOS and Roboto on Android without any custom font files.
 *
 * Font weight mapping:
 *   Regular   → '400'
 *   Medium    → '500'
 *   SemiBold  → '600'
 *   Bold      → '700'
 *   ExtraBold → '800'
 *
 * Scale approach:
 *   We use a Type-scale ratio of ~1.25 (Major Third) for headings and
 *   a pragmatic 2pt step for body sizes. This yields a harmonious
 *   hierarchy without overly large jumps.
 *
 * Line height:
 *   Each size uses a line-height that is 1.3–1.5× the font size,
 *   tuned for readability on mobile screens.
 *
 * Letter spacing:
 *   Tight (-0.5 to -0.25) for large display text, normal (0) for body,
 *   slightly open (+0.15 to +0.5) for captions and overlines.
 */

import { Platform, TextStyle } from 'react-native';

// ─── Font Family ──────────────────────────────────────────────────────────────

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

// ─── Font Weights ─────────────────────────────────────────────────────────────

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
} as const;

// ─── Type Variants ────────────────────────────────────────────────────────────

export type TypographyVariant = keyof typeof typography;

export const typography = {
  /** 34px / ExtraBold — Hero sections, onboarding */
  displayLarge: {
    fontFamily,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: fontWeights.extraBold,
    letterSpacing: -0.5,
  } as TextStyle,

  /** 28px / Bold — Section headers, feature titles */
  displayMedium: {
    fontFamily,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.35,
  } as TextStyle,

  /** 24px / Bold — Page titles, top-level headings */
  h1: {
    fontFamily,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.25,
  } as TextStyle,

  /** 20px / SemiBold — Card titles, sub-sections */
  h2: {
    fontFamily,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeights.semiBold,
    letterSpacing: -0.15,
  } as TextStyle,

  /** 18px / SemiBold — Widget headers, group labels */
  h3: {
    fontFamily,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0,
  } as TextStyle,

  /** 16px / Medium — Sub-headers, emphasized body */
  h4: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.medium,
    letterSpacing: 0,
  } as TextStyle,

  /** 16px / Regular — Primary readable text */
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  } as TextStyle,

  /** 14px / Regular — Default body, list items, descriptions */
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.1,
  } as TextStyle,

  /** 12px / Regular — Secondary text, metadata */
  bodySmall: {
    fontFamily,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.15,
  } as TextStyle,

  /** 11px / Medium — Timestamps, labels, hints */
  caption: {
    fontFamily,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.3,
  } as TextStyle,

  /** 10px / SemiBold — Overlines, all-caps labels */
  overline: {
    fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,

  /** 14px / SemiBold — CTA buttons */
  buttonLarge: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.25,
  } as TextStyle,

  /** 13px / SemiBold — Secondary buttons */
  buttonMedium: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.2,
  } as TextStyle,

  /** 12px / SemiBold — Small/tertiary buttons */
  buttonSmall: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.2,
  } as TextStyle,

  /** 14px / Medium — Input text */
  input: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.1,
  } as TextStyle,

  /** 12px / Medium — Input labels above fields */
  label: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.15,
  } as TextStyle,
} as const;
