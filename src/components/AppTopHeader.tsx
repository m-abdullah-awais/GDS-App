import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import type { AppTheme } from '../constants/theme';

type LeftAction = 'menu' | 'back' | 'none';

interface AppTopHeaderProps {
  title: string;
  subtitle?: string;
  avatarText?: string;
  leftAction?: LeftAction;
  onLeftPress?: () => void;
}

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('') || 'GD';

const AppTopHeader: React.FC<AppTopHeaderProps> = ({
  title,
  subtitle,
  avatarText,
  leftAction = 'menu',
  onLeftPress,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const resolvedSubtitle = subtitle ?? new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={[styles.wrapper, { paddingTop: Math.max(insets.top, theme.spacing.sm) }]}>
      <View style={styles.contentRow}>
        {leftAction !== 'none' ? (
          <Pressable style={styles.leftButton} onPress={onLeftPress}>
            <Ionicons
              name={leftAction === 'menu' ? 'menu-outline' : 'arrow-back-outline'}
              size={22}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        ) : (
          <View style={styles.leftSpacer} />
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{resolvedSubtitle}</Text>
        </View>

        <View style={styles.rightBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(avatarText || title)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    leftButton: {
      width: 38,
      height: 38,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
    },
    leftSpacer: {
      width: 38,
      height: 38,
    },
    titleBlock: {
      flex: 1,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    rightBlock: {
      alignItems: 'flex-end',
      gap: 6,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    avatarText: {
      ...theme.typography.caption,
      color: theme.colors.textInverse,
      fontWeight: '700',
      fontSize: 12,
    },
  });

export default AppTopHeader;
