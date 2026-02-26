/**
 * InstructorCreatePackageScreen
 * ==============================
 * Form to create a new lesson package. Package goes to pending approval.
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';

type Props = NativeStackScreenProps<InstructorStackParamList, 'CreatePackage'>;

const COMMISSION_PERCENTAGE = 15;

const InstructorCreatePackageScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessonCount, setLessonCount] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      title.trim().length >= 2 &&
      description.trim().length >= 10 &&
      Number(lessonCount) > 0 &&
      Number(price) > 0
    );
  }, [title, description, lessonCount, price]);

  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert('Incomplete', 'Please fill in all fields correctly.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmation(true);
    }, 600);
  };

  const handleDismissConfirmation = () => {
    setShowConfirmation(false);
    navigation.goBack();
  };

  return (
    <ScreenContainer showHeader title="Create Package" onBackPress={() => navigation.goBack()}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Package Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Starter Pack"
                placeholderTextColor={theme.colors.placeholder}
                style={styles.input}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what this package includes..."
                placeholderTextColor={theme.colors.placeholder}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Lesson Count */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Number of Lessons</Text>
              <TextInput
                value={lessonCount}
                onChangeText={setLessonCount}
                placeholder="e.g. 10"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {/* Price */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price (£)</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 290"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {/* Commission */}
            <View style={styles.commissionCard}>
              <Text style={styles.commissionLabel}>Platform Commission</Text>
              <Text style={styles.commissionValue}>{COMMISSION_PERCENTAGE}%</Text>
              <Text style={styles.commissionNote}>
                This percentage is deducted from each transaction.
              </Text>
            </View>

            <Button
              title={isSubmitting ? 'Creating...' : 'Create Package'}
              onPress={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
              size="lg"
              fullWidth
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleDismissConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
            </View>
            <Text style={styles.modalTitle}>Package Created!</Text>
            <Text style={styles.modalSubtitle}>
              Your package is now pending admin approval. It will be visible to
              students once approved.
            </Text>
            <View style={styles.modalBadge}>
              <Text style={styles.modalBadgeText}>Pending Approval</Text>
            </View>
            <Button
              title="Done"
              onPress={handleDismissConfirmation}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    contentContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.md,
    },
    formGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: Platform.OS === 'ios' ? 13 : 11,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
    },
    textArea: {
      minHeight: 100,
      paddingTop: theme.spacing.sm,
    },
    commissionCard: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    commissionLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
    },
    commissionValue: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      marginTop: theme.spacing.xxs,
    },
    commissionNote: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
    submitButton: {
      marginTop: theme.spacing.xs,
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      width: '100%',
      alignItems: 'center',
      ...theme.shadows.lg,
    },
    modalIconWrap: {
      width: 64,
      height: 64,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.successLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    modalIcon: {
      fontSize: 28,
      color: theme.colors.success,
    },
    modalTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    modalSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    modalBadge: {
      backgroundColor: theme.colors.warningLight,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      marginBottom: theme.spacing.xl,
    },
    modalBadgeText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.warning,
    },
    modalButton: {
      marginTop: theme.spacing.xs,
    },
  });

export default InstructorCreatePackageScreen;
