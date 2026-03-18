/**
 * InstructorPendingApprovalScreen
 * =================================
 * Handles the instructor onboarding status after profile submission.
 * Matches the web InstructorPending component's 5-case flow:
 *
 * Case 1: Rejected — application was not approved
 * Case 2: Profile incomplete — redirect to CompleteProfile
 * Case 3: Stripe setup required — show Stripe Connect onboarding
 * Case 4: Fully ready (Stripe + Admin approved) — auto-redirect to dashboard
 * Case 5: Waiting for admin approval — show pending status
 *
 * Uses a real-time Firestore listener to detect status changes.
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import { useConfirmation } from '../../components/common';
import { onUserProfile } from '../../services/userService';
import { signOut } from '../../services/authService';
import {
  createConnectedAccount,
  getAccountStatus,
} from '../../services/stripeConnectService';
import type { AppTheme } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';
import type { RootState } from '../../store';
import type { UserDoc } from '../../types';

type Props = NativeStackScreenProps<InstructorStackParamList, 'PendingApproval'>;

const InstructorPendingApprovalScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { notify } = useConfirmation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const authProfile = useSelector((state: RootState) => state.auth.profile);

  const [instructorData, setInstructorData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');

  // Real-time Firestore listener for instructor profile changes
  useEffect(() => {
    const uid = authProfile?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = onUserProfile(
      uid,
      (profile) => {
        setInstructorData(profile);
        setLoading(false);
      },
      (error) => {
        console.error('[PendingApproval] Profile listener error:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [authProfile?.uid]);

  // Auto-redirect when fully approved
  useEffect(() => {
    if (
      instructorData?.approved === true &&
      instructorData?.status === 'active' &&
      instructorData?.stripeAccountStatus === 'verified'
    ) {
      const timer = setTimeout(() => {
        navigation.replace('InstructorTabs');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [instructorData, navigation]);

  // Derived status flags
  const isProfileComplete =
    !!instructorData?.profileComplete || !!instructorData?.profile_completed;
  const isStripeVerified =
    instructorData?.stripeAccountStatus === 'verified' &&
    !!instructorData?.stripeAccountId;
  const isAdminApproved =
    instructorData?.approved === true && instructorData?.status === 'active';
  const isRejected = instructorData?.status === 'rejected';

  const handleStripeSetup = useCallback(async () => {
    try {
      setStripeLoading(true);
      setStripeError('');

      const result = await createConnectedAccount();

      if (result.success && result.onboardingUrl) {
        // Try InAppBrowser first, fall back to Linking
        const isAvailable = await InAppBrowser.isAvailable();
        if (isAvailable) {
          await InAppBrowser.open(result.onboardingUrl, {
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
          await Linking.openURL(result.onboardingUrl);
        }

        // After browser closes, check account status
        try {
          await getAccountStatus();
        } catch {
          // Non-critical — the real-time listener will pick up changes
        }
      } else {
        throw new Error('Failed to create Stripe onboarding link');
      }
    } catch (err: any) {
      console.error('[PendingApproval] Stripe setup error:', err);
      setStripeError(err.message || 'Failed to start Stripe setup. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  }, [theme]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn('[PendingApproval] Sign out error:', error);
    }
  }, []);

  const handleGoToCompleteProfile = useCallback(() => {
    navigation.replace('CompleteProfile');
  }, [navigation]);

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your application status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Case 1: Rejected ─────────────────────────────────────────────────────
  if (isRejected) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerContainer}>
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.errorLight }]}>
              <Ionicons name="alert-circle" size={44} color={theme.colors.error} />
            </View>
            <Text style={styles.title}>Application Not Approved</Text>
            <Text style={styles.subtitle}>
              Unfortunately, your instructor application was not approved at this time.
              Please check your email for more details or contact our support team.
            </Text>
          </View>
          <View style={styles.actions}>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="secondary"
              size="lg"
              fullWidth
              leftIcon={<Ionicons name="log-out-outline" size={20} color={theme.colors.textPrimary} />}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Case 2: Profile Incomplete ───────────────────────────────────────────
  if (!isProfileComplete) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerContainer}>
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.warningLight }]}>
              <Ionicons name="alert-circle-outline" size={44} color={theme.colors.warning} />
            </View>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Before proceeding, you must complete your profile details and upload required documents.
            </Text>
            <View style={[styles.infoBox, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.infoBoxText, { color: theme.colors.primary }]}>
                Required: Name, address, transmission, badge number, badge image, insurance, and profile picture.
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Button
              title="Complete Profile Now"
              onPress={handleGoToCompleteProfile}
              variant="primary"
              size="lg"
              fullWidth
            />
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="ghost"
              size="md"
              leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.primary} />}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Case 3: Stripe Setup Required ────────────────────────────────────────
  if (!isStripeVerified) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={44} color={theme.colors.success} />
            </View>
            <Text style={styles.title}>Complete Stripe Setup</Text>
            <Text style={styles.subtitle}>
              Your profile has been submitted successfully. Next step: complete Stripe Connect
              onboarding to enable payments.
            </Text>
          </View>

          {/* Stripe Setup Card */}
          <View style={[styles.stripeCard, { borderColor: theme.colors.primary }]}>
            <View style={styles.stripeCardHeader}>
              <View style={[styles.stripeIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.stripeCardHeaderText}>
                <Text style={styles.stripeCardTitle}>Setup Stripe Connect</Text>
                <Text style={styles.stripeCardDesc}>
                  We use Stripe Connect so you can be paid for lessons. You'll be redirected to
                  complete a quick verification.
                </Text>
              </View>
            </View>

            <View style={styles.stripeFeatures}>
              <View style={styles.stripeFeatureRow}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.stripeFeatureText}>Secure payment processing</Text>
              </View>
              <View style={styles.stripeFeatureRow}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.stripeFeatureText}>Direct bank transfers</Text>
              </View>
              <View style={styles.stripeFeatureRow}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={styles.stripeFeatureText}>Takes only 5-10 minutes</Text>
              </View>
            </View>

            {stripeError ? (
              <View style={[styles.infoBox, { backgroundColor: theme.colors.errorLight }]}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                <Text style={[styles.infoBoxText, { color: theme.colors.error }]}>
                  {stripeError}
                </Text>
              </View>
            ) : null}

            <Button
              title={stripeLoading ? 'Connecting to Stripe...' : 'Setup Payout Account'}
              onPress={handleStripeSetup}
              loading={stripeLoading}
              disabled={stripeLoading}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={
                !stripeLoading ? (
                  <Ionicons name="open-outline" size={18} color={theme.colors.textInverse} />
                ) : undefined
              }
            />
          </View>

          {/* Important Note */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.warningLight }]}>
            <Ionicons name="alert-circle-outline" size={18} color={theme.colors.warning} />
            <Text style={[styles.infoBoxText, { color: theme.colors.textSecondary }]}>
              <Text style={{ fontWeight: '700' }}>Important: </Text>
              Complete Stripe verification before admin review can proceed. You will be placed
              in admin review right after Stripe verification completes.
            </Text>
          </View>

          <View style={styles.signOutCenter}>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="ghost"
              size="md"
              leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.primary} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Case 4: Fully Ready (auto-redirect) ─────────────────────────────────
  if (isStripeVerified && isAdminApproved) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerContainer}>
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={44} color={theme.colors.success} />
            </View>
            <Text style={styles.title}>All Set!</Text>
            <Text style={styles.subtitle}>
              Your account is fully verified and ready to go!
            </Text>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={{ marginTop: theme.spacing.lg }}
            />
            <Text style={[styles.loadingText, { marginTop: theme.spacing.sm }]}>
              Redirecting to dashboard...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Case 5: Stripe Complete, Waiting for Admin Approval ──────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.warningLight }]}>
            <Ionicons name="time-outline" size={44} color={theme.colors.warning} />
          </View>
          <Text style={styles.title}>Waiting for Admin Approval</Text>
          <Text style={styles.subtitle}>
            Stripe onboarding is complete. Your application is now being reviewed by our admin team.
          </Text>
        </View>

        {/* Status Timeline Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardHeader}>
            <View style={[styles.statusBadgeIcon, { backgroundColor: theme.colors.warningLight }]}>
              <Ionicons name="time-outline" size={20} color={theme.colors.warning} />
            </View>
            <View style={styles.statusCardHeaderText}>
              <Text style={styles.statusCardTitle}>Application Status</Text>
              <Text style={styles.statusCardSubtitle}>Submitted for review</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: theme.colors.warningLight }]}>
              <Text style={[styles.statusBadgeText, { color: theme.colors.warning }]}>
                Pending
              </Text>
            </View>
          </View>

          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={[styles.timelineText, { color: theme.colors.success }]}>
                Profile submitted
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={[styles.timelineText, { color: theme.colors.success }]}>
                Stripe Connect completed
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <ActivityIndicator size={16} color={theme.colors.warning} />
              <Text style={[styles.timelineText, { color: theme.colors.warning }]}>
                Admin review in progress
              </Text>
            </View>
            <View style={[styles.timelineItem, { opacity: 0.4 }]}>
              <Ionicons name="ellipse-outline" size={20} color={theme.colors.textTertiary} />
              <Text style={styles.timelineText}>Account activation</Text>
            </View>
          </View>
        </View>

        {/* What to Expect */}
        <Text style={styles.sectionTitle}>What to Expect</Text>

        <View style={styles.expectCard}>
          <Ionicons name="mail-outline" size={22} color={theme.colors.primary} />
          <View style={styles.expectCardContent}>
            <Text style={styles.expectCardTitle}>Email Confirmation</Text>
            <Text style={styles.expectCardDesc}>
              You'll receive an email once your application is reviewed. This typically
              takes 2-3 business days.
            </Text>
          </View>
        </View>

        <View style={styles.expectCard}>
          <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.success} />
          <View style={styles.expectCardContent}>
            <Text style={styles.expectCardTitle}>Account Activation</Text>
            <Text style={styles.expectCardDesc}>
              Once approved, your instructor account will be activated with access to all
              features including timetable management and student connections.
            </Text>
          </View>
        </View>

        <View style={styles.expectCard}>
          <Ionicons name="alert-circle-outline" size={22} color={theme.colors.warning} />
          <View style={styles.expectCardContent}>
            <Text style={styles.expectCardTitle}>Additional Information</Text>
            <Text style={styles.expectCardDesc}>
              In some cases, we may need additional information about your documents.
              We'll contact you via email if needed.
            </Text>
          </View>
        </View>

        {/* Contact Support */}
        <View style={[styles.supportCard, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.colors.primary} />
          <View style={styles.supportCardContent}>
            <Text style={[styles.expectCardTitle, { color: theme.colors.primary }]}>
              Need Help?
            </Text>
            <Text style={styles.expectCardDesc}>
              If you have questions about your application or need to update your information,
              please contact our support team.
            </Text>
          </View>
        </View>

        <View style={styles.signOutCenter}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="ghost"
            size="md"
            leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.primary} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flex: { flex: 1 },
    centerContainer: {
      flex: 1,
      justifyContent: 'space-between',
      padding: theme.spacing.xl,
    },
    scrollContent: {
      flexGrow: 1,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing['3xl'],
      gap: theme.spacing.md,
    },
    content: {
      alignItems: 'center',
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: theme.spacing.sm,
    },
    loadingText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    actions: {
      gap: theme.spacing.sm,
      alignItems: 'center',
      paddingBottom: theme.spacing.md,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.md,
    },
    infoBoxText: {
      flex: 1,
      ...theme.typography.bodySmall,
      lineHeight: 20,
    },
    // Stripe card
    stripeCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1.5,
      gap: theme.spacing.lg,
      ...theme.shadows.md,
    },
    stripeCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    stripeIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stripeCardHeaderText: {
      flex: 1,
    },
    stripeCardTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xxs,
    },
    stripeCardDesc: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    stripeFeatures: {
      gap: theme.spacing.sm,
    },
    stripeFeatureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    stripeFeatureText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    // Status card
    statusCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    statusCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    statusBadgeIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusCardHeaderText: {
      flex: 1,
    },
    statusCardTitle: {
      ...theme.typography.label,
      color: theme.colors.textPrimary,
    },
    statusCardSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.full,
    },
    statusBadgeText: {
      ...theme.typography.buttonSmall,
    },
    timelineContainer: {
      gap: theme.spacing.md,
    },
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    timelineText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    // Section
    sectionTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
    },
    // Expect cards
    expectCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    expectCardContent: {
      flex: 1,
    },
    expectCardTitle: {
      ...theme.typography.label,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xxs,
    },
    expectCardDesc: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    // Support card
    supportCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    supportCardContent: {
      flex: 1,
    },
    signOutCenter: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
  });

export default InstructorPendingApprovalScreen;
