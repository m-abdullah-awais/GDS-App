/**
 * GDS Driving School — LoadingSkeleton Component
 * =================================================
 * Animated shimmer placeholders for loading states.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'card' | 'table' | 'list';
}

const SkeletonLine: React.FC<{
  width: string;
  height: number;
  theme: AppTheme;
  opacity: Animated.Value;
}> = ({ width, height, theme, opacity }) => (
  <Animated.View
    style={[
      {
        width: width as any,
        height,
        backgroundColor: theme.colors.skeleton,
        borderRadius: theme.borderRadius.sm,
        opacity,
      },
    ]}
  />
);

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 3,
  type = 'card',
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  if (type === 'card') {
    return (
      <View style={styles.cardGrid}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={styles.cardSkeleton}>
            <SkeletonLine width="30%" height={36} theme={theme} opacity={opacity} />
            <View style={{ gap: 8, marginTop: 12 }}>
              <SkeletonLine width="60%" height={20} theme={theme} opacity={opacity} />
              <SkeletonLine width="80%" height={14} theme={theme} opacity={opacity} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'table') {
    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableSkeleton}>
          <SkeletonLine width="100%" height={40} theme={theme} opacity={opacity} />
        </View>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={styles.tableRow}>
            <SkeletonLine width="25%" height={16} theme={theme} opacity={opacity} />
            <SkeletonLine width="20%" height={16} theme={theme} opacity={opacity} />
            <SkeletonLine width="15%" height={16} theme={theme} opacity={opacity} />
            <SkeletonLine width="20%" height={16} theme={theme} opacity={opacity} />
          </View>
        ))}
      </View>
    );
  }

  // list type
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <Animated.View
            style={[
              styles.listAvatar,
              { backgroundColor: theme.colors.skeleton, opacity },
            ]}
          />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonLine width="70%" height={16} theme={theme} opacity={opacity} />
            <SkeletonLine width="90%" height={12} theme={theme} opacity={opacity} />
          </View>
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    cardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    cardSkeleton: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tableContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    tableSkeleton: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceSecondary,
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    listAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
  });

export default LoadingSkeleton;
