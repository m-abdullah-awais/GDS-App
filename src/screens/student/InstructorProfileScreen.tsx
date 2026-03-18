/**
 * GDS Driving School — InstructorProfileScreen
 * ================================================
 *
 * Detailed instructor profile with about, stats, reviews,
 * and navigation to available packages.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/types';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import Avatar from '../../components/Avatar';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { sendInstructorRequestThunk } from '../../store/student/thunks';
import * as userService from '../../services/userService';
import * as feedbackService from '../../services/feedbackService';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Route = RouteProp<StudentStackParamList, 'InstructorProfile'>;

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

interface Review {
  id: string;
  studentName: string;
  date: string;
  rating: number;
  comment: string;
}

const InstructorProfileScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  // Defer heavy render until navigation animation completes
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => setReady(true));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const profile = useSelector((state: RootState) => state.auth.profile);
  // Get instructor from Redux store (populated by loadStudentData)
  const instructorVM = useSelector((state: RootState) =>
    (state.student.instructors || []).find(i => i.id === route.params.instructorId),
  );
  const requests = useSelector((state: RootState) => state.student.requests || []);

  // Fetch full profile + reviews from Firestore
  const [instructorDetail, setInstructorDetail] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchDetails = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        // Fetch user and reviews in parallel, but don't let review failure block profile
        const userPromise = userService.getUserById(route.params.instructorId);
        const reviewsPromise = feedbackService.getInstructorFeedback(route.params.instructorId)
          .catch(() => [] as any[]); // Reviews failing shouldn't block the profile

        const [user, fbReviews] = await Promise.all([userPromise, reviewsPromise]);
        if (cancelled) return;
        setInstructorDetail(user);
        setReviews((fbReviews || []).map((r: any) => {
          // Handle Firestore Timestamp, Date, string, or number
          let dateStr = '';
          const ts = r.createdAt || r.submittedAt;
          if (ts) {
            const d = typeof ts.toDate === 'function'
              ? ts.toDate()
              : ts instanceof Date
                ? ts
                : new Date(ts);
            if (!isNaN(d.getTime())) {
              dateStr = d.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
            }
          }
          return {
            id: r.id,
            studentName: r.studentName || r.student_name || 'Student',
            date: dateStr,
            rating: r.rating || 0,
            comment: r.comment || r.feedback || r.notes || '',
          };
        }));
      } catch (err) {
        if (!cancelled) setLoadError(true);
        console.error('Failed to load instructor details:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetails();
    return () => { cancelled = true; };
  }, [route.params.instructorId]);

  // Merge data: prefer Firestore detail, fallback to Redux VM
  // Normalize field names between raw Firestore (snake_case) and Redux VM (camelCase)
  const raw = instructorDetail;
  const instructor = raw
    ? {
        ...raw,
        // Ensure VM-style fields are available from raw Firestore fields
        name: raw.name || raw.full_name || instructorVM?.name || '',
        about: raw.about || raw.about_me || raw.bio || '',
        bio: raw.bio || raw.about_me || raw.about || '',
        transmissionType: raw.transmissionType || raw.car_transmission || instructorVM?.transmissionType || 'Manual',
        coveredPostcodes: raw.coveredPostcodes || raw.covered_postcodes || raw.postcodes
          || (raw.postcode ? [raw.postcode] : [])
          || instructorVM?.coveredPostcodes || [],
        passRate: raw.passRate || raw.pass_rate || instructorVM?.passRate || 0,
        yearsExperience: raw.yearsExperience || raw.years_experience || instructorVM?.yearsExperience || 0,
        acceptingStudents: raw.acceptingStudents ?? (raw.status === 'active') ?? instructorVM?.acceptingStudents ?? true,
        rating: raw.rating || instructorVM?.rating || 0,
        avatar: raw.avatar || raw.profile_picture_url || raw.profileImage || instructorVM?.avatar || '',
        id: raw.id || raw.uid || instructorVM?.id || '',
      }
    : instructorVM;

  if (!ready || (loading && !instructor)) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!instructor || loadError) {
    return (
      <ScreenContainer showHeader title="Instructor">
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>{loadError ? '⚠️' : '😔'}</Text>
          <Text style={s.emptyTitle}>{loadError ? 'Failed to load' : 'Instructor not found'}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showHeader title={instructor.name || 'Instructor'}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Header Card ──────────────────────────────────── */}
        <View style={s.headerCard}>
          <Avatar initials={instructor.name || 'I'} imageUrl={instructor.avatar} size={80} />
          <Text style={s.name}>{instructor.name || ''}</Text>
          <View style={s.ratingRow}>
            <StarRating rating={Math.round(instructor.rating || 0)} theme={theme} />
            <Text style={s.ratingText}>
              {instructor.rating || 0} ({reviews.length} reviews)
            </Text>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statValue}>{instructor.passRate || instructor.pass_rate || 'N/A'}%</Text>
              <Text style={s.statLabel}>Pass Rate</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statValue}>{instructor.yearsExperience || instructor.years_experience || '-'}</Text>
              <Text style={s.statLabel}>Years Exp</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statValue}>{reviews.length}</Text>
              <Text style={s.statLabel}>Reviews</Text>
            </View>
          </View>

          {instructor.acceptingStudents ? (
            <View style={s.acceptingBadge}>
              <Text style={s.acceptingText}><Ionicons name="checkmark-circle" size={14} color="inherit" /> Currently Accepting Students</Text>
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
          <Text style={s.aboutText}>{instructor.about || instructor.bio || 'No bio provided.'}</Text>
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
                {(instructor.coveredPostcodes || instructor.covered_postcodes || instructor.postcodes || []).map((code: string) => (
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
              {reviews.length} reviews
            </Text>
          </View>
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} theme={theme} />
          ))}
        </View>

        {/* ── Request / Packages CTA ───────────────────── */}
        <View style={s.ctaSection}>
          {(() => {
            const existingRequest = requests.find(
              r => r.instructorId === instructor.id,
            );

            if (existingRequest?.status === 'accepted') {
              return (
                <>
                  <View style={s.ctaStatusRow}>
                    <View style={[s.ctaStatusBadge, { backgroundColor: theme.colors.successLight }]}>
                      <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                      <Text style={[s.ctaStatusText, { color: theme.colors.success }]}>
                        Request Accepted
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
                  <Ionicons name="hourglass-outline" size={32} color={theme.colors.warning} style={{ marginBottom: 8 }} />
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
                      <Ionicons name="close-circle" size={14} color={theme.colors.error} />
                      <Text style={[s.ctaStatusText, { color: theme.colors.error }]}>
                        Previous Request Declined
                      </Text>
                    </View>
                  </View>
                  <Button
                    title="Send New Request"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={sendingRequest}
                    onPress={async () => {
                      if (!profile?.uid) return;
                      setSendingRequest(true);
                      try {
                        await (dispatch as any)(sendInstructorRequestThunk(
                          profile.uid,
                          instructor.id,
                          (profile as any).displayName || (profile as any).full_name || (profile as any).name || '',
                          profile.email,
                        ));
                      } catch {} finally {
                        setSendingRequest(false);
                      }
                    }}
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
                loading={sendingRequest}
                onPress={async () => {
                  if (!profile?.uid) return;
                  setSendingRequest(true);
                  try {
                    await (dispatch as any)(sendInstructorRequestThunk(
                      profile.uid,
                      instructor.id,
                      (profile as any).displayName || (profile as any).full_name || (profile as any).name || '',
                      profile.email,
                    ));
                  } catch {} finally {
                    setSendingRequest(false);
                  }
                }}
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
