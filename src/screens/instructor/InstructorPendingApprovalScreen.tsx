/**
 * InstructorPendingApprovalScreen
 * =================================
 * Shown after profile submission while awaiting admin approval.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';
import type { ApprovalStatus } from '../../modules/instructor/mockData';

type Props = NativeStackScreenProps<InstructorStackParamList, 'PendingApproval'>;

const InstructorPendingApprovalScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Mock toggle: pending → approved
      setStatus('approved');
    }, 1200);
  };

  const handleContinue = () => {
    navigation.replace('InstructorTabs');
  };

  const isPending = status === 'pending';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Status Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isPending
                  ? theme.colors.warningLight
                  : theme.colors.successLight,
              },
            ]}
          >
            <Ionicons
              name={isPending ? 'time-outline' : 'checkmark-circle'}
              size={44}
              color={isPending ? theme.colors.warning : theme.colors.success}
            />
          </View>

          {/* Message */}
          <Text style={styles.title}>
            {isPending ? 'Profile Under Review' : 'Profile Approved!'}
          </Text>
          <Text style={styles.subtitle}>
            {isPending
              ? 'Your profile is under review by Admin. This usually takes 24-48 hours.'
              : 'Congratulations! Your profile has been approved. You can now access your dashboard.'}
          </Text>

          {/* Status Badge */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isPending
                  ? theme.colors.warningLight
                  : theme.colors.successLight,
                borderColor: isPending
                  ? theme.colors.warning
                  : theme.colors.success,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isPending
                    ? theme.colors.warning
                    : theme.colors.success,
                },
              ]}
            >
              {isPending ? 'Pending' : 'Approved'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {isPending ? (
            <Button
              title={isRefreshing ? 'Checking...' : 'Refresh Status'}
              onPress={handleRefresh}
              loading={isRefreshing}
              variant="primary"
              size="lg"
              fullWidth
            />
          ) : (
            <Button
              title="Go to Dashboard"
              onPress={handleContinue}
              variant="primary"
              size="lg"
              fullWidth
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      padding: theme.spacing.xl,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    statusIcon: {
      fontSize: 44,
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
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    badge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    badgeText: {
      ...theme.typography.buttonMedium,
    },
    actions: {
      paddingBottom: theme.spacing.md,
    },
  });

export default InstructorPendingApprovalScreen;
