/**
 * GDS Driving School — LessonCard Component
 * ============================================
 * Card for booked lessons with status badge, instructor info, and actions.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { BookedLesson, BookingLessonStatus } from '../../store/student/types';

interface LessonCardProps {
  lesson: BookedLesson;
  instructorName?: string;
  onCancel?: () => void;
  onViewDetails?: () => void;
}

const STATUS_CONFIG: Record<
  BookingLessonStatus,
  { icon: string; label: string; colorKey: 'warning' | 'success' | 'primary' | 'error' }
> = {
  pending: { icon: 'time-outline', label: 'Pending Approval', colorKey: 'warning' },
  accepted: { icon: 'checkmark-circle-outline', label: 'Accepted', colorKey: 'success' },
  confirmed: { icon: 'checkmark-circle-outline', label: 'Confirmed', colorKey: 'success' },
  amendment_pending: { icon: 'swap-horizontal-outline', label: 'Amendment Pending', colorKey: 'warning' },
  completed: { icon: 'checkmark-done-outline', label: 'Completed', colorKey: 'primary' },
  cancelled: { icon: 'close-circle-outline', label: 'Cancelled', colorKey: 'error' },
};

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  instructorName,
  onCancel,
  onViewDetails,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const config = STATUS_CONFIG[lesson.status];
  const statusColor = theme.colors[config.colorKey];
  const isUpcoming = lesson.status === 'pending' || lesson.status === 'accepted' || lesson.status === 'confirmed' || lesson.status === 'amendment_pending';

  const formattedDate = useMemo(() => {
    const date = new Date(lesson.date);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [lesson.date]);

  return (
    <Pressable style={styles.card} onPress={onViewDetails}>
      {/* Status strip */}
      <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {!!lesson.packageName && (
              <Text style={styles.packageName} numberOfLines={1}>
                {lesson.packageName}
              </Text>
            )}
            {!!(instructorName || lesson.instructorName) && (
              <Text style={styles.instructorName} numberOfLines={1}>
                {instructorName || lesson.instructorName}
              </Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '18' }]}>
            <Ionicons name={config.icon} size={12} color={statusColor} />
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>
              {lesson.time} ({lesson.duration})
            </Text>
          </View>
        </View>

        {/* Location */}
        {!!lesson.location && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{lesson.location}</Text>
          </View>
        )}

        {/* Cancellation info */}
        {lesson.status === 'cancelled' && lesson.cancelledBy && (
          <View style={styles.cancelledRow}>
            <Ionicons name="information-circle-outline" size={14} color={theme.colors.error} />
            <Text style={styles.cancelledText}>
              Cancelled by {lesson.cancelledBy === 'student' ? 'you' : 'instructor'}
            </Text>
          </View>
        )}

        {/* Actions */}
        {isUpcoming && onCancel && (
          <View style={styles.actionsRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Ionicons name="close-outline" size={16} color={theme.colors.error} />
              <Text style={[styles.cancelText, { color: theme.colors.error }]}>
                Cancel Lesson
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    statusStrip: {
      width: 4,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    headerLeft: {
      flex: 1,
      marginRight: theme.spacing.xs,
    },
    packageName: {
      ...theme.typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    instructorName: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
      gap: 4,
    },
    badgeText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xxs,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginBottom: theme.spacing.xxs,
    },
    infoText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    cancelledRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: theme.spacing.xxs,
      padding: theme.spacing.xs,
      backgroundColor: theme.colors.error + '0A',
      borderRadius: theme.borderRadius.sm,
    },
    cancelledText: {
      ...theme.typography.caption,
      color: theme.colors.error,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.xs,
      paddingTop: theme.spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: theme.spacing.xs,
    },
    cancelText: {
      ...theme.typography.bodySmall,
      fontWeight: '600',
    },
  });

export default LessonCard;
