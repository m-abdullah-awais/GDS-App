/**
 * GDS Driving School — BookingConfirmModal Component
 * ====================================================
 * Booking summary confirmation modal with slot details.
 */

import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { AvailableSlot, PurchasedPackage } from '../../store/student/types';

interface BookingConfirmModalProps {
  visible: boolean;
  slot: AvailableSlot | null;
  instructorName: string;
  purchasedPackage: PurchasedPackage | null;
  packageName: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  validationError?: string | null;
}

const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  visible,
  slot,
  instructorName,
  purchasedPackage,
  packageName,
  onConfirm,
  onClose,
  loading = false,
  validationError,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!slot) { return null; }

  const remaining = purchasedPackage
    ? purchasedPackage.totalLessons - purchasedPackage.lessonsUsed
    : 0;

  const formattedDate = (() => {
    const date = new Date(slot.date);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  })();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal} onStartShouldSetResponder={() => true}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="calendar-outline"
              size={36}
              color={theme.colors.primary}
            />
          </View>

          <Text style={styles.title}>Confirm Booking</Text>
          <Text style={styles.subtitle}>
            Review the lesson details below
          </Text>

          {/* Booking summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconRow}>
                <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.summaryLabel}>Instructor</Text>
              </View>
              <Text style={styles.summaryValue}>{instructorName}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryIconRow}>
                <Ionicons name="gift-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.summaryLabel}>Package</Text>
              </View>
              <Text style={styles.summaryValue}>{packageName}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryIconRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.summaryLabel}>Date</Text>
              </View>
              <Text style={styles.summaryValue}>{formattedDate}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryIconRow}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.summaryLabel}>Time</Text>
              </View>
              <Text style={styles.summaryValue}>
                {slot.startTime} - {slot.endTime}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryIconRow}>
                <Ionicons name="book-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.summaryLabel}>Remaining</Text>
              </View>
              <Text
                style={[
                  styles.summaryValue,
                  { color: remaining <= 2 ? theme.colors.warning : theme.colors.success },
                ]}>
                {remaining} {remaining === 1 ? 'lesson' : 'lessons'}
              </Text>
            </View>
          </View>

          {/* Validation error */}
          {validationError && (
            <View style={styles.errorRow}>
              <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor: validationError
                    ? theme.colors.textTertiary
                    : theme.colors.primary,
                },
              ]}
              onPress={onConfirm}
              disabled={loading || !!validationError}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.textInverse} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.textInverse} />
                  <Text style={[styles.confirmText, { color: theme.colors.textInverse }]}>
                    Book Lesson
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    modal: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      alignItems: 'center',
      ...theme.shadows.lg,
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.primary + '14',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xxs,
      textAlign: 'center',
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    summaryCard: {
      width: '100%',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    summaryIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    summaryLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      maxWidth: '50%',
      textAlign: 'right',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      width: '100%',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.error + '0A',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.error + '30',
      marginBottom: theme.spacing.md,
    },
    errorText: {
      ...theme.typography.bodySmall,
      color: theme.colors.error,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      width: '100%',
      gap: theme.spacing.sm,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm + 2,
      borderRadius: theme.borderRadius.md,
      gap: 6,
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textSecondary,
    },
    confirmButton: {},
    confirmText: {
      ...theme.typography.buttonMedium,
    },
  });

export default BookingConfirmModal;
