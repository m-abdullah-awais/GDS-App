/**
 * InstructorPendingReviewsScreen
 * ================================
 * Review completed lessons — give detailed skill-based feedback.
 * Uses the shared FeedbackModal component with all 54 driving skills
 * and 5-level assessment (Introduced → Independent).
 */

import React, { useMemo, useState } from 'react';
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
import {
  instructorLessons,
  type InstructorLesson,
} from '../../modules/instructor/mockData';
import FeedbackModal from '../../components/instructor/FeedbackModal';
import { useToast } from '../../components/admin';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Pending Reviews'>;

const InstructorPendingReviewsScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [lessons, setLessons] = useState<InstructorLesson[]>(
    instructorLessons.filter((l) => l.status === 'pending_review' && !l.reviewed),
  );
  const [selectedLesson, setSelectedLesson] = useState<InstructorLesson | null>(null);

  const handleOpenReview = (lesson: InstructorLesson) => {
    setSelectedLesson(lesson);
  };

  const handleFeedbackSubmit = (data: { action: string }) => {
    if (data.action === 'lesson_cancelled') {
      setLessons((prev) => prev.filter((l) => l.id !== selectedLesson?.id));
      showToast('warning', 'The student has been notified and hours refunded.');
    } else {
      setLessons((prev) => prev.filter((l) => l.id !== selectedLesson?.id));
      showToast('success', 'Feedback submitted successfully!');
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
        data={lessons}
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
