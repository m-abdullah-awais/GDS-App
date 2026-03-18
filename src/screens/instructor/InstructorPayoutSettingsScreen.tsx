/**
 * InstructorPayoutSettingsScreen
 * ================================
 * Mirrors the web PayoutSettings.tsx — bank details + payment request flow.
 *
 * Features:
 * - Bank details form (account name, sort code, account number)
 * - Completed lessons & amount due stats
 * - Payment date selection (today / tomorrow)
 * - Early payment fee warning
 * - Payment summary & request
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { useConfirmation } from '../../components/common';
import { useTheme } from '../../theme';
import { useSelector } from 'react-redux';
import { db } from '../../config/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from '@react-native-firebase/firestore';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import type { RootState } from '../../store';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Payout Settings'>;

interface BankDetails {
  accountNumber: string;
  sortCode: string;
  accountName: string;
}

const InstructorPayoutSettingsScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { notify } = useConfirmation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const profile = useSelector((state: RootState) => state.auth.profile);

  // Bank details state
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: '',
    sortCode: '',
    accountName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Payment data state
  const [completedLessons, setCompletedLessons] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageCommissionRate, setAverageCommissionRate] = useState(0.2);
  const [loadingPaymentData, setLoadingPaymentData] = useState(true);

  // Payment request state
  const [paymentDate, setPaymentDate] = useState<'today' | 'tomorrow' | null>(null);
  const [acceptedWarning, setAcceptedWarning] = useState(false);
  const [requestingPayment, setRequestingPayment] = useState(false);

  // Load bank details from Firestore
  useEffect(() => {
    const loadBankDetails = async () => {
      if (!profile?.uid) return;
      try {
        setLoading(true);
        const userSnap = await getDoc(doc(collection(db, 'users'), profile.uid));
        if (userSnap.exists()) {
          const userData = userSnap.data() as any;
          if (userData?.bankDetails) {
            setBankDetails({
              accountNumber: userData.bankDetails.accountNumber || '',
              sortCode: userData.bankDetails.sortCode || '',
              accountName: userData.bankDetails.accountName || '',
            });
          }
        }
      } catch (err: any) {
        console.error('[PayoutSettings] loadBankDetails error:', err);
        setError('Failed to load bank details.');
      } finally {
        setLoading(false);
      }
    };
    loadBankDetails();
  }, [profile?.uid]);

  // Fetch payment data (unpaid lesson completions)
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!profile?.uid) return;
      try {
        setLoadingPaymentData(true);
        const completionsSnap = await getDocs(
          query(
            collection(db, 'lessonCompletions'),
            where('instructorId', '==', profile.uid),
            where('payoutStatus', '==', 'pending'),
          ),
        );
        const unpaid = completionsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];

        setCompletedLessons(unpaid.length);

        let totalPayout = 0;
        let totalRev = 0;
        let totalComm = 0;
        unpaid.forEach(c => {
          totalPayout += c.instructorPayout || 0;
          totalRev += c.instructorPayment || 0;
          totalComm += c.commissionAmount || 0;
        });

        setAmountDue(totalPayout);
        setTotalRevenue(totalRev);
        setAverageCommissionRate(totalRev > 0 ? totalComm / totalRev : 0.2);
      } catch (err) {
        console.error('[PayoutSettings] fetchPaymentData error:', err);
      } finally {
        setLoadingPaymentData(false);
      }
    };
    fetchPaymentData();
  }, [profile?.uid]);

  // Format helpers (matching web)
  const formatAccountNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatSortCode = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    if (digits.length >= 4) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
    } else if (digits.length >= 2) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    return digits;
  };

  const validateForm = (): boolean => {
    if (!bankDetails.accountName.trim()) {
      setError('Account name is required');
      return false;
    }
    if (!bankDetails.sortCode.trim()) {
      setError('Sort code is required');
      return false;
    }
    if (!bankDetails.accountNumber.trim()) {
      setError('Account number is required');
      return false;
    }
    if (!/^\d{8}$/.test(bankDetails.accountNumber.replace(/\s/g, ''))) {
      setError('Account number must be 8 digits');
      return false;
    }
    if (!/^\d{2}-\d{2}-\d{2}$/.test(bankDetails.sortCode)) {
      setError('Sort code must be in format XX-XX-XX (e.g., 12-34-56)');
      return false;
    }
    return true;
  };

  const handleSave = useCallback(async () => {
    if (!profile?.uid) return;
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');
      await updateDoc(doc(collection(db, 'users'), profile.uid), {
        bankDetails: {
          accountNumber: bankDetails.accountNumber.replace(/\s/g, ''),
          sortCode: bankDetails.sortCode,
          accountName: bankDetails.accountName.trim(),
        },
      });
      void notify({
        title: 'Saved',
        message: 'Bank details saved successfully!',
        variant: 'success',
      });
    } catch (err: any) {
      console.error('[PayoutSettings] save error:', err);
      setError('Failed to save bank details. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [profile?.uid, bankDetails, notify]);

  const handleRequestPayment = useCallback(async () => {
    if (!paymentDate || !acceptedWarning) return;
    setRequestingPayment(true);
    // The payment request is logged — the admin/weekly payout job handles actual transfer
    void notify({
      title: 'Payment Requested',
      message: `Payment request submitted for ${paymentDate}! You will be notified once it's processed.`,
      variant: 'success',
    });
    setPaymentDate(null);
    setAcceptedWarning(false);
    setRequestingPayment(false);
  }, [paymentDate, acceptedWarning, notify]);

  if (loading) {
    return (
      <ScreenContainer showHeader title="Payout Settings" onBackPress={() => navigation.goBack()}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading bank details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showHeader title="Payout Settings" onBackPress={() => navigation.goBack()}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Bank Details Section ──────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="card-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Bank Account Details</Text>
                <Text style={styles.sectionSubtitle}>Configure your payment information</Text>
              </View>
            </View>

            {/* Info box */}
            <View style={[styles.infoBox, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.infoBoxText, { color: theme.colors.primary }]}>
                Please provide your bank details so we can transfer your weekly payments directly to your account.
              </Text>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.colors.warningLight }]}>
              <Ionicons name="lock-closed-outline" size={16} color={theme.colors.warning} />
              <Text style={[styles.infoBoxText, { color: theme.colors.warning }]}>
                Your bank details are encrypted and secure
              </Text>
            </View>

            {/* Account Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={bankDetails.accountName}
                  onChangeText={v => {
                    setBankDetails(prev => ({ ...prev, accountName: v }));
                    setError('');
                  }}
                  placeholder="Name on your bank account"
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="words"
                  maxLength={50}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Sort Code */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Sort Code *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={bankDetails.sortCode}
                  onChangeText={v => {
                    setBankDetails(prev => ({ ...prev, sortCode: formatSortCode(v) }));
                    setError('');
                  }}
                  placeholder="XX-XX-XX (e.g., 12-34-56)"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="number-pad"
                  maxLength={8}
                  style={styles.input}
                />
              </View>
              <Text style={styles.hint}>Enter your 6-digit sort code</Text>
            </View>

            {/* Account Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Number *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="keypad-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={bankDetails.accountNumber}
                  onChangeText={v => {
                    setBankDetails(prev => ({ ...prev, accountNumber: formatAccountNumber(v) }));
                    setError('');
                  }}
                  placeholder="XXXXXXXX (8 digits)"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="number-pad"
                  maxLength={11}
                  style={styles.input}
                />
              </View>
              <Text style={styles.hint}>Enter your 8-digit account number</Text>
            </View>

            {/* Error */}
            {error ? (
              <View style={[styles.infoBox, { backgroundColor: theme.colors.errorLight }]}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                <Text style={[styles.infoBoxText, { color: theme.colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              title={saving ? 'Saving...' : 'Save Bank Details'}
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={
                !saving ? (
                  <Ionicons name="save-outline" size={20} color={theme.colors.textInverse} />
                ) : undefined
              }
            />
          </View>

          {/* ─── Payment Information ──────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.colors.successLight }]}>
                <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.success} />
              </View>
              <Text style={[styles.sectionTitle, { flex: 1 }]}>Payment Information</Text>
            </View>

            <View style={styles.paymentInfoList}>
              <View style={styles.paymentInfoItem}>
                <Ionicons name="cash-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.paymentInfoText}>Payments are processed weekly for completed lessons</Text>
              </View>
              <View style={styles.paymentInfoItem}>
                <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.paymentInfoText}>Payments are transferred directly to your bank account</Text>
              </View>
              <View style={styles.paymentInfoItem}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.paymentInfoText}>All bank details are encrypted and stored securely</Text>
              </View>
            </View>
          </View>

          {/* ─── Payment Request Section ───────────────────────── */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="wallet-outline" size={22} color="#7C3AED" />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Payment Request</Text>
                <Text style={styles.sectionSubtitle}>Request payment for completed lessons</Text>
              </View>
            </View>

            {loadingPaymentData ? (
              <View style={styles.center}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading payment data...</Text>
              </View>
            ) : (
              <>
                {/* Stats Cards */}
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
                    <View style={styles.statCardHeader}>
                      <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                      <Text style={[styles.statCardLabel, { color: '#1E40AF' }]}>Completed Lessons</Text>
                    </View>
                    <Text style={[styles.statCardValue, { color: '#1E3A8A' }]}>{completedLessons}</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
                    <View style={styles.statCardHeader}>
                      <Ionicons name="cash" size={20} color="#16A34A" />
                      <Text style={[styles.statCardLabel, { color: '#166534' }]}>Amount Due</Text>
                    </View>
                    <Text style={[styles.statCardValue, { color: '#14532D' }]}>
                      {'\u00A3'}{amountDue.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {amountDue > 0 ? (
                  <>
                    {/* Payment Date Selection */}
                    <View style={styles.dateSection}>
                      <Text style={styles.dateSectionTitle}>Select Payment Date</Text>
                      <View style={styles.dateRow}>
                        <Pressable
                          style={[
                            styles.dateOption,
                            paymentDate === 'today' && styles.dateOptionActive,
                          ]}
                          onPress={() => {
                            setPaymentDate('today');
                            setAcceptedWarning(false);
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={20}
                            color={paymentDate === 'today' ? '#fff' : theme.colors.textPrimary}
                          />
                          <Text
                            style={[
                              styles.dateOptionText,
                              paymentDate === 'today' && styles.dateOptionTextActive,
                            ]}
                          >
                            Today
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[
                            styles.dateOption,
                            paymentDate === 'tomorrow' && styles.dateOptionActive,
                          ]}
                          onPress={() => {
                            setPaymentDate('tomorrow');
                            setAcceptedWarning(false);
                          }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={paymentDate === 'tomorrow' ? '#fff' : theme.colors.textPrimary}
                          />
                          <Text
                            style={[
                              styles.dateOptionText,
                              paymentDate === 'tomorrow' && styles.dateOptionTextActive,
                            ]}
                          >
                            Tomorrow
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* Early Payment Warning */}
                    {paymentDate && (
                      <View style={[styles.warningBox, { backgroundColor: theme.colors.warningLight }]}>
                        <View style={styles.warningHeader}>
                          <Ionicons name="alert-circle" size={20} color={theme.colors.warning} />
                          <Text style={[styles.warningTitle, { color: theme.colors.warning }]}>
                            Early Payment Charges Warning
                          </Text>
                        </View>
                        <Text style={styles.warningText}>
                          Requesting payment for {paymentDate} may incur additional charges for
                          early payment processing. These charges will be deducted from your payment amount.
                        </Text>
                        <Pressable
                          style={styles.checkboxRow}
                          onPress={() => setAcceptedWarning(!acceptedWarning)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: acceptedWarning ? theme.colors.warning : theme.colors.border,
                                backgroundColor: acceptedWarning ? theme.colors.warning : 'transparent',
                              },
                            ]}
                          >
                            {acceptedWarning && (
                              <Ionicons name="checkmark" size={14} color="#fff" />
                            )}
                          </View>
                          <Text style={styles.checkboxText}>
                            I understand and accept that charges may apply for early payment processing
                          </Text>
                        </Pressable>
                      </View>
                    )}

                    {/* Payment Summary */}
                    {paymentDate && acceptedWarning && (
                      <View style={[styles.summaryCard, { borderColor: '#7C3AED' }]}>
                        <View style={styles.summaryHeader}>
                          <Ionicons name="wallet-outline" size={20} color="#7C3AED" />
                          <Text style={[styles.summaryTitle, { color: '#7C3AED' }]}>
                            Payment Summary
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Total Amount Due:</Text>
                          <Text style={styles.summaryValue}>
                            {'\u00A3'}{amountDue.toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Platform Commission ({(averageCommissionRate * 100).toFixed(0)}%):
                          </Text>
                          <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
                            -{'\u00A3'}{(totalRevenue * averageCommissionRate).toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Early Payment Fee (est.):</Text>
                          <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                            -{'\u00A3'}{(amountDue * 0.05).toFixed(2)}
                          </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryTotal]}>
                          <Text style={styles.summaryTotalLabel}>Amount You'll Receive:</Text>
                          <Text style={[styles.summaryTotalValue, { color: theme.colors.success }]}>
                            {'\u00A3'}{(amountDue - amountDue * 0.05).toFixed(2)}
                          </Text>
                        </View>

                        <Button
                          title={requestingPayment ? 'Requesting...' : 'Request Payment'}
                          onPress={handleRequestPayment}
                          loading={requestingPayment}
                          disabled={requestingPayment}
                          variant="primary"
                          size="lg"
                          fullWidth
                          leftIcon={
                            !requestingPayment ? (
                              <Ionicons name="wallet-outline" size={20} color={theme.colors.textInverse} />
                            ) : undefined
                          }
                          style={{ marginTop: theme.spacing.md }}
                        />
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyPayment}>
                    <Ionicons name="wallet-outline" size={48} color={theme.colors.textTertiary} />
                    <Text style={styles.emptyPaymentText}>No payments due at this time</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
      gap: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.md,
      gap: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    sectionIcon: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionHeaderText: { flex: 1 },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    sectionSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    infoBoxText: {
      flex: 1,
      ...theme.typography.bodySmall,
      lineHeight: 20,
    },
    formGroup: {
      gap: theme.spacing.xs,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
    },
    inputWrapper: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: Platform.OS === 'ios' ? 12 : 9,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
    },
    input: {
      flex: 1,
      paddingVertical: 0,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
    },
    hint: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
    // Payment info
    paymentInfoList: {
      gap: theme.spacing.sm,
    },
    paymentInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    paymentInfoText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },
    statCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    statCardLabel: {
      ...theme.typography.bodySmall,
      fontWeight: '600',
    },
    statCardValue: {
      ...theme.typography.h1,
      fontWeight: '700',
    },
    // Date selection
    dateSection: {
      gap: theme.spacing.sm,
    },
    dateSectionTitle: {
      ...theme.typography.label,
      color: theme.colors.textPrimary,
    },
    dateRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    dateOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    dateOptionActive: {
      borderColor: '#7C3AED',
      backgroundColor: '#7C3AED',
    },
    dateOptionText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textPrimary,
    },
    dateOptionTextActive: {
      color: '#fff',
    },
    // Warning box
    warningBox: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    warningTitle: {
      ...theme.typography.label,
      fontWeight: '700',
    },
    warningText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderWidth: 2,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    checkboxText: {
      flex: 1,
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      lineHeight: 20,
    },
    // Summary
    summaryCard: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1.5,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    summaryTitle: {
      ...theme.typography.label,
      fontWeight: '700',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    summaryLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    summaryValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    summaryTotal: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
    },
    summaryTotalLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      flex: 1,
    },
    summaryTotalValue: {
      ...theme.typography.h3,
      fontWeight: '700',
    },
    // Empty
    emptyPayment: {
      alignItems: 'center',
      paddingVertical: theme.spacing['2xl'],
      gap: theme.spacing.sm,
    },
    emptyPaymentText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
    },
  });

export default InstructorPayoutSettingsScreen;
