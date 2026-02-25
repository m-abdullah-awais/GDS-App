/**
 * GDS Driving School — Reusable Button Component
 * =================================================
 *
 * A production-ready, theme-aware button that demonstrates the design
 * system in action. Supports multiple variants, sizes, and states.
 *
 * Usage:
 *   <Button title="Book a Lesson" onPress={handlePress} />
 *   <Button title="Cancel" variant="outline" size="sm" />
 *   <Button title="Delete" variant="destructive" />
 *   <Button title="Continue" loading />
 */

import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { AppTheme } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /** Button label */
  title: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Optional icon to the left of the title */
  leftIcon?: React.ReactNode;
  /** Optional icon to the right of the title */
  rightIcon?: React.ReactNode;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override text style */
  textStyle?: StyleProp<TextStyle>;
  /** Full width (stretches to parent) */
  fullWidth?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  ...pressableProps
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const sizeStyles = useMemo(() => getSizeStyles(size, theme), [size, theme]);

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles.container,
        getVariantContainerStyle(variant, theme, isDisabled, pressed),
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {() => (
        <>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={getSpinnerColor(variant, theme)}
              style={styles.spinner}
            />
          ) : leftIcon ? (
            <>{leftIcon}</>
          ) : null}

          <Text
            style={[
              sizeStyles.text,
              getVariantTextStyle(variant, theme, isDisabled),
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {rightIcon && !loading ? <>{rightIcon}</> : null}
        </>
      )}
    </Pressable>
  );
}

// ─── Style Helpers ────────────────────────────────────────────────────────────

function getSizeStyles(size: ButtonSize, theme: AppTheme) {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.borderRadius.md,
          minHeight: 36,
          gap: theme.spacing.xxs,
        } as ViewStyle,
        text: theme.typography.buttonSmall,
      };
    case 'lg':
      return {
        container: {
          paddingVertical: theme.spacing.sm + 2,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.borderRadius.lg,
          minHeight: 52,
          gap: theme.spacing.xs,
        } as ViewStyle,
        text: theme.typography.buttonLarge,
      };
    case 'md':
    default:
      return {
        container: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
          minHeight: 44,
          gap: theme.spacing.xxs + 2,
        } as ViewStyle,
        text: theme.typography.buttonMedium,
      };
  }
}

function getVariantContainerStyle(
  variant: ButtonVariant,
  theme: AppTheme,
  disabled: boolean,
  pressed: boolean,
): ViewStyle {
  const { colors } = theme;

  if (disabled) {
    return {
      backgroundColor:
        variant === 'outline' || variant === 'ghost'
          ? 'transparent'
          : colors.disabled,
      borderWidth: variant === 'outline' ? 1.5 : 0,
      borderColor: variant === 'outline' ? colors.disabled : undefined,
    };
  }

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: pressed ? colors.primaryDark : colors.primary,
      };
    case 'secondary':
      return {
        backgroundColor: pressed
          ? colors.neutral300
          : colors.neutral200,
      };
    case 'outline':
      return {
        backgroundColor: pressed ? colors.pressed : 'transparent',
        borderWidth: 1.5,
        borderColor: colors.border,
      };
    case 'ghost':
      return {
        backgroundColor: pressed ? colors.pressed : 'transparent',
      };
    case 'destructive':
      return {
        backgroundColor: colors.error,
        opacity: pressed ? 0.88 : 1,
      };
    default:
      return {};
  }
}

function getVariantTextStyle(
  variant: ButtonVariant,
  theme: AppTheme,
  disabled: boolean,
): TextStyle {
  const { colors } = theme;

  if (disabled) {
    return { color: colors.disabledText };
  }

  switch (variant) {
    case 'primary':
      return { color: colors.textInverse };
    case 'secondary':
      return { color: colors.textPrimary };
    case 'outline':
      return { color: colors.textPrimary };
    case 'ghost':
      return { color: colors.primary };
    case 'destructive':
      return { color: colors.textInverse };
    default:
      return { color: colors.textPrimary };
  }
}

function getSpinnerColor(variant: ButtonVariant, theme: AppTheme): string {
  switch (variant) {
    case 'primary':
    case 'destructive':
      return theme.colors.textInverse;
    case 'ghost':
      return theme.colors.primary;
    default:
      return theme.colors.textSecondary;
  }
}

// ─── Base Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  spinner: {
    marginRight: 6,
  },
});

export default Button;
