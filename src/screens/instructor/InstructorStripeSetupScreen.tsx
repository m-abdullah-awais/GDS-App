/**
 * InstructorStripeSetupScreen
 * ============================
 * Stripe Connect account management screen accessible from the instructor dashboard.
 * Mirrors the web StripeSetupPage.tsx — shows account status with actions.
 *
 * States: not_created | pending | restricted | complete
 */

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { useConfirmation } from '../../components/common';
import { useTheme } from '../../theme';
import {
  createConnectedAccount,
  getAccountStatus,
  refreshAccountLink,
  type AccountStatusResponse,
} from '../../services/stripeConnectService';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Stripe Setup'>;

const InstructorStripeSetupScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { notify } = useConfirmation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState<AccountStatusResponse | null>(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const browserOpenRef = useRef(false);

  const checkAccountStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getAccountStatus();
      setAccountStatus(result);
    } catch (err: any) {
      setError(err.message || 'Failed to check account status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAccountStatus();
  }, [checkAccountStatus]);

  // Auto-check status when user returns from Stripe browser
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active' && browserOpenRef.current) {
        browserOpenRef.current = false;
        try {
          await checkAccountStatus();
        } catch {
          // Non-critical
        }
      }
    });
    return () => subscription.remove();
  }, [checkAccountStatus]);

  const openStripeOnboarding = useCallback(
    async (url: string) => {
      try {
        browserOpenRef.current = true;
        const isAvailable = await InAppBrowser.isAvailable();
        if (isAvailable) {
          await InAppBrowser.open(url, {
            dismissButtonStyle: 'close',
            preferredBarTintColor: theme.colors.primary,
            preferredControlTintColor: theme.colors.textInverse,
            readerMode: false,
            animated: true,
            modalEnabled: true,
            enableBarCollapsing: false,
            showTitle: true,
            toolbarColor: theme.colors.surface,
            secondaryToolbarColor: theme.colors.surface,
          });
        } else {
          await Linking.openURL(url);
        }
        browserOpenRef.current = false;
        // After browser closes, wait for Stripe webhook then refresh status
        await new Promise<void>(resolve => setTimeout(resolve, 3000));
        await checkAccountStatus();
      } catch {
        browserOpenRef.current = false;
        // Non-critical — user may have cancelled
      }
    },
    [theme, checkAccountStatus],
  );

  const handleStartOnboarding = useCallback(async () => {
    try {
      setActionLoading(true);
      setError('');
      const result = await createConnectedAccount();
      if (result.success && result.onboardingUrl) {
        await openStripeOnboarding(result.onboardingUrl);
      } else {
        throw new Error('Failed to create onboarding link');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start onboarding');
    } finally {
      setActionLoading(false);
    }
  }, [openStripeOnboarding]);

  const handleRefreshLink = useCallback(async () => {
    try {
      setActionLoading(true);
      setError('');
      const result = await refreshAccountLink();
      if (result.success && result.onboardingUrl) {
        await openStripeOnboarding(result.onboardingUrl);
      } else {
        throw new Error('Failed to refresh onboarding link');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to refresh onboarding link');
    } finally {
      setActionLoading(false);
    }
  }, [openStripeOnboarding]);

  // ─── Loading State ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <ScreenContainer showHeader title="Stripe Setup" onBackPress={() => navigation.goBack()}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Checking your Stripe account status...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const status = accountStatus?.status || 'not_created';

  return (
    <ScreenContainer showHeader title="Stripe Setup" onBackPress={() => navigation.goBack()}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="card-outline" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Stripe Payout Setup</Text>
          <Text style={styles.headerSubtitle}>
            Configure your payment account to receive instructor earnings
          </Text>
        </View>

        {/* Error State */}
        {error ? (
          <View style={[styles.card, { borderColor: theme.colors.error }]}>
            <View style={styles.cardRow}>
              <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
              <View style={styles.cardRowContent}>
                <Text style={[styles.cardTitle, { color: theme.colors.error }]}>Error</Text>
                <Text style={[styles.cardDesc, { color: theme.colors.error }]}>{error}</Text>
              </View>
            </View>
            <Button
              title="Try Again"
              onPress={checkAccountStatus}
              variant="secondary"
              size="md"
              fullWidth
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
        ) : null}

        {/* Status: Complete */}
        {status === 'complete' && !error && (
          <View style={[styles.card, { borderColor: theme.colors.success }]}>
            <View style={styles.cardRow}>
              <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />
              <View style={styles.cardRowContent}>
                <Text style={[styles.cardTitle, { color: theme.colors.success }]}>
                  Stripe Account Verified
                </Text>
                <Text style={styles.cardDesc}>
                  Your account is fully set up and ready to receive payments.
                </Text>
              </View>
            </View>

            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.statusItemText}>Details Submitted</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.statusItemText}>Payouts Enabled</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.statusItemText}>Transfers Active</Text>
              </View>
              {accountStatus?.accountId && (
                <View style={styles.statusItem}>
                  <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
                  <Text style={styles.statusItemText}>
                    ID: ...{accountStatus.accountId.slice(-8)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Status: Pending */}
        {status === 'pending' && !error && (
          <View style={[styles.card, { borderColor: theme.colors.warning }]}>
            <View style={styles.cardRow}>
              <Ionicons name="time-outline" size={28} color={theme.colors.warning} />
              <View style={styles.cardRowContent}>
                <Text style={[styles.cardTitle, { color: theme.colors.warning }]}>
                  Verification Pending
                </Text>
                <Text style={styles.cardDesc}>
                  Your account setup is in progress. Some verification steps are still being reviewed.
                </Text>
              </View>
            </View>

            {/* Requirements */}
            {(accountStatus?.requirements?.currentlyDue?.length ?? 0) > 0 && (
              <View style={styles.requirementsSection}>
                <Text style={styles.requirementsTitle}>Required Information:</Text>
                {accountStatus!.requirements!.currentlyDue!.map((req, idx) => (
                  <View key={idx} style={styles.requirementItem}>
                    <Ionicons name="ellipse" size={6} color={theme.colors.warning} />
                    <Text style={styles.requirementText}>
                      {req.replace(/_/g, ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Button
              title={actionLoading ? 'Loading...' : 'Complete Verification'}
              onPress={handleRefreshLink}
              loading={actionLoading}
              disabled={actionLoading}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={
                !actionLoading ? (
                  <Ionicons name="open-outline" size={18} color={theme.colors.textInverse} />
                ) : undefined
              }
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
        )}

        {/* Status: Restricted */}
        {status === 'restricted' && !error && (
          <View style={[styles.card, { borderColor: theme.colors.error }]}>
            <View style={styles.cardRow}>
              <Ionicons name="alert-circle" size={28} color={theme.colors.error} />
              <View style={styles.cardRowContent}>
                <Text style={[styles.cardTitle, { color: theme.colors.error }]}>
                  Account Restricted
                </Text>
                <Text style={styles.cardDesc}>
                  Your Stripe account has restrictions. Please contact support or try completing
                  the onboarding process again.
                </Text>
              </View>
            </View>

            <Button
              title={actionLoading ? 'Loading...' : 'Continue Onboarding'}
              onPress={handleRefreshLink}
              loading={actionLoading}
              disabled={actionLoading}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
        )}

        {/* Status: Not Created */}
        {status === 'not_created' && !error && (
          <View style={[styles.card, { borderColor: theme.colors.primary }]}>
            <View style={styles.cardRow}>
              <Ionicons name="card-outline" size={28} color={theme.colors.primary} />
              <View style={styles.cardRowContent}>
                <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
                  Setup Your Payout Account
                </Text>
                <Text style={styles.cardDesc}>
                  Connect your Stripe account to receive automatic payouts for completed lessons.
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.featureText}>Secure and verified by Stripe</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.featureText}>Automatic weekly payouts</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.featureText}>No bank details stored on our servers</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.featureText}>Takes 5-10 minutes to complete</Text>
              </View>
            </View>

            <Button
              title={actionLoading ? 'Connecting...' : 'Connect with Stripe'}
              onPress={handleStartOnboarding}
              loading={actionLoading}
              disabled={actionLoading}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={
                !actionLoading ? (
                  <Ionicons name="open-outline" size={18} color={theme.colors.textInverse} />
                ) : undefined
              }
            />
          </View>
        )}

        {/* Security Footer */}
        <View style={styles.securityFooter}>
          <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.textTertiary} />
          <Text style={styles.securityText}>
            Secured by Stripe - Your financial data is encrypted and protected
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    center: {
      flex: 1,
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
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    headerIcon: {
      width: 72,
      height: 72,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1.5,
      ...theme.shadows.md,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    cardRowContent: {
      flex: 1,
    },
    cardTitle: {
      ...theme.typography.h3,
      marginBottom: theme.spacing.xs,
    },
    cardDesc: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    statusGrid: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    statusItemText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    requirementsSection: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.warningLight,
      borderRadius: theme.borderRadius.md,
    },
    requirementsTitle: {
      ...theme.typography.label,
      color: theme.colors.warning,
      marginBottom: theme.spacing.xs,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    requirementText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    featuresList: {
      marginVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    featureText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    securityFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.md,
    },
    securityText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
  });

export default InstructorStripeSetupScreen;
