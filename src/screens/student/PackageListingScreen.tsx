/**
 * GDS Driving School — PackageListingScreen
 * ============================================
 *
 * Lists available driving lesson packages for an instructor.
 * Premium card layout with clear pricing hierarchy.
 */

import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import {
  packages,
  instructors,
  type Package as PackageType,
} from '../../modules/student/mockData';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Route = RouteProp<StudentStackParamList, 'PackageListing'>;

// ─── Package Card ─────────────────────────────────────────────────────────────

const PackageCard = ({
  pkg,
  theme,
  onBuy,
}: {
  pkg: PackageType;
  theme: AppTheme;
  onBuy: () => void;
}) => {
  const s = pkgStyles(theme);
  const discount = Math.round(
    ((pkg.originalPrice - pkg.finalPrice) / pkg.originalPrice) * 100,
  );

  return (
    <View style={[s.card, pkg.popular && s.cardPopular]}>
      {pkg.popular && (
        <View style={s.popularBanner}>
          <Text style={s.popularText}>★ Most Popular</Text>
        </View>
      )}
      <View style={s.cardBody}>
        <View style={s.cardTop}>
          <Text style={s.title}>{pkg.title}</Text>
          <Text style={s.description}>{pkg.description}</Text>
        </View>

        <View style={s.lessonsRow}>
          <View style={s.lessonsBadge}>
            <Text style={s.lessonsCount}>{pkg.lessonCount}</Text>
            <Text style={s.lessonsLabel}>lessons</Text>
          </View>
          <View style={s.priceColumn}>
            <Text style={s.originalPrice}>£{pkg.originalPrice}</Text>
            <Text style={s.finalPrice}>£{pkg.finalPrice}</Text>
            <Text style={s.perLesson}>
              £{(pkg.finalPrice / pkg.lessonCount).toFixed(0)}/lesson
            </Text>
          </View>
        </View>

        {discount > 0 && (
          <View style={s.savingsBadge}>
            <Text style={s.savingsText}>
              Save {discount}% — You save £{pkg.originalPrice - pkg.finalPrice}
            </Text>
          </View>
        )}

        <Button
          title="Buy Package"
          variant="primary"
          size="lg"
          fullWidth
          onPress={onBuy}
        />
      </View>
    </View>
  );
};

const pkgStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    cardPopular: {
      borderWidth: 2,
      borderColor: theme.colors.accent,
    },
    popularBanner: {
      backgroundColor: theme.colors.accent,
      paddingVertical: theme.spacing.xs,
      alignItems: 'center',
    },
    popularText: {
      ...theme.typography.buttonSmall,
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    cardBody: {
      padding: theme.spacing.lg,
    },
    cardTop: {
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    description: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      lineHeight: 22,
    },
    lessonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    lessonsBadge: {
      alignItems: 'center',
    },
    lessonsCount: {
      ...theme.typography.displayMedium,
      color: theme.colors.primary,
    },
    lessonsLabel: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
    },
    priceColumn: {
      alignItems: 'flex-end',
    },
    originalPrice: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      textDecorationLine: 'line-through',
    },
    finalPrice: {
      ...theme.typography.displayMedium,
      color: theme.colors.textPrimary,
    },
    perLesson: {
      ...theme.typography.caption,
      color: theme.colors.success,
      marginTop: 2,
    },
    savingsBadge: {
      backgroundColor: theme.colors.successLight,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    savingsText: {
      ...theme.typography.caption,
      color: theme.colors.success,
      fontWeight: '600',
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const PackageListingScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  const instructor = instructors.find(
    i => i.id === route.params.instructorId,
  );
  const instructorPackages = packages.filter(
    p => p.instructorId === route.params.instructorId,
  );

  return (
    <ScreenContainer showHeader title="Available Packages">
      <FlatList
        data={instructorPackages}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          instructor ? (
            <View style={s.header}>
              <Text style={s.headerTitle}>
                Packages by {instructor.name}
              </Text>
              <Text style={s.headerSubtitle}>
                Choose the package that best fits your learning goals
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <PackageCard
            pkg={item}
            theme={theme}
            onBuy={() =>
              navigation.navigate('BookingRequest', {
                instructorId: route.params.instructorId,
                packageId: item.id,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTitle}>No packages available</Text>
            <Text style={s.emptySubtitle}>
              This instructor hasn't listed any packages yet
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    listContent: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
    },
    header: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    headerTitle: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    headerSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xxs,
    },

    // Empty
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing['3xl'],
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
  });

export default PackageListingScreen;
