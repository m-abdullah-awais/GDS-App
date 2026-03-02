/**
 * GDS Driving School — PackageCard Component
 * =============================================
 * Card displaying a package with purchase status and CTA.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { InstructorPackage, PurchasedPackage } from '../../store/student/types';

interface PackageCardProps {
  pkg: InstructorPackage;
  purchased?: PurchasedPackage;
  onBuy?: () => void;
  onBookLesson?: () => void;
  loading?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  purchased,
  onBuy,
  onBookLesson,
  loading = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isPurchased = !!purchased;
  const isActive = purchased?.status === 'active';
  const isExhausted = purchased?.status === 'exhausted';
  const remainingLessons = purchased
    ? purchased.totalLessons - purchased.lessonsUsed
    : pkg.totalLessons;

  return (
    <View style={[styles.card, pkg.popular && styles.popularCard]}>
      {pkg.popular && (
        <View style={styles.popularBanner}>
          <Ionicons name="flame" size={12} color={theme.colors.textInverse} />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{pkg.name}</Text>
          {isPurchased && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isActive
                    ? theme.colors.success + '18'
                    : isExhausted
                    ? theme.colors.error + '18'
                    : theme.colors.warning + '18',
                },
              ]}>
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: isActive
                      ? theme.colors.success
                      : isExhausted
                      ? theme.colors.error
                      : theme.colors.warning,
                  },
                ]}>
                {isActive ? 'Active' : isExhausted ? 'Exhausted' : 'Expired'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {pkg.description}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Ionicons name="book-outline" size={15} color={theme.colors.primary} />
            <Text style={styles.detailText}>{pkg.totalLessons} Lessons</Text>
          </View>
          <View style={styles.detail}>
            <Ionicons name="time-outline" size={15} color={theme.colors.primary} />
            <Text style={styles.detailText}>{pkg.duration}</Text>
          </View>
        </View>

        {isPurchased && isActive && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>
                {purchased!.lessonsUsed}/{purchased!.totalLessons} lessons
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(purchased!.lessonsUsed / purchased!.totalLessons) * 100}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.remainingText}>
              {remainingLessons} {remainingLessons === 1 ? 'lesson' : 'lessons'} remaining
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{'\u00A3'}{pkg.price}</Text>
        </View>

        {!isPurchased && (
          <Pressable
            style={[styles.buyButton, { backgroundColor: theme.colors.primary }]}
            onPress={onBuy}
            disabled={loading}>
            <Ionicons name="card-outline" size={16} color={theme.colors.textInverse} />
            <Text style={[styles.buyText, { color: theme.colors.textInverse }]}>
              Buy Package
            </Text>
          </Pressable>
        )}

        {isActive && (
          <Pressable
            style={[styles.buyButton, { backgroundColor: theme.colors.success }]}
            onPress={onBookLesson}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textInverse} />
            <Text style={[styles.buyText, { color: theme.colors.textInverse }]}>
              Book Lesson
            </Text>
          </Pressable>
        )}

        {isExhausted && (
          <View style={[styles.buyButton, styles.exhaustedButton]}>
            <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.textTertiary} />
            <Text style={[styles.buyText, { color: theme.colors.textTertiary }]}>
              All Lessons Used
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    popularCard: {
      borderColor: theme.colors.primary,
      borderWidth: 1.5,
    },
    popularBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: 5,
      gap: 4,
    },
    popularText: {
      ...theme.typography.caption,
      color: theme.colors.textInverse,
      fontWeight: '700',
    },
    content: {
      padding: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xxs,
    },
    name: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    badge: {
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
    },
    badgeText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
    description: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: theme.spacing.sm,
    },
    detailsRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    detailText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    progressSection: {
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    progressLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    progressValue: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    remainingText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '500',
      marginTop: 4,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: theme.spacing.sm,
    },
    price: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    buyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.borderRadius.md,
      gap: 6,
    },
    buyText: {
      ...theme.typography.buttonMedium,
    },
    exhaustedButton: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });

export default PackageCard;
