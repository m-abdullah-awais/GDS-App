/**
 * GDS Driving School — InstructorProfileScreen
 * ================================================
 *
 * Detailed instructor profile with about, stats, reviews,
 * and navigation to available packages.
 */

import React from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
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
import { instructors, studentRequests, type Review } from '../../modules/student/mockData';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Route = RouteProp<StudentStackParamList, 'InstructorProfile'>;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 80,
  theme,
}: {
  initials: string;
  size?: number;
  theme: AppTheme;
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text
      style={[
        theme.typography.h1,
        { color: theme.colors.textInverse, fontSize: size * 0.36 },
      ]}>
      {initials}
    </Text>
  </View>
);

// ─── Star Rating ──────────────────────────────────────────────────────────────

const StarRating = ({ rating, theme }: { rating: number; theme: AppTheme }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Text
        key={i}
        style={{
          fontSize: 16,
          color: i <= rating ? theme.colors.warning : theme.colors.neutral300,
        }}>
        ★
      </Text>
    ))}
  </View>
);

// ─── Review Card ──────────────────────────────────────────────────────────────

const ReviewCard = ({ review, theme }: { review: Review; theme: AppTheme }) => {
  const s = reviewCardStyles(theme);
  return (
    <View style={s.card}>
      <View style={s.header}>
        <View>
          <Text style={s.name}>{review.studentName}</Text>
          <Text style={s.date}>{review.date}</Text>
        </View>
        <StarRating rating={review.rating} theme={theme} />
      </View>
      <Text style={s.comment}>{review.comment}</Text>
    </View>
  );
};

const reviewCardStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    name: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    date: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    comment: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const InstructorProfileScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  const instructor = instructors.find(i => i.id === route.params.instructorId);

  if (!instructor) {
    return (
      <ScreenContainer showHeader title="Instructor">
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>😔</Text>
          <Text style={s.emptyTitle}>Instructor not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showHeader title={instructor.name}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Header Card ──────────────────────────────────── */}
        <View style={s.headerCard}>
          <Avatar initials={instructor.avatar} size={80} theme={theme} />
          <Text style={s.name}>{instructor.name}</Text>
          <View style={s.ratingRow}>
            <StarRating rating={Math.round(instructor.rating)} theme={theme} />
            <Text style={s.ratingText}>
              {instructor.rating} ({instructor.reviewCount} reviews)
            </Text>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statValue}>{instructor.passRate}%</Text>
              <Text style={s.statLabel}>Pass Rate</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statValue}>{instructor.yearsExperience}</Text>
              <Text style={s.statLabel}>Years Exp</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statValue}>{instructor.reviewCount}</Text>
              <Text style={s.statLabel}>Reviews</Text>
            </View>
          </View>

          {instructor.acceptingStudents ? (
            <View style={s.acceptingBadge}>
              <Text style={s.acceptingText}>✓ Currently Accepting Students</Text>
            </View>
          ) : (
            <View style={s.notAcceptingBadge}>
              <Text style={s.notAcceptingText}>Currently Fully Booked</Text>
            </View>
          )}
        </View>

        {/* ── About Section ────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <Text style={s.aboutText}>{instructor.about}</Text>
        </View>

        {/* ── Transmission & Areas ─────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Details</Text>
          <View style={s.detailsCard}>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Transmission</Text>
              <View style={s.detailChip}>
                <Text style={s.detailChipText}>
                  {instructor.transmissionType}
                </Text>
              </View>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Areas Covered</Text>
              <View style={s.areasRow}>
                {instructor.coveredPostcodes.map(code => (
                  <View key={code} style={s.areaChip}>
                    <Text style={s.areaChipText}>{code}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ── Reviews Preview ──────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Reviews</Text>
            <Text style={s.reviewCount}>
              {instructor.reviews.length} reviews
            </Text>
          </View>
          {instructor.reviews.map(review => (
            <ReviewCard key={review.id} review={review} theme={theme} />
          ))}
        </View>

        {/* ── Request / Packages CTA ───────────────────── */}
        <View style={s.ctaSection}>
          {(() => {
            const existingRequest = studentRequests.find(
              r => r.instructorId === instructor.id,
            );

            if (existingRequest?.status === 'accepted') {
              return (
                <>
                  <View style={s.ctaStatusRow}>
                    <View style={[s.ctaStatusBadge, { backgroundColor: theme.colors.successLight }]}>
                      <Text style={[s.ctaStatusText, { color: theme.colors.success }]}>
                        ✓ Request Accepted
                      </Text>
                    </View>
                  </View>
                  <Button
                    title="View Available Packages"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={() =>
                      navigation.navigate('PackageListing', {
                        instructorId: instructor.id,
                      })
                    }
                  />
                </>
              );
            }

            if (existingRequest?.status === 'pending') {
              return (
                <View style={s.ctaPendingCard}>
                  <Text style={s.ctaPendingIcon}>⏳</Text>
                  <Text style={s.ctaPendingTitle}>Request Pending</Text>
                  <Text style={s.ctaPendingSubtitle}>
                    Your request has been sent. You'll be able to view packages once the instructor accepts.
                  </Text>
                </View>
              );
            }

            if (existingRequest?.status === 'rejected') {
              return (
                <>
                  <View style={s.ctaStatusRow}>
                    <View style={[s.ctaStatusBadge, { backgroundColor: theme.colors.errorLight }]}>
                      <Text style={[s.ctaStatusText, { color: theme.colors.error }]}>
                        ✗ Previous Request Declined
                      </Text>
                    </View>
                  </View>
                  <Button
                    title="Send New Request"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={() => {}}
                  />
                </>
              );
            }

            // No request yet
            return (
              <Button
                title="Send Request to Instructor"
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => {}}
              />
            );
          })()}
        </View>

        <View style={{ height: theme.spacing['2xl'] }} />
      </ScrollView>
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing['3xl'],
    },

    // Header
    headerCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      alignItems: 'center',
      ...theme.shadows.md,
    },
    name: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    ratingText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      width: '100%',
    },
    stat: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      ...theme.typography.h2,
      color: theme.colors.primary,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: theme.colors.divider,
    },
    acceptingBadge: {
      backgroundColor: theme.colors.successLight,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      marginTop: theme.spacing.lg,
    },
    acceptingText: {
      ...theme.typography.bodySmall,
      color: theme.colors.success,
      fontWeight: '600',
    },
    notAcceptingBadge: {
      backgroundColor: theme.colors.warningLight,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      marginTop: theme.spacing.lg,
    },
    notAcceptingText: {
      ...theme.typography.bodySmall,
      color: theme.colors.warning,
      fontWeight: '600',
    },

    // Sections
    section: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    reviewCount: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
    aboutText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },

    // Details Card
    detailsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    detailLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    detailChip: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.sm,
    },
    detailChipText: {
      ...theme.typography.bodySmall,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    detailDivider: {
      height: 1,
      backgroundColor: theme.colors.divider,
    },
    areasRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xxs,
    },
    areaChip: {
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.sm,
    },
    areaChipText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },

    // CTA
    ctaSection: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing['2xl'],
    },
    ctaStatusRow: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    ctaStatusBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
    },
    ctaStatusText: {
      ...theme.typography.bodySmall,
      fontWeight: '700',
    },
    ctaPendingCard: {
      backgroundColor: theme.colors.warningLight,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      alignItems: 'center',
    },
    ctaPendingIcon: {
      fontSize: 32,
      marginBottom: theme.spacing.sm,
    },
    ctaPendingTitle: {
      ...theme.typography.h3,
      color: theme.colors.warning,
      marginBottom: theme.spacing.xxs,
    },
    ctaPendingSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },

    // Empty
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
  });

export default InstructorProfileScreen;
