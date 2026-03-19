/**
 * GDS Driving School — PendingApprovalScreen
 * ============================================
 * Shown to students whose account is pending admin approval or rejected.
 * Allows the user to sign out and try again later.
 */

import React, { useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import { signOut } from '../../services/authService';
import type { RootState } from '../../store';

const PendingApprovalScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [signingOut, setSigningOut] = useState(false);
  const profile = useSelector((state: RootState) => state.auth.profile);

  const isRejected = profile?.status === 'rejected';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme.colors.statusBar} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isRejected ? 'close-circle-outline' : 'time-outline'}
            size={72}
            color={isRejected ? theme.colors.error : theme.colors.warning}
          />
        </View>

        <Text style={styles.title}>
          {isRejected ? 'Account Rejected' : 'Pending Approval'}
        </Text>

        <Text style={styles.message}>
          {isRejected
            ? 'Your account registration has been rejected by the admin. Please contact support for more information.'
            : 'Your account is currently under review. An admin will approve your registration shortly. Please check back later.'}
        </Text>

        <Button
          title={signingOut ? 'Signing out...' : 'Sign Out'}
          onPress={handleSignOut}
          loading={signingOut}
          disabled={signingOut}
          variant="outline"
          size="lg"
          fullWidth
          style={styles.signOutBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    iconContainer: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    message: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.spacing.xl,
    },
    signOutBtn: {
      marginTop: theme.spacing.md,
    },
  });

export default PendingApprovalScreen;
