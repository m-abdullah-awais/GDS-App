/**
 * GDS Driving School — StatusBadge Component
 * =============================================
 * Pill badge with semantic color + alpha background.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, colorMap }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const defaultColorMap: Record<string, string> = {
    pending: theme.colors.warning,
    approved: theme.colors.success,
    rejected: theme.colors.error,
    active: theme.colors.success,
    suspended: theme.colors.error,
    inactive: theme.colors.textTertiary,
    paid: theme.colors.success,
    verified: theme.colors.success,
    not_provided: theme.colors.textTertiary,
    unread: theme.colors.primary,
    read: theme.colors.textTertiary,
    resolved: theme.colors.success,
  };

  const map = colorMap ?? defaultColorMap;
  const color = map[status.toLowerCase()] ?? theme.colors.textTertiary;
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    badge: {
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
      alignSelf: 'flex-start',
    },
    text: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
  });

export default StatusBadge;
