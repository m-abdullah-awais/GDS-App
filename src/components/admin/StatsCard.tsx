/**
 * GDS Driving School — StatsCard Component
 * ===========================================
 * Stat card with icon, colored left border, gradient-tinted background.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
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
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);
  const [display, setDisplay] = React.useState('0');

  const formatNumber = (n: number): string => {
    const s = Math.round(n).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  useEffect(() => {
    animatedValue.setValue(0);
    const listener = animatedValue.addListener(({ value: v }) => {
      displayValue.current = Math.round(v);
      setDisplay(formatNumber(v));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, animatedValue]);

  return (
    <View style={[styles.card, { borderLeftColor: accentColor, backgroundColor: tintColor }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
          <Ionicons name={icon} size={20} color={accentColor} />
        </View>
      </View>
      <Text style={styles.value}>
        {prefix}{display}{suffix}
      </Text>
      <Text style={styles.title}>{title}</Text>
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
