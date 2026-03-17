import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

interface ProfileImageOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onChooseFromGallery: () => void;
  onRemovePhoto?: () => void;
}

const ProfileImageOptionsModal: React.FC<ProfileImageOptionsModalProps> = ({
  visible,
  onClose,
  onChooseFromGallery,
  onRemovePhoto,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBg} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="images-outline" size={26} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Profile Picture</Text>
          <Text style={styles.message}>Choose an option</Text>

          <View style={styles.optionList}>
            <Pressable style={styles.optionBtn} onPress={onChooseFromGallery}>
              <Ionicons name="images-outline" size={16} color={theme.colors.textPrimary} />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </Pressable>

            {onRemovePhoto && (
              <Pressable style={styles.optionBtn} onPress={onRemovePhoto}>
                <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                <Text style={[styles.optionText, { color: theme.colors.error }]}>Remove Photo</Text>
              </Pressable>
            )}
          </View>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
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
      ...theme.shadows.xl,
      alignItems: 'center',
    },
    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    message: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    optionList: {
      width: '100%',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    optionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    optionText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textPrimary,
    },
    cancelBtn: {
      width: '100%',
      height: 44,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textSecondary,
    },
  });

export default ProfileImageOptionsModal;