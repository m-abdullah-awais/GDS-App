/**
 * GDS Driving School — StatsCard Component
 * ===========================================
 * Clean stat card with icon badge, large value, and subtle accent styling.
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
    if (n >= 10000) {
      return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const display = useMemo(() => formatNumber(value), [value]);

  const isSolid = tintColor.toLowerCase() === accentColor.toLowerCase();

  return (
    <View
      style={[
        styles.card,
        isSolid
          ? { backgroundColor: accentColor, borderColor: accentColor }
          : { backgroundColor: theme.colors.surface, borderLeftColor: accentColor, borderLeftWidth: 3 },
      ]}>
      <View style={[styles.iconBadge, { backgroundColor: isSolid ? 'rgba(255,255,255,0.2)' : accentColor + '18' }]}>
        <Ionicons
          name={icon}
          size={18}
          color={isSolid ? '#FFFFFF' : accentColor}
        />
      </View>
      <Text
        style={[styles.value, { color: isSolid ? '#FFFFFF' : theme.colors.textPrimary }]}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {prefix}{display}{suffix}
      </Text>
      <Text style={[styles.title, { color: isSolid ? 'rgba(255,255,255,0.82)' : theme.colors.textTertiary }]}>
        {title}
      </Text>
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
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    value: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    title: {
      ...theme.typography.caption,
      fontWeight: '500',
    },
  });

export default StatsCard;
