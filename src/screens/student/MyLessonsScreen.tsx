/**
 * GDS Driving School — MyLessonsScreen
 * =======================================
 *
 * Tab-based lesson view: Upcoming, Completed, Cancelled.
 * Each lesson card shows instructor, date, time, duration, status badge.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { lessons, type Lesson, type LessonStatus } from '../../modules/student/mockData';
import Ionicons from 'react-native-vector-icons/Ionicons';

type TabKey = 'upcoming' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

const getStatusStyle = (status: LessonStatus, theme: AppTheme) => {
  switch (status) {
    case 'upcoming':
      return {
        bg: theme.colors.primaryLight,
        text: theme.colors.primary,
        label: 'Upcoming',
      };
    case 'completed':
      return {
        bg: theme.colors.successLight,
        text: theme.colors.success,
        label: 'Completed',
      };
    case 'cancelled':
      return {
        bg: theme.colors.errorLight,
        text: theme.colors.error,
        label: 'Cancelled',
      };
  }
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 44,
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

// ─── Lesson Card ──────────────────────────────────────────────────────────────

const LessonCard = ({
  lesson,
  theme,
}: {
  lesson: Lesson;
  theme: AppTheme;
}) => {
  const s = lessonStyles(theme);
  const status = getStatusStyle(lesson.status, theme);

  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <Avatar initials={lesson.instructorAvatar} size={44} theme={theme} />
      </View>
      <View style={s.cardCenter}>
        <Text style={s.instructorName}>{lesson.instructorName}</Text>
        <View style={s.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={s.metaText}>{lesson.date}</Text>
        </View>
        <View style={s.metaRow}>
          <Ionicons name="time-outline" size={13} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={s.metaText}>{lesson.time}</Text>
          <Text style={s.metaDot}>·</Text>
          <Text style={s.metaText}>{lesson.duration}</Text>
        </View>
        {lesson.location && (
          <View style={s.metaRow}>
            <Ionicons name="location-outline" size={13} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
            <Text style={s.locationText} numberOfLines={1}>{lesson.location}</Text>
          </View>
        )}
      </View>
      <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
        <Text style={[s.statusText, { color: status.text }]}>
          {status.label}
        </Text>
      </View>
    </View>
  );
};

const lessonStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'flex-start',
      ...theme.shadows.sm,
    },
    cardLeft: {
      marginRight: theme.spacing.sm,
    },
    cardCenter: {
      flex: 1,
    },
    instructorName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xxs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    metaText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    metaDot: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginHorizontal: theme.spacing.xxs,
    },
    locationText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.sm,
      marginLeft: theme.spacing.xs,
    },
    statusText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const MyLessonsScreen = () => {
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');

  const filteredLessons = useMemo(
    () => lessons.filter(l => l.status === activeTab),
    [activeTab],
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
            const count = lessons.filter(l => l.status === tab.key).length;
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
          <LessonCard lesson={item} theme={theme} />
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons
              name={
                activeTab === 'upcoming'
                  ? 'calendar-outline'
                  : activeTab === 'completed'
                  ? 'checkmark-circle-outline'
                  : 'close-circle-outline'
              }
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
