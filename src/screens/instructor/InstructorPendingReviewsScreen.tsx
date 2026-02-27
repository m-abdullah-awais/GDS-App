/**
 * InstructorPendingReviewsScreen
 * ================================
 * Review completed lessons - give ratings and comments.
 */

import React, { useMemo, useState } from 'react';
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

type Props = DrawerScreenProps<InstructorTabsParamList, 'Pending Reviews'>;

const RATINGS = [1, 2, 3, 4, 5];

const InstructorPendingReviewsScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [lessons, setLessons] = useState<InstructorLesson[]>(
    instructorLessons.filter((l) => l.status === 'pending_review' && !l.reviewed),
  );
  const [selectedLesson, setSelectedLesson] = useState<InstructorLesson | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReview = (lesson: InstructorLesson) => {
    setSelectedLesson(lesson);
    setRating(0);
    setComment('');
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a performance rating.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setLessons((prev) => prev.filter((l) => l.id !== selectedLesson?.id));
      setSelectedLesson(null);
      Alert.alert('Success', 'Review submitted successfully!');
    }, 600);
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

      {/* Review Modal */}
      <Modal
        visible={selectedLesson !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLesson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Lesson</Text>
            {selectedLesson && (
              <View style={styles.modalStudentInfo}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {selectedLesson.studentAvatar}
                  </Text>
                </View>
                <View style={styles.modalStudentDetails}>
                  <Text style={styles.studentName}>
                    {selectedLesson.studentName}
                  </Text>
                  <Text style={styles.lessonMeta}>
                    {selectedLesson.date} · {selectedLesson.duration}
                  </Text>
                </View>
              </View>
            )}

            {/* Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Performance Rating</Text>
              <View style={styles.starsRow}>
                {RATINGS.map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={
                        star <= rating
                          ? theme.colors.warning
                          : theme.colors.neutral300
                      }
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

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setSelectedLesson(null)}
                variant="outline"
                size="md"
                style={styles.modalActionButton}
              />
              <Button
                title={isSubmitting ? 'Submitting...' : 'Submit Review'}
                onPress={handleSubmitReview}
                loading={isSubmitting}
                variant="primary"
                size="md"
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
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
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      ...theme.shadows.lg,
    },
    modalTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.lg,
    },
    modalStudentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    modalStudentDetails: {
      marginLeft: theme.spacing.sm,
    },
    ratingSection: {
      marginBottom: theme.spacing.lg,
    },
    ratingLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    starsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    starButton: {
      padding: theme.spacing.xxs,
    },
    starText: {
      fontSize: 32,
    },
    commentSection: {
      marginBottom: theme.spacing.xl,
    },
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
    modalActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    modalActionButton: {
      flex: 1,
    },
  });

export default InstructorPendingReviewsScreen;
