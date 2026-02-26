/**
 * InstructorScheduleScreen
 * =========================
 * Upcoming, completed and all lessons list.
 * Completed tab: tap pending_review lessons to open review bottom sheet.
 * No manual "Mark as Complete" — completion handled elsewhere.
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

const Avatar = ({ initials, theme }: { initials: string; theme: AppTheme }) => (
  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={[theme.typography.buttonMedium, { color: theme.colors.primary }]}>{initials}</Text>
  </View>
);

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

  const getStatusColor = (status: LessonStatus) => {
    switch (status) {
      case 'upcoming':
        return { bg: theme.colors.primaryLight, text: theme.colors.primary };
      case 'completed':
        return { bg: theme.colors.successLight, text: theme.colors.success };
      case 'pending_review':
        return { bg: theme.colors.warningLight, text: theme.colors.warning };
      default:
        return { bg: theme.colors.neutral200, text: theme.colors.textSecondary };
    }
  };

  const getStatusLabel = (status: LessonStatus) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'pending_review': return 'Pending Review';
      default: return status;
    }
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
    const statusColors = getStatusColor(item.status);
    const isReviewable = item.status === 'pending_review' && !item.reviewed;

    return (
      <Pressable
        style={styles.lessonCard}
        onPress={isReviewable ? () => handleLessonPress(item) : undefined}
      >
        <View style={styles.lessonHeader}>
          <Avatar initials={item.studentAvatar} theme={theme} />
          <View style={styles.lessonInfo}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.lessonDate}>{item.date} at {item.time}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
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

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' },
  ];

  return (
    <ScreenContainer showHeader title="Schedule" onBackPress={() => navigation.goBack()}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, { borderBottomColor: isActive ? theme.colors.primary : 'transparent' }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, { color: isActive ? theme.colors.primary : theme.colors.textSecondary }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Lessons List */}
      <FlatList
        data={filteredLessons}
        renderItem={renderLesson}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No lessons found</Text>
          </View>
        }
      />

      {/* Review Bottom Sheet */}
      <Modal
        visible={reviewLesson !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewLesson(null)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setReviewLesson(null)}>
          <Pressable style={styles.sheetContent} onPress={() => {}}>
            {/* Handle Bar */}
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Review Lesson</Text>

            {reviewLesson && (
              <View style={styles.sheetStudentInfo}>
                <Avatar initials={reviewLesson.studentAvatar} theme={theme} />
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
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 2,
    },
    tabText: { ...theme.typography.buttonMedium },
    listContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing['3xl'],
    },
    lessonCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    lessonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lessonInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    studentName: { ...theme.typography.h4, color: theme.colors.textPrimary },
    lessonDate: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 2 },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.full,
    },
    statusBadgeText: { ...theme.typography.caption },
    lessonFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    detailChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    detailValue: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '600' },
    reviewHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    reviewHintText: { ...theme.typography.caption, color: theme.colors.primary },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing['4xl'],
      gap: theme.spacing.sm,
    },
    emptyText: { ...theme.typography.bodyLarge, color: theme.colors.textTertiary },
    // Bottom Sheet
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
    sheetTitle: { ...theme.typography.h2, color: theme.colors.textPrimary, marginBottom: theme.spacing.lg },
    sheetStudentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    sheetStudentDetails: { marginLeft: theme.spacing.sm },
    ratingSection: { marginBottom: theme.spacing.lg },
    ratingLabel: { ...theme.typography.label, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
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
