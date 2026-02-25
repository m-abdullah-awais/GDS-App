/**
 * GDS Driving School — Shadow / Elevation System
 * =================================================
 *
 * Cross-platform solution:
 *   • iOS    — uses `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
 *   • Android — uses `elevation` (Material shadow system)
 *
 * We define four elevation levels that cover every surface type:
 *
 *   ┌──────────┬────────┬─────────────────────────────────────────────┐
 *   │ Level    │ dp     │ Use case                                    │
 *   ├──────────┼────────┼─────────────────────────────────────────────┤
 *   │ none     │ 0      │ Flat surfaces, inline elements              │
 *   │ sm       │ 2      │ Subtle lift — cards, list items             │
 *   │ md       │ 4      │ Default cards, dropdowns                    │
 *   │ lg       │ 8      │ Modals, dialogs, bottom sheets              │
 *   │ xl       │ 16     │ FABs, toasts, floating action elements      │
 *   └──────────┴────────┴─────────────────────────────────────────────┘
 *
 * Shadow color uses a dark slate (#0F172A) at varying opacities rather
 * than pure black, producing softer, more natural shadows that match
 * the cool-gray neutral palette.
 */

import { Platform, ViewStyle } from 'react-native';

// Shared shadow color (slate-900 with alpha)
const SHADOW_COLOR = '#0F172A';

// ─── Shadow Definitions ───────────────────────────────────────────────────────

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const shadows = {
  /** No shadow */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ShadowStyle,

  /**
   * Small — subtle lift for cards
   * iOS: 2px blur, 1px offset, 6% opacity
   * Android: elevation 2
   */
  sm: Platform.select({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
      shadowColor: SHADOW_COLOR,
    },
    default: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
    },
  }) as ShadowStyle,

  /**
   * Medium — default card elevation
   * iOS: 6px blur, 2px offset, 8% opacity
   * Android: elevation 4
   */
  md: Platform.select({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
      shadowColor: SHADOW_COLOR,
    },
    default: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
  }) as ShadowStyle,

  /**
   * Large — modals, bottom sheets, dialogs
   * iOS: 16px blur, 4px offset, 12% opacity
   * Android: elevation 8
   */
  lg: Platform.select({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
      shadowColor: SHADOW_COLOR,
    },
    default: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
  }) as ShadowStyle,

  /**
   * Extra-large — FABs, toasts, floating elements
   * iOS: 24px blur, 8px offset, 16% opacity
   * Android: elevation 16
   */
  xl: Platform.select({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    android: {
      elevation: 16,
      shadowColor: SHADOW_COLOR,
    },
    default: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
  }) as ShadowStyle,
} as const;

// ─── Dark Mode Shadows ────────────────────────────────────────────────────────

/**
 * In dark mode, traditional shadows are nearly invisible. We use a
 * lighter border + subtle glow approach instead for iOS. Android's
 * elevation system already handles dark mode via the surface layer.
 */
export const darkShadows = {
  none: shadows.none,

  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
      shadowColor: '#000000',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
  }) as ShadowStyle,

  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
      shadowColor: '#000000',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
    },
  }) as ShadowStyle,

  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
      shadowColor: '#000000',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
    },
  }) as ShadowStyle,

  xl: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
    },
    android: {
      elevation: 16,
      shadowColor: '#000000',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
    },
  }) as ShadowStyle,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ShadowLevel = keyof typeof shadows;
