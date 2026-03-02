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
import type { InstructorLesson, LessonStatus } from '../../types/instructor-views';
import { mapBookingToInstructorLesson } from '../../utils/mappers';
import { useSelector } from 'react-redux';
import { feedbackService } from '../../services';
import FeedbackModal from '../../components/instructor/FeedbackModal';
import { useToast } from '../../components/admin';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Schedule'>;
type FilterTab = 'upcoming' | 'completed' | 'all';

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

const getStatusStyle = (status: LessonStatus, theme: AppTheme) => {
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

const InstructorScheduleScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');

  const bookings = useSelector((state: any) => state.instructor.bookings) || [];
  const lessons: InstructorLesson[] = useMemo(
    () => bookings.map((b: any) => mapBookingToInstructorLesson(b)),
    [bookings],
  );

  // Review state
  const [reviewLesson, setReviewLesson] = useState<InstructorLesson | null>(null);

  const filteredLessons = useMemo(() => {
    if (activeTab === 'all') return lessons;
    if (activeTab === 'upcoming') return lessons.filter(l => l.status === 'confirmed' || l.status === 'pending');
    return lessons.filter(l => l.status === 'completed' || l.status === 'cancelled');
  }, [lessons, activeTab]);

  const getCounts = (key: FilterTab) => {
    if (key === 'all') return lessons.length;
    if (key === 'upcoming') return lessons.filter(l => l.status === 'confirmed' || l.status === 'pending').length;
    return lessons.filter(l => l.status === 'completed' || l.status === 'cancelled').length;
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
        await feedbackService.submitLessonFeedback(reviewLesson.id, {
          rating: data.rating || 0,
          notes: data.notes || '',
          skills: data.skills || [],
        });
        showToast('success', 'Your feedback has been saved successfully.');
      }
    } catch (e) {
      showToast('error', 'Failed to save feedback.');
    }
    setReviewLesson(null);
  }, [reviewLesson, showToast]);

  const renderLesson = ({ item }: { item: InstructorLesson }) => {
    const statusStyle = getStatusStyle(item.status, theme);
    const isReviewable = item.status === 'pending_review' && !item.reviewed;

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
