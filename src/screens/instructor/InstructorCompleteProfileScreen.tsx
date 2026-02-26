/**
 * InstructorCompleteProfileScreen
 * ================================
 * Post-signup profile completion form for instructors.
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';
import type { TransmissionType } from '../../modules/instructor/mockData';

type Props = NativeStackScreenProps<InstructorStackParamList, 'CompleteProfile'>;

const TRANSMISSION_OPTIONS: { label: string; value: TransmissionType }[] = [
  { label: 'Manual', value: 'Manual' },
  { label: 'Automatic', value: 'Automatic' },
  { label: 'Both', value: 'Both' },
];

const InstructorCompleteProfileScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [transmission, setTransmission] = useState<TransmissionType | null>(null);
  const [areasText, setAreasText] = useState('');
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [licenseSelected, setLicenseSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      phone.trim().length >= 6 &&
      experience.trim().length > 0 &&
      transmission !== null &&
      areasText.trim().length > 0
    );
  }, [fullName, phone, experience, transmission, areasText]);

  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert('Incomplete', 'Please fill all required fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.replace('PendingApproval');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Fill in your details to get started as an instructor
            </Text>
          </View>

          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.placeholder}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+44 7700 000000"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* Experience */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Experience (years)</Text>
              <TextInput
                value={experience}
                onChangeText={setExperience}
                placeholder="e.g. 5"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {/* Transmission Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Transmission Type</Text>
              <View style={styles.optionsRow}>
                {TRANSMISSION_OPTIONS.map((opt) => {
                  const isSelected = transmission === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.optionChip,
                        {
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                          backgroundColor: isSelected
                            ? theme.colors.primaryLight
                            : theme.colors.surface,
                        },
                      ]}
                      onPress={() => setTransmission(opt.value)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          {
                            color: isSelected
                              ? theme.colors.primary
                              : theme.colors.textPrimary,
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Areas */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Areas</Text>
              <TextInput
                value={areasText}
                onChangeText={setAreasText}
                placeholder="e.g. South West London, Central London"
                placeholderTextColor={theme.colors.placeholder}
                style={styles.input}
              />
            </View>

            {/* Upload: Insurance Badge */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Insurance Badge</Text>
              <Pressable
                style={[
                  styles.uploadCard,
                  insuranceSelected && {
                    borderColor: theme.colors.success,
                    backgroundColor: theme.colors.successLight,
                  },
                ]}
                onPress={() => setInsuranceSelected(!insuranceSelected)}
              >
                <Ionicons
                  name={insuranceSelected ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={28}
                  color={insuranceSelected ? theme.colors.success : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.uploadText,
                    insuranceSelected && { color: theme.colors.success },
                  ]}
                >
                  {insuranceSelected
                    ? 'insurance_badge.pdf selected'
                    : 'Tap to upload Insurance Badge'}
                </Text>
              </Pressable>
            </View>

            {/* Upload: Driving License */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Driving License</Text>
              <Pressable
                style={[
                  styles.uploadCard,
                  licenseSelected && {
                    borderColor: theme.colors.success,
                    backgroundColor: theme.colors.successLight,
                  },
                ]}
                onPress={() => setLicenseSelected(!licenseSelected)}
              >
                <Ionicons
                  name={licenseSelected ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={28}
                  color={licenseSelected ? theme.colors.success : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.uploadText,
                    licenseSelected && { color: theme.colors.success },
                  ]}
                >
                  {licenseSelected
                    ? 'driving_license.pdf selected'
                    : 'Tap to upload Driving License'}
                </Text>
              </Pressable>
            </View>

            <Button
              title={isSubmitting ? 'Submitting...' : 'Submit Profile'}
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
    contentContainer: {
      flexGrow: 1,
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
    },
    headerSection: {
      marginBottom: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xxs,
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
    optionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    optionChip: {
      flex: 1,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionChipText: {
      ...theme.typography.buttonMedium,
    },
    uploadCard: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
    },
    uploadIcon: {
      ...theme.typography.h1,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    uploadText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    submitButton: {
      marginTop: theme.spacing.xs,
    },
  });

export default InstructorCompleteProfileScreen;
