/**
 * GDS Driving School — ConfirmModal Component
 * ==============================================
 * Confirmation dialog with customizable variant and loading state.
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

type ConfirmVariant = 'primary' | 'destructive' | 'success';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  icon?: string;
  children?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
  icon,
  children,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getVariantColor = (): string => {
    switch (variant) {
      case 'destructive': return theme.colors.error;
      case 'success': return theme.colors.success;
      default: return theme.colors.primary;
    }
  };

  const getVariantIcon = (): string => {
    if (icon) return icon;
    switch (variant) {
      case 'destructive': return 'alert-circle-outline';
      case 'success': return 'checkmark-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const accentColor = getVariantColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBg} onPress={onCancel} />
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: accentColor + '18' }]}>
            <Ionicons name={getVariantIcon()} size={28} color={accentColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {children}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: accentColor }]}
              onPress={onConfirm}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.textInverse} />
              ) : (
                <Text style={[styles.confirmText, { color: theme.colors.textInverse }]}>
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    overlayBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      alignItems: 'center',
      ...theme.shadows.xl,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    message: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      width: '100%',
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
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
    confirmText: {
      ...theme.typography.buttonMedium,
    },
  });

export default ConfirmModal;
