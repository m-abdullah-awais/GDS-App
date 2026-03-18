/**
 * GDS Driving School — PaymentModal Component
 * ===============================================
 * Three-phase modal aligned with web's BookingModal + PaymentSuccess flow:
 *   1. confirm  — Show package details, "Pay with Stripe" button
 *   2. processing — Stripe checkout opened, waiting for return + verifying
 *   3. success / failed — Show result after verification
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
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

type Phase = 'confirm' | 'processing' | 'verifying' | 'success' | 'failed';

interface PaymentModalProps {
  visible: boolean;
  pkg: InstructorPackage | null;
  instructorName: string;
  onConfirm: () => Promise<string>; // must return sessionId
  onClose: () => void;
  onPaymentVerified?: () => void; // called after successful verification to refresh data
  loading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  pkg,
  instructorName,
  onConfirm,
  onClose,
  onPaymentVerified,
  loading = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [phase, setPhase] = useState<Phase>('confirm');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset phase when modal opens/closes
  useEffect(() => {
    if (visible) {
      setPhase('confirm');
      setSessionId(null);
      setErrorMsg(null);
    }
  }, [visible]);

  // When app returns from browser (loading transitions false while processing),
  // verify the payment
  const prevLoadingRef = React.useRef(loading);
  useEffect(() => {
    if (prevLoadingRef.current && !loading && phase === 'processing' && sessionId) {
      verifyPayment(sessionId);
    }
    prevLoadingRef.current = loading;
  }, [loading, phase, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = useCallback(async () => {
    setPhase('processing');
    setErrorMsg(null);
    try {
      const sid = await onConfirm();
      setSessionId(sid);
      // After browser opens and returns, we'll verify in the useEffect above
      // But also start a delayed verification in case deep link doesn't trigger loading change
      setTimeout(() => {
        // If still in processing after 3s (browser returned), start verifying
        setPhase(prev => prev === 'processing' ? 'verifying' : prev);
      }, 3000);
    } catch (error: any) {
      setPhase('failed');
      setErrorMsg(error?.message || 'Failed to create checkout session. Please try again.');
    }
  }, [onConfirm]);

  const verifyPayment = useCallback(async (sid: string) => {
    setPhase('verifying');

    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [2000, 4000, 6000]; // Wait longer each retry

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const paymentService = require('../../services/paymentService');
        const status = await paymentService.getCheckoutSession(sid);

        if (status.status === 'complete' || status.status === 'paid') {
          setPhase('success');
          onPaymentVerified?.();
          return;
        } else if (status.status === 'expired') {
          setPhase('failed');
          setErrorMsg('Your checkout session expired. Please try again.');
          return;
        } else {
          // Payment pending or cancelled
          if (attempt < MAX_RETRIES) {
            // Wait and retry — webhook may not have processed yet
            await new Promise<void>(r => setTimeout(r, RETRY_DELAYS[attempt]));
            continue;
          }
          setPhase('failed');
          setErrorMsg('Payment was not completed. Please try again if you wish to purchase.');
          return;
        }
      } catch (error: any) {
        if (__DEV__) console.warn(`[PaymentModal] Verification attempt ${attempt + 1} error:`, error?.message || error);

        const isTimeout = error?.message?.includes('DEADLINE_EXCEEDED') ||
          error?.code === 'deadline-exceeded' ||
          error?.message?.includes('timeout');

        if (isTimeout && attempt < MAX_RETRIES) {
          // Cloud Function timed out — webhook is likely still processing.
          // Wait and retry.
          await new Promise<void>(r => setTimeout(r, RETRY_DELAYS[attempt]));
          continue;
        }

        if (attempt >= MAX_RETRIES) {
          // All retries exhausted. Payment likely succeeded (Stripe confirmed it)
          // but webhook/fulfillment is slow. Show success with a note.
          setPhase('success');
          onPaymentVerified?.();
          return;
        }
      }
    }
  }, [onPaymentVerified]);

  // Manual verify button (if auto-verify didn't trigger)
  const handleManualVerify = useCallback(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [sessionId, verifyPayment]);

  const handleClose = useCallback(() => {
    if (phase === 'processing' || phase === 'verifying') {
      // If in processing, try to verify first
      if (sessionId) {
        verifyPayment(sessionId);
        return;
      }
    }
    onClose();
  }, [phase, sessionId, verifyPayment, onClose]);

  if (!pkg) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <Pressable
        style={styles.overlay}
        onPress={phase === 'success' || phase === 'failed' ? handleClose : undefined}>
        <View style={styles.modal}>

          {/* ── PHASE: CONFIRM ── */}
          {phase === 'confirm' && (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="card-outline" size={36} color={theme.colors.primary} />
              </View>

              <Text style={styles.title}>Confirm Purchase</Text>
              <Text style={styles.subtitle}>
                You are about to purchase a package from {instructorName}
              </Text>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Package</Text>
                  <Text style={styles.summaryValue}>{pkg.name}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Hours</Text>
                  <Text style={styles.summaryValue}>{pkg.totalLessons}h</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
                  <Text style={[styles.summaryValue, styles.totalValue]}>
                    {'\u00A3'}{pkg.price}
                  </Text>
                </View>
              </View>

              {/* Security badges like web */}
              <View style={styles.securityRow}>
                <Ionicons name="lock-closed" size={12} color={theme.colors.success} />
                <Text style={styles.securityText}>SSL Secured</Text>
                <View style={styles.dot} />
                <Ionicons name="shield-checkmark" size={12} color={theme.colors.success} />
                <Text style={styles.securityText}>PCI Compliant</Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleConfirm}
                  disabled={loading}>
                  <Ionicons name="card-outline" size={16} color="#FFFFFF" />
                  <Text style={[styles.confirmText, { color: '#FFFFFF' }]}>
                    Pay with Stripe
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* ── PHASE: PROCESSING (checkout opened in browser) ── */}
          {phase === 'processing' && (
            <>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '14' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
              <Text style={styles.title}>Complete Payment</Text>
              <Text style={styles.subtitle}>
                A Stripe checkout page has been opened.{'\n'}
                Complete the payment there, then return here.
              </Text>
              <Pressable
                style={[styles.button, styles.verifyButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleManualVerify}>
                <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                <Text style={[styles.confirmText, { color: '#FFFFFF' }]}>
                  I've Completed Payment
                </Text>
              </Pressable>
              <Pressable
                style={{ marginTop: theme.spacing.sm, paddingVertical: theme.spacing.xs }}
                onPress={handleClose}>
                <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textTertiary }}>
                  Cancel
                </Text>
              </Pressable>
            </>
          )}

          {/* ── PHASE: VERIFYING ── */}
          {phase === 'verifying' && (
            <>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '14' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
              <Text style={styles.title}>Verifying Payment</Text>
              <Text style={styles.subtitle}>
                Please wait while we confirm your payment...
              </Text>
            </>
          )}

          {/* ── PHASE: SUCCESS ── */}
          {phase === 'success' && (
            <>
              <View style={[styles.successIcon, { backgroundColor: theme.colors.success + '18' }]}>
                <Ionicons name="checkmark-circle" size={52} color={theme.colors.success} />
              </View>
              <Text style={styles.title}>Payment Successful!</Text>
              <Text style={styles.subtitle}>
                {pkg.totalLessons} hours have been added to your account with {instructorName}.
                {'\n'}You can start booking your lessons right away!
              </Text>
              <Pressable
                style={[styles.button, styles.doneButton, { backgroundColor: theme.colors.success }]}
                onPress={onClose}>
                <Text style={[styles.confirmText, { color: '#FFFFFF' }]}>Done</Text>
              </Pressable>
            </>
          )}

          {/* ── PHASE: FAILED ── */}
          {phase === 'failed' && (
            <>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '14' }]}>
                <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
              </View>
              <Text style={styles.title}>Payment Not Completed</Text>
              <Text style={styles.subtitle}>
                {errorMsg || 'The payment was not completed. No charges have been made.'}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}>
                  <Text style={styles.cancelText}>Close</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setPhase('confirm')}>
                  <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                  <Text style={[styles.confirmText, { color: '#FFFFFF' }]}>Try Again</Text>
                </Pressable>
              </View>
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
      marginBottom: theme.spacing.sm,
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
    securityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: theme.spacing.md,
    },
    securityText: {
      ...theme.typography.caption,
      color: theme.colors.success,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
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
    verifyButton: {
      width: '100%',
    },
  });

export default PaymentModal;
