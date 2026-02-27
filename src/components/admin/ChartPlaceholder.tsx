/**
 * GDS Driving School — ChartPlaceholder Component
 * ==================================================
 * Placeholder card for future chart integration.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

interface ChartPlaceholderProps {
  title: string;
  icon?: string;
  subtitle?: string;
  accentColor?: string;
  height?: number;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({
  title,
  icon = 'bar-chart-outline',
  subtitle = 'Chart coming soon',
  accentColor,
  height = 180,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const accent = accentColor ?? theme.colors.primary;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={18} color={accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.placeholder}>
        <View style={[styles.iconCircle, { backgroundColor: accent + '15' }]}>
          <Ionicons name={icon} size={32} color={accent} />
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
  });

export default ChartPlaceholder;
