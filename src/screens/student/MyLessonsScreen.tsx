/**
 * GDS Driving School — MyLessonsScreen
 * =======================================
 *
 * Tab-based lesson view: Upcoming, Completed, Cancelled.
 * Redux-connected. Uses shared LessonCard component.
 * Supports cancel action for upcoming lessons.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { subscribeToStudentBookings } from '../../store/student/thunks';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { LessonCard } from '../../components/student';
import { filterLessons, cancelLessonBooking } from '../../services/bookingService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { BookedLesson } from '../../store/student/types';

type TabKey = 'upcoming' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const MyLessonsScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Redux
  const lessons = useSelector((st: RootState) => st.student.lessons);
  const profile = useSelector((st: RootState) => st.auth.profile);

  // Subscribe to real-time booking updates for this screen
  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = (dispatch as any)(subscribeToStudentBookings(profile.uid));
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [profile?.uid, dispatch]);

  // Filtered + sorted
  const filteredLessons = useMemo(
    () => filterLessons(lessons, activeTab),
    [lessons, activeTab],
  );

  // Counts per tab
  const counts = useMemo(() => ({
    upcoming: filterLessons(lessons, 'upcoming').length,
    completed: filterLessons(lessons, 'completed').length,
    cancelled: filterLessons(lessons, 'cancelled').length,
  }), [lessons]);

  // Cancel handler
  const handleCancel = useCallback(
    async (lesson: BookedLesson) => {
      setCancellingId(lesson.id);
      await cancelLessonBooking(lesson.id, 'student', dispatch);
      setCancellingId(null);
    },
    [dispatch],
  );

  return (
    <ScreenContainer showHeader title="My Lessons">
      {/* ── Filter Tabs ──────────────────────────────────── */}
      <View style={s.tabBar}>
        <FlatList
          data={TABS}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabBarContent}
          renderItem={({ item: tab }) => {
            const isActive = tab.key === activeTab;
            const count = counts[tab.key];
            return (
              <Pressable
                key={tab.key}
                style={[s.tab, isActive && s.tabActive]}
                onPress={() => setActiveTab(tab.key)}>
                <Text style={[s.tabText, isActive && s.tabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[s.tabBadge, isActive && s.tabBadgeActive]}>
                    <Text style={[s.tabBadgeText, isActive && s.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>

      {/* ── Lesson List ────────────────────────────────────── */}
      <FlatList
        data={filteredLessons}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={s.cardWrapper}>
            <LessonCard
              lesson={item}
              instructorName={item.instructorName}
              onCancel={
                (item.status === 'pending' || item.status === 'confirmed')
                  ? () => handleCancel(item)
                  : undefined
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons
              name={TABS.find(t => t.key === activeTab)?.icon ?? 'calendar-outline'}
              size={48}
              color={theme.colors.textTertiary}
              style={s.emptyIcon}
            />
            <Text style={s.emptyTitle}>
              No {activeTab} lessons
            </Text>
            <Text style={s.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'Book a lesson to get started'
                : activeTab === 'completed'
                ? 'Your completed lessons will appear here'
                : 'No cancelled lessons'}
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
    // Tabs
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

    // List
    listContent: {
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing['3xl'],
    },
    cardWrapper: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },

    // Empty
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing['3xl'],
    },
    emptyIcon: {
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
      textAlign: 'center',
    },
  });

export default MyLessonsScreen;
