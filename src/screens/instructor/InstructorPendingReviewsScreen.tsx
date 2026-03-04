/**
 * InstructorPendingReviewsScreen
 * ================================
 * Review completed lessons — give detailed skill-based feedback.
 * Uses the shared FeedbackModal component with all 54 driving skills
 * and 5-level assessment (Introduced → Independent).
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import type { InstructorLesson } from '../../types/instructor-views';
import { toDate } from '../../utils/mappers';
import { useSelector } from 'react-redux';
import * as feedbackService from '../../services/feedbackService';
import FeedbackModal from '../../components/instructor/FeedbackModal';
import { useToast } from '../../components/admin';
import type { FeedbackPending } from '../../types';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Pending Reviews'>;

const InstructorPendingReviewsScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const authProfile = useSelector((state: any) => state.auth.profile);

  const [pendingItems, setPendingItems] = useState<FeedbackPending[]>([]);

  useEffect(() => {
    if (!authProfile?.uid) {
      setPendingItems([]);
      return;
    }

    const unsubscribe = feedbackService.onInstructorPendingFeedback(
      authProfile.uid,
      (items) => {
        setPendingItems(items);
      },
    );

    return unsubscribe;
  }, [authProfile?.uid]);

  const formatDate = (value: unknown): string => {
    const parsed = typeof value === 'string' ? new Date(value) : toDate(value as any);
    if (!parsed || Number.isNaN(parsed.getTime())) {
      return 'Date not available';
    }
    return parsed.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const fallbackInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'ST';

  const pendingReviewLessons: InstructorLesson[] = useMemo(() => {
    return pendingItems.map((item: any) => {
      const studentName = item.student_name || item.studentName || 'Student';
      const lessonDateRaw = item.lesson_date || item.lessonDate;
      const lessonTime = item.lesson_time || item.lessonTime || 'Time not available';
      const durationValue = item.duration || item.totalHours || 1;
      const duration = `${durationValue} hour${durationValue === 1 ? '' : 's'}`;

      return {
        id: item.id,
        studentName,
        studentAvatar: fallbackInitials(studentName),
        date: formatDate(lessonDateRaw),
        time: lessonTime,
        duration,
        status: 'pending_review',
        reviewed: false,
      } as InstructorLesson;
    });
  }, [pendingItems]);

  const [selectedLesson, setSelectedLesson] = useState<InstructorLesson | null>(null);
  const selectedPendingItem = useMemo(
    () => pendingItems.find((item) => item.id === selectedLesson?.id),
    [pendingItems, selectedLesson?.id],
  );

  const handleOpenReview = (lesson: InstructorLesson) => {
    setSelectedLesson(lesson);
  };

  const handleFeedbackSubmit = async (data: { action: string; rating?: number; notes?: string; skills?: any[] }) => {
    try {
      if (!selectedPendingItem) {
        setSelectedLesson(null);
        return;
      }

      if (data.action === 'lesson_cancelled') {
        await feedbackService.completePendingFeedback(selectedPendingItem.id, 'lesson_cancelled');
        showToast('warning', 'The student has been notified and hours refunded.');
      } else {
        await feedbackService.submitFeedback({
          studentId: (selectedPendingItem as any).studentId || (selectedPendingItem as any).student_id || '',
          instructorId: (selectedPendingItem as any).instructorId || (selectedPendingItem as any).instructor_id || authProfile?.uid || '',
          bookingId: selectedPendingItem.bookingId,
          rating: data.rating || 0,
          notes: data.notes || '',
          skills: data.skills || [],
          studentName: (selectedPendingItem as any).student_name || selectedPendingItem.studentName || '',
          instructorName: (selectedPendingItem as any).instructor_name || selectedPendingItem.instructorName || '',
          lessonDate: (selectedPendingItem as any).lesson_date || selectedPendingItem.lessonDate || '',
          lessonTime: (selectedPendingItem as any).lesson_time || selectedPendingItem.lessonTime || '',
          duration: (selectedPendingItem as any).duration || (selectedPendingItem as any).totalHours || 0,
          lessonTitle: (selectedPendingItem as any).lesson_title || `Lesson with ${(selectedPendingItem as any).student_name || selectedPendingItem.studentName || 'Student'}`,
          feedbackPendingId: selectedPendingItem.id,
        });
        showToast('success', 'Feedback submitted successfully!');
      }
    } catch (e) {
      showToast('error', 'Failed to submit feedback.');
    }
    setSelectedLesson(null);
  };

  const renderLesson = ({ item }: { item: InstructorLesson }) => (
    <View style={styles.reviewCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.studentAvatar}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.lessonMeta}>
            {item.date} · {item.duration}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Button
          title="Give Review"
          onPress={() => handleOpenReview(item)}
          variant="primary"
          size="sm"
          fullWidth
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer showHeader title="Pending Reviews" onBackPress={() => navigation.goBack()}>
      <FlatList
        data={pendingReviewLessons}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.headerDescription}>
            Review completed lessons and provide feedback for your students.
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.success} />
            <Text style={styles.emptyText}>All lessons reviewed!</Text>
            <Text style={styles.emptySubtext}>
              No pending reviews at the moment.
            </Text>
          </View>
        }
      />

      {/* Full-screen Feedback Modal */}
      <FeedbackModal
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onSubmit={handleFeedbackSubmit}
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    listContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing['3xl'],
    },
    headerDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    reviewCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textInverse,
    },
    cardInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    studentName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    lessonMeta: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    cardFooter: {
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing['4xl'],
    },
    emptyText: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    emptySubtext: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
  });

export default InstructorPendingReviewsScreen;
