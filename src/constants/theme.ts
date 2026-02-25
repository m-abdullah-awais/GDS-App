/**
 * GDS Driving School — Unified Theme Configuration
 * ==================================================
 *
 * This file composes every design token (colors, typography, spacing,
 * shadows, radii) into a single typed `AppTheme` object for light
 * and dark modes.
 *
 * The theme is fully compatible with React Native Paper's MD3 provider
 * if you decide to adopt it later — simply map `theme.colors` to Paper's
 * custom theme colors.
 *
 * Usage:
 *   import { useTheme } from '../theme/ThemeContext';
 *   const { theme } = useTheme();
 *   <View style={{ backgroundColor: theme.colors.surface }} />
 */

import { lightColors, darkColors, type ColorTokens } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows, darkShadows } from './shadows';

// ─── Theme Shape ──────────────────────────────────────────────────────────────

export interface AppTheme {
  dark: boolean;
  colors: ColorTokens;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
}

// ─── Light Theme ──────────────────────────────────────────────────────────────

export const lightTheme: AppTheme = {
  dark: false,
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────

export const darkTheme: AppTheme = {
  dark: true,
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  shadows: darkShadows,
};

// ─── Helper: Map to React Native Paper custom theme (optional) ────────────────
/**
 * If you install `react-native-paper`, you can create a Paper-compatible
 * theme by merging our tokens:
 *
 * ```ts
 * import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
 *
 * export const paperLightTheme = {
 *   ...MD3LightTheme,
 *   colors: {
 *     ...MD3LightTheme.colors,
 *     primary: lightColors.primary,
 *     secondary: lightColors.accent,
 *     background: lightColors.background,
 *     surface: lightColors.surface,
 *     error: lightColors.error,
 *     onPrimary: lightColors.textInverse,
 *     onBackground: lightColors.textPrimary,
 *     onSurface: lightColors.textPrimary,
 *     outline: lightColors.border,
 *   },
 * };
 * ```
 */
