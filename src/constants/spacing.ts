/**
 * GDS Driving School — Spacing System
 * =====================================
 *
 * Based on an 8pt grid with a 4pt half-step for fine adjustments.
 *
 * Why 8pt?
 *   • Industry standard (Google Material, Apple HIG, Ant Design).
 *   • Scales cleanly on all screen densities (1×, 1.5×, 2×, 3×).
 *   • Creates natural visual rhythm and consistent white-space.
 *
 * Usage guidelines:
 *   ┌──────────┬────────────────────────────────────────────────┐
 *   │ Token    │ Typical usage                                  │
 *   ├──────────┼────────────────────────────────────────────────┤
 *   │ xxs (4)  │ Icon-to-label gap, tight inline spacing       │
 *   │ xs  (8)  │ Inner padding of badges, chips; inline gaps   │
 *   │ sm  (12) │ Inner padding of small components             │
 *   │ md  (16) │ Default screen padding, card inner padding    │
 *   │ lg  (20) │ Card padding, section gap on small screens    │
 *   │ xl  (24) │ Section spacing, form group gaps              │
 *   │ 2xl (32) │ Between major sections, modal padding         │
 *   │ 3xl (40) │ Large section separators                      │
 *   │ 4xl (48) │ Screen top/bottom breathing room              │
 *   │ 5xl (64) │ Hero sections, illustration margins           │
 *   └──────────┴────────────────────────────────────────────────┘
 */

export const spacing = {
  /** 4px — micro spacing */
  xxs: 4,
  /** 8px — extra-small */
  xs: 8,
  /** 12px — small */
  sm: 12,
  /** 16px — medium (default) */
  md: 16,
  /** 20px — large */
  lg: 20,
  /** 24px — extra-large */
  xl: 24,
  /** 32px — 2× large */
  '2xl': 32,
  /** 40px — 3× large */
  '3xl': 40,
  /** 48px — 4× large */
  '4xl': 48,
  /** 64px — 5× large */
  '5xl': 64,
} as const;

// ─── Specific Layout Helpers ──────────────────────────────────────────────────

/** Standard horizontal screen padding */
export const screenPaddingH = spacing.md; // 16px

/** Standard vertical screen padding */
export const screenPaddingV = spacing.xl; // 24px

/** Default gap between list items */
export const listItemGap = spacing.sm; // 12px

/** Default gap between form fields */
export const formFieldGap = spacing.lg; // 20px

/** Default gap between sections */
export const sectionGap = spacing['2xl']; // 32px

// ─── Border Radius ────────────────────────────────────────────────────────────

/**
 * Border-radius scale
 *
 *   sm   (6)   — Chips, badges, small tags
 *   md   (10)  — Inputs, buttons, small cards
 *   lg   (14)  — Standard cards, modals
 *   xl   (20)  — Large cards, bottom sheets
 *   2xl  (28)  — Image containers, featured cards
 *   full (9999) — Pill buttons, avatars, circular elements
 */
export const borderRadius = {
  /** 6px */
  sm: 6,
  /** 10px */
  md: 10,
  /** 14px */
  lg: 14,
  /** 20px */
  xl: 20,
  /** 28px */
  '2xl': 28,
  /** Fully rounded (pill / circle) */
  full: 9999,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
