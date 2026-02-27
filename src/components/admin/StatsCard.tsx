/**
 * GDS Driving School — StatsCard Component
 * ===========================================
 * Stat card with icon, colored left border, gradient-tinted background.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  accentColor: string;
  tintColor: string;
  prefix?: string;
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  accentColor,
  tintColor,
  prefix = '',
  suffix = '',
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const formatNumber = (n: number): string => {
    const s = Math.round(n).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const display = useMemo(() => formatNumber(value), [value]);

  const isSolidCard = tintColor.toLowerCase() === accentColor.toLowerCase();
  const valueColor = isSolidCard ? theme.colors.textInverse : theme.colors.textPrimary;
  const titleColor = isSolidCard ? 'rgba(255,255,255,0.88)' : theme.colors.textSecondary;
  const iconBg = isSolidCard ? 'rgba(255,255,255,0.2)' : accentColor + '20';
  const iconColor = isSolidCard ? theme.colors.textInverse : accentColor;

  return (
    <View
      style={[
        styles.card,
        {
          borderLeftColor: accentColor,
          backgroundColor: tintColor,
          borderLeftWidth: isSolidCard ? 0 : 4,
        },
      ]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>
      <Text style={[styles.value, { color: valueColor }]}>
        {prefix}{display}{suffix}
      </Text>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexBasis: '47%',
      flexGrow: 1,
      flexShrink: 0,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      borderLeftWidth: 4,
      ...theme.shadows.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },
    title: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });

export default StatsCard;
