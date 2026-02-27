/**
 * InstructorScheduleScreen
 * =========================
 * Upcoming, completed and all lessons list.
 * Pill-style filter tabs + premium card styling (matches student side).
 * Completed tab: tap pending_review lessons to open review bottom sheet.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  instructorLessons as initialLessons,
  type InstructorLesson,
  type LessonStatus,
} from '../../modules/instructor/mockData';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Schedule'>;
type FilterTab = 'upcoming' | 'completed' | 'all';
const RATINGS = [1, 2, 3, 4, 5];

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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');
  const [lessons, setLessons] = useState<InstructorLesson[]>([...initialLessons]);

  // Bottom sheet review state
  const [reviewLesson, setReviewLesson] = useState<InstructorLesson | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredLessons = useMemo(() => {
    if (activeTab === 'all') return lessons;
    if (activeTab === 'upcoming') return lessons.filter(l => l.status === 'upcoming');
    return lessons.filter(l => l.status === 'completed' || l.status === 'pending_review');
  }, [lessons, activeTab]);

  const getCounts = (key: FilterTab) => {
    if (key === 'all') return lessons.length;
    if (key === 'upcoming') return lessons.filter(l => l.status === 'upcoming').length;
    return lessons.filter(l => l.status === 'completed' || l.status === 'pending_review').length;
  };

  const handleLessonPress = useCallback((lesson: InstructorLesson) => {
    if (lesson.status === 'pending_review' && !lesson.reviewed) {
      setReviewLesson(lesson);
      setRating(0);
      setComment('');
    }
  }, []);

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a performance rating.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setLessons(prev =>
        prev.map(l =>
          l.id === reviewLesson?.id ? { ...l, reviewed: true, status: 'completed' as LessonStatus } : l,
        ),
      );
      setReviewLesson(null);
      Alert.alert('Review Submitted', 'Your review has been saved successfully.');
    }, 600);
  };

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

      {/* ── Review Bottom Sheet ──────────────────────────── */}
      <Modal
        visible={reviewLesson !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewLesson(null)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setReviewLesson(null)}>
          <Pressable style={styles.sheetContent} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Review Lesson</Text>

            {reviewLesson && (
              <View style={styles.sheetStudentInfo}>
                <Avatar initials={reviewLesson.studentAvatar} size={52} theme={theme} />
                <View style={styles.sheetStudentDetails}>
                  <Text style={styles.studentName}>{reviewLesson.studentName}</Text>
                  <Text style={styles.lessonDate}>{reviewLesson.date} at {reviewLesson.time}</Text>
                </View>
              </View>
            )}

            {/* Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Performance Rating</Text>
              <View style={styles.starsRow}>
                {RATINGS.map(star => (
                  <Pressable key={star} onPress={() => setRating(star)} style={styles.starButton}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? theme.colors.warning : theme.colors.neutral300}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Comment */}
            <View style={styles.commentSection}>
              <Text style={styles.ratingLabel}>Comment</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="How did the student perform?"
                placeholderTextColor={theme.colors.placeholder}
                style={styles.commentInput}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.sheetActions}>
              <Button
                title="Cancel"
                onPress={() => setReviewLesson(null)}
                variant="outline"
                size="md"
                style={styles.sheetActionBtn}
              />
              <Button
                title={isSubmitting ? 'Submitting...' : 'Submit Review'}
                onPress={handleSubmitReview}
                loading={isSubmitting}
                variant="primary"
                size="md"
                style={styles.sheetActionBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

    // ── Bottom Sheet ────────────────────────────────────
    sheetOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    sheetContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      paddingTop: theme.spacing.sm,
      ...theme.shadows.lg,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.neutral300,
      alignSelf: 'center',
      marginBottom: theme.spacing.lg,
    },
    sheetTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.lg,
    },
    sheetStudentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    sheetStudentDetails: { marginLeft: theme.spacing.sm },
    ratingSection: { marginBottom: theme.spacing.lg },
    ratingLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    starsRow: { flexDirection: 'row', gap: theme.spacing.xs },
    starButton: { padding: theme.spacing.xxs },
    commentSection: { marginBottom: theme.spacing.xl },
    commentInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      minHeight: 100,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
    },
    sheetActions: { flexDirection: 'row', gap: theme.spacing.sm },
    sheetActionBtn: { flex: 1 },
  });

export default InstructorScheduleScreen;
