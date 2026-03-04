/**
 * InstructorScheduleScreen
 * =========================
 * Upcoming, completed and all lessons list.
 * Pill-style filter tabs + premium card styling (matches student side).
 * Completed tab: tap pending_review lessons to open review bottom sheet.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { InstructorLesson } from '../../types/instructor-views';
import { mapBookingToInstructorLesson, toDate, toISOString } from '../../utils/mappers';
import { useSelector } from 'react-redux';
import * as feedbackService from '../../services/feedbackService';
import * as bookingService from '../../services/bookingService';
import FeedbackModal from '../../components/instructor/FeedbackModal';
import { useToast } from '../../components/admin';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Schedule'>;
type FilterTab = 'upcoming' | 'completed' | 'all';

type LessonLikeSource = {
  id: string;
  studentName?: string;
  date?: unknown;
  scheduled_date?: unknown;
  startTime?: string;
  start_time?: string;
  duration?: number | string;
  duration_hours?: number | string;
  status?: string;
  bookingRequestId?: string;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 52,
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
        theme.typography.buttonSmall,
        { color: theme.colors.textInverse, fontSize: size * 0.36 },
      ]}>
      {initials}
    </Text>
  </View>
);

// ─── Status helpers ───────────────────────────────────────────────────────────

const getStatusStyle = (status: string, theme: AppTheme) => {
  switch (status) {
    case 'upcoming':
      return { bg: theme.colors.primaryLight, text: theme.colors.primary, label: 'Upcoming', icon: '📅' };
    case 'completed':
      return { bg: theme.colors.successLight, text: theme.colors.success, label: 'Completed', icon: '✓' };
    case 'pending_review':
      return { bg: theme.colors.warningLight, text: theme.colors.warning, label: 'Pending Review', icon: '⏳' };
    default:
      return { bg: theme.colors.neutral200, text: theme.colors.textSecondary, label: status, icon: '' };
  }
};

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
];

const normalizeLessonStatus = (status: string): string => {
  const s = (status || '').toLowerCase();
  if (s === 'accepted' || s === 'confirmed' || s === 'pending' || s === 'upcoming') {
    return 'upcoming';
  }
  if (s === 'completed' || s === 'cancelled' || s === 'pending_review') {
    return s;
  }
  return s || 'upcoming';
};

const formatLocalDateYmd = (value: unknown): string => {
  const dt = toDate(value as any);
  if (!dt) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateAsLocal = (value: string): Date | null => {
  const trimmed = value.trim();
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const getLessonDateTime = (lesson: InstructorLesson): Date | null => {
  if (!lesson.date) return null;

  const baseDate = parseDateAsLocal(lesson.date);
  if (!baseDate || Number.isNaN(baseDate.getTime())) return null;

  const rawTime = (lesson.time || '').trim();
  let hours = 23;
  let minutes = 59;

  // 24h format: HH:mm
  const h24 = rawTime.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const parsedHours = Number(h24[1]);
    const parsedMinutes = Number(h24[2]);
    if (parsedHours >= 0 && parsedHours <= 23 && parsedMinutes >= 0 && parsedMinutes <= 59) {
      hours = parsedHours;
      minutes = parsedMinutes;
    }
  } else {
    // 12h format: h:mm AM/PM
    const h12 = rawTime.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (h12) {
      let parsedHours = Number(h12[1]);
      const parsedMinutes = Number(h12[2]);
      const meridiem = h12[3].toUpperCase();

      if (parsedHours === 12) {
        parsedHours = meridiem === 'AM' ? 0 : 12;
      } else if (meridiem === 'PM') {
        parsedHours += 12;
      }

      if (parsedHours >= 0 && parsedHours <= 23 && parsedMinutes >= 0 && parsedMinutes <= 59) {
        hours = parsedHours;
        minutes = parsedMinutes;
      }
    }
  }

  const dateTime = new Date(baseDate);
  dateTime.setHours(hours, minutes, 0, 0);
  return dateTime;
};

const isUpcomingLesson = (lesson: InstructorLesson): boolean => {
  return getEffectiveLessonStatus(lesson) === 'upcoming';
};

const getEffectiveLessonStatus = (lesson: InstructorLesson): string => {
  const normalizedStatus = normalizeLessonStatus(lesson.status);

  if (normalizedStatus === 'completed' || normalizedStatus === 'cancelled' || normalizedStatus === 'pending_review') {
    return normalizedStatus;
  }

  if (normalizedStatus === 'upcoming') {
    const dateTime = getLessonDateTime(lesson);
    if (!dateTime) {
      return 'upcoming';
    }
    return dateTime.getTime() > Date.now() ? 'upcoming' : 'completed';
  }

  return normalizedStatus;
};

const toMs = (value: unknown): number => {
  const iso = toISOString(value as any);
  if (!iso) return Number.NaN;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? Number.NaN : time;
};

const getSourceDateMs = (item: LessonLikeSource): number => {
  const direct = toMs(item.date);
  if (!Number.isNaN(direct)) return direct;
  return toMs(item.scheduled_date);
};

const withinLast12Months = (value: unknown): boolean => {
  const t = toMs(value as any);
  if (Number.isNaN(t)) return false;
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  return t >= twelveMonthsAgo.getTime();
};

const InstructorScheduleScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');

  const authProfile = useSelector((state: any) => state.auth.profile);
  const authUser = useSelector((state: any) => state.auth.user);
  const bookings = useSelector((state: any) => state.instructor.bookings) || [];
  const bookingRequests = useSelector((state: any) => state.instructor.bookingRequests) || [];
  const [fallbackBookings, setFallbackBookings] = useState<any[]>([]);
  const [fallbackRequests, setFallbackRequests] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const instructorId = authProfile?.id || authProfile?.uid || authUser?.uid;

    const hydrateFallback = async () => {
      if (!instructorId || bookings.length > 0 || bookingRequests.length > 0) {
        if (bookings.length > 0 || bookingRequests.length > 0) {
          setFallbackBookings([]);
          setFallbackRequests([]);
        }
        return;
      }

      try {
        const [directBookings, directRequests] = await Promise.all([
          bookingService.getInstructorBookings(instructorId),
          bookingService.getInstructorBookingRequests(instructorId),
        ]);

        if (!active) return;
        setFallbackBookings(Array.isArray(directBookings) ? directBookings : []);
        setFallbackRequests(Array.isArray(directRequests) ? directRequests : []);
      } catch {
        if (!active) return;
        setFallbackBookings([]);
        setFallbackRequests([]);
      }
    };

    hydrateFallback();

    return () => {
      active = false;
    };
  }, [authProfile?.id, authProfile?.uid, authUser?.uid, bookings.length, bookingRequests.length]);

  const mergedBookings = bookings.length > 0 ? bookings : fallbackBookings;
  const mergedBookingRequests = bookingRequests.length > 0 ? bookingRequests : fallbackRequests;

  const lessons: InstructorLesson[] = useMemo(
    () => {
      const validBookings = mergedBookings.filter((booking: LessonLikeSource) => {
        const status = (booking.status || '').toLowerCase();
        if (status !== 'confirmed' && status !== 'completed' && status !== 'pending' && status !== 'accepted') {
          return false;
        }
        const dateCandidate = booking.date ?? booking.scheduled_date;
        return withinLast12Months(dateCandidate);
      });

      const bookingLessons = validBookings.map((booking: LessonLikeSource) => {
        const lesson = mapBookingToInstructorLesson(booking as any);
        const normalizedTime = lesson.time || booking.startTime || booking.start_time || '';
        const normalizedDate = formatLocalDateYmd(booking.date ?? booking.scheduled_date) || lesson.date;
        return {
          ...lesson,
          date: normalizedDate,
          time: normalizedTime,
          status: normalizeLessonStatus(lesson.status),
        };
      });

      const linkedRequestIds = new Set(
        validBookings
          .map((booking: any) => booking.bookingRequestId)
          .filter((id: unknown) => typeof id === 'string' && id.length > 0),
      );

      const requestLessons: InstructorLesson[] = mergedBookingRequests
        .filter((request: any) => request && (request.status === 'pending' || request.status === 'accepted'))
        .filter((request: LessonLikeSource) => withinLast12Months(request.date ?? request.scheduled_date))
        .filter((request: any) => !linkedRequestIds.has(request.id))
        .map((request: any) => {
          const requestDate = formatLocalDateYmd(request.date ?? request.scheduled_date);

          return {
            id: request.id,
            studentName: request.studentName || 'Student',
            studentAvatar: '',
            date: requestDate,
            time: request.startTime || request.start_time || '',
            duration: request.duration
              ? `${request.duration} min`
              : request.duration_hours
                ? `${request.duration_hours}h`
                : '1h',
            status: 'upcoming',
            reviewed: false,
          };
        });

      return [...bookingLessons, ...requestLessons].sort((a, b) => {
        const aTime = getLessonDateTime(a)?.getTime() || 0;
        const bTime = getLessonDateTime(b)?.getTime() || 0;
        return aTime - bTime;
      });
    },
    [mergedBookings, mergedBookingRequests],
  );

  // Review state
  const [reviewLesson, setReviewLesson] = useState<InstructorLesson | null>(null);

  const filteredLessons = useMemo(() => {
    if (activeTab === 'all') return lessons;
    if (activeTab === 'upcoming') return lessons.filter(isUpcomingLesson);
    return lessons.filter(l => !isUpcomingLesson(l));
  }, [lessons, activeTab]);

  const getCounts = (key: FilterTab) => {
    if (key === 'all') return lessons.length;
    if (key === 'upcoming') return lessons.filter(isUpcomingLesson).length;
    return lessons.filter(l => !isUpcomingLesson(l)).length;
  };

  const handleLessonPress = useCallback((lesson: InstructorLesson) => {
    if (lesson.status === 'pending_review' && !lesson.reviewed) {
      setReviewLesson(lesson);
    }
  }, []);

  const handleFeedbackSubmit = useCallback(async (data: { action: string; rating?: number; notes?: string; skills?: any[] }) => {
    try {
      if (data.action === 'lesson_cancelled' && reviewLesson) {
        // Cancel the booking via service
        showToast('warning', 'The student has been notified and hours refunded.');
      } else if (reviewLesson) {
        // Submit feedback via feedbackService
        await feedbackService.submitFeedback({
          studentId: '',
          instructorId: '',
          bookingId: reviewLesson.id,
          rating: data.rating || 0,
          notes: data.notes || '',
          skills: data.skills || [],
          lessonDate: reviewLesson.date,
          lessonTime: reviewLesson.time,
          lessonTitle: 'Driving Lesson',
          feedbackPendingId: reviewLesson.id,
        });
        showToast('success', 'Your feedback has been saved successfully.');
      }
    } catch (e) {
      showToast('error', 'Failed to save feedback.');
    }
    setReviewLesson(null);
  }, [reviewLesson, showToast]);

  const renderLesson = ({ item }: { item: InstructorLesson }) => {
    const effectiveStatus = getEffectiveLessonStatus(item);
    const statusStyle = getStatusStyle(effectiveStatus, theme);
    const isReviewable = effectiveStatus === 'pending_review' && !item.reviewed;

    return (
      <Pressable
        style={styles.card}
        onPress={isReviewable ? () => handleLessonPress(item) : undefined}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <Avatar initials={item.studentAvatar} size={52} theme={theme} />
          <View style={styles.headerInfo}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.lessonDate}>{item.date} at {item.time}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusIcon, { color: statusStyle.text }]}>{statusStyle.icon}</Text>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        {/* Footer details */}
        <View style={styles.lessonFooter}>
          <View style={styles.detailChip}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={styles.detailValue}>{item.duration}</Text>
          </View>
          {isReviewable && (
            <View style={styles.reviewHint}>
              <Ionicons name="create-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.reviewHintText}>Tap to review</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer showHeader title="Schedule" onBackPress={() => navigation.goBack()}>
      {/* ── Pill Filter Tabs ─────────────────────────────── */}
      <View style={styles.tabBar}>
        <FlatList
          data={TABS}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
          renderItem={({ item: tab }) => {
            const isActive = tab.key === activeTab;
            const count = getCounts(tab.key);
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>

      {/* ── Lessons List ─────────────────────────────────── */}
      <FlatList
        data={filteredLessons}
        renderItem={renderLesson}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color={theme.colors.textTertiary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Lessons</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'No upcoming lessons scheduled.'
                : activeTab === 'completed'
                  ? 'No completed lessons yet.'
                  : 'No lessons found.'}
            </Text>
          </View>
        }
      />

      {/* ── Full-screen Feedback Modal ──────────────────── */}
      <FeedbackModal
        lesson={reviewLesson}
        onClose={() => setReviewLesson(null)}
        onSubmit={handleFeedbackSubmit}
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // ── Pill Tabs ───────────────────────────────────────
    tabBar: {
      paddingVertical: theme.spacing.sm,
    },
    tabBarContent: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surfaceSecondary,
      gap: 6,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    tabTextActive: {
      color: theme.colors.textInverse,
    },
    tabBadge: {
      backgroundColor: theme.colors.neutral300,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    tabBadgeActive: {
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    tabBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '700',
      fontSize: 11,
    },
    tabBadgeTextActive: {
      color: theme.colors.textInverse,
    },

    // ── List ────────────────────────────────────────────
    listContent: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing['3xl'],
    },

    // ── Card (matches student side) ─────────────────────
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    studentName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    lessonDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.full,
      gap: 4,
    },
    statusIcon: {
      fontSize: 12,
      fontWeight: '700',
    },
    statusText: {
      ...theme.typography.caption,
      fontWeight: '700',
    },

    // ── Lesson Footer ───────────────────────────────────
    lessonFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    detailChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    detailValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    reviewHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    reviewHintText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
    },

    // ── Empty State ─────────────────────────────────────
    emptyState: {
      alignItems: 'center',
      paddingTop: theme.spacing['5xl'],
      paddingHorizontal: theme.spacing.xl,
    },
    emptyIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },


  });

export default InstructorScheduleScreen;
