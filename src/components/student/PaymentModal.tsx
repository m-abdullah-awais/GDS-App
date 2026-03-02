/**
 * GDS Driving School — PaymentModal Component
 * ===============================================
 * Two-phase modal: confirm payment → success animation.
 */

import React, { useMemo, useState, useEffect } from 'react';
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
import type { InstructorPackage } from '../../store/student/types';

interface PaymentModalProps {
  visible: boolean;
  pkg: InstructorPackage | null;
  instructorName: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  pkg,
  instructorName,
  onConfirm,
  onClose,
  loading = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [phase, setPhase] = useState<'confirm' | 'success'>('confirm');

  // Reset phase when modal opens
  useEffect(() => {
    if (visible) {
      setPhase('confirm');
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm();
    // The parent will set loading=true, then after async completes
    // it should set loading=false and call onClose or we detect completion
  };

  // Detect when loading transitions from true to false (payment completed)
  const prevLoadingRef = React.useRef(loading);
  useEffect(() => {
    if (prevLoadingRef.current && !loading && visible && phase === 'confirm') {
      setPhase('success');
    }
    prevLoadingRef.current = loading;
  }, [loading, visible, phase]);

  if (!pkg) { return null; }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={phase === 'success' ? onClose : undefined}>
        <View style={styles.modal}>
          {phase === 'confirm' ? (
            <>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="card-outline"
                  size={36}
                  color={theme.colors.primary}
                />
              </View>

              <Text style={styles.title}>Confirm Purchase</Text>
              <Text style={styles.subtitle}>
                You are about to purchase a package from {instructorName}
              </Text>

              {/* Package summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Package</Text>
                  <Text style={styles.summaryValue}>{pkg.name}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Lessons</Text>
                  <Text style={styles.summaryValue}>{pkg.totalLessons}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration</Text>
                  <Text style={styles.summaryValue}>{pkg.duration}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
                  <Text style={[styles.summaryValue, styles.totalValue]}>
                    {'\u00A3'}{pkg.price}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleConfirm}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.textInverse} />
                  ) : (
                    <>
                      <Ionicons name="card-outline" size={16} color={theme.colors.textInverse} />
                      <Text style={[styles.confirmText, { color: theme.colors.textInverse }]}>
                        Pay {'\u00A3'}{pkg.price}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            /* Success phase */
            <>
              <View style={[styles.successIcon, { backgroundColor: theme.colors.success + '18' }]}>
                <Ionicons
                  name="checkmark-circle"
                  size={52}
                  color={theme.colors.success}
                />
              </View>

              <Text style={styles.title}>Payment Successful</Text>
              <Text style={styles.subtitle}>
                You now have {pkg.totalLessons} lessons available with {instructorName}.
                You can start booking your lessons right away!
              </Text>

              <Pressable
                style={[styles.button, styles.doneButton, { backgroundColor: theme.colors.success }]}
                onPress={onClose}>
                <Text style={[styles.confirmText, { color: theme.colors.textInverse }]}>
                  Done
                </Text>
              </Pressable>
            </>
          )}
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
    successIcon: {
      width: 88,
      height: 88,
      borderRadius: 44,
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
      lineHeight: 20,
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
      paddingVertical: theme.spacing.xs,
    },
    summaryLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    totalLabel: {
      ...theme.typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    totalValue: {
      ...theme.typography.h4,
      color: theme.colors.primary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
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
    doneButton: {
      width: '100%',
    },
  });

export default PaymentModal;
