/**
 * InstructorCompleteProfileScreen
 * ================================
 * Post-signup profile completion form for instructors.
 * Matches the web InstructorSignupForm + InstructorOnboardingProfile flow.
 *
 * Collects: personal info, address, transmission, badge number, about me,
 * document uploads (badge, insurance, profile picture), and T&C agreement.
 *
 * On submit:
 * 1. Uploads documents to Firebase Storage
 * 2. Creates instructorApplications document
 * 3. Updates user profile with completeInstructorProfile
 * 4. Navigates to PendingApproval screen
 */

import React, { useMemo, useState } from 'react';
import {
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
import { useSelector } from 'react-redux';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import { useConfirmation } from '../../components/common';
import {
  completeInstructorProfile,
  createInstructorApplication,
} from '../../services/userService';
import { signOut } from '../../services/authService';
import type { AppTheme } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';
import type { TransmissionType } from '../../types';
import type { RootState } from '../../store';

type Props = NativeStackScreenProps<InstructorStackParamList, 'CompleteProfile'>;

const TRANSMISSION_OPTIONS: { label: string; value: TransmissionType }[] = [
  { label: 'Manual', value: 'Manual' },
  { label: 'Automatic', value: 'Automatic' },
  { label: 'Both', value: 'Both' },
];

const InstructorCompleteProfileScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { notify } = useConfirmation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const profile = useSelector((state: RootState) => state.auth.profile);

  // If profile is already complete, redirect to pending approval
  React.useEffect(() => {
    if (profile?.profileComplete || profile?.profile_completed) {
      if (profile?.approved && profile?.status === 'active') {
        navigation.replace('InstructorTabs');
      } else {
        navigation.replace('PendingApproval');
      }
    }
  }, [profile, navigation]);

  // Form state — pre-fill from profile where available
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [postcode, setPostcode] = useState(profile?.postcode || '');
  const [transmission, setTransmission] = useState<TransmissionType | null>(
    (profile?.car_transmission as TransmissionType) || null,
  );
  const [badgeNumber, setBadgeNumber] = useState(profile?.badge_number || '');
  const [aboutMe, setAboutMe] = useState(profile?.about_me || '');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Document uploads (store both Asset for display and base64 for upload)
  const [badgeImage, setBadgeImage] = useState<Asset | null>(null);
  const [insuranceImage, setInsuranceImage] = useState<Asset | null>(null);
  const [profilePicture, setProfilePicture] = useState<Asset | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      phone.trim().length >= 6 &&
      address.trim().length > 0 &&
      postcode.trim().length > 0 &&
      transmission !== null &&
      badgeNumber.trim().length > 0 &&
      aboutMe.trim().length > 0 &&
      badgeImage?.base64 != null &&
      insuranceImage?.base64 != null &&
      profilePicture?.base64 != null &&
      agreeToTerms
    );
  }, [
    fullName, phone, address, postcode, transmission, badgeNumber,
    aboutMe, badgeImage, insuranceImage, profilePicture, agreeToTerms,
  ]);

  const pickImage = async (
    setter: (asset: Asset | null) => void,
    title: string,
  ) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        maxWidth: 1280,
        maxHeight: 1280,
        selectionLimit: 1,
        includeBase64: true,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        void notify({
          title: 'Error',
          message: result.errorMessage || 'Failed to pick image.',
          variant: 'destructive',
        });
        return;
      }

      const asset = result.assets?.[0];
      if (asset) {
        // Validate file size (max 10MB)
        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          void notify({
            title: 'File Too Large',
            message: `${title} must be less than 10MB.`,
            variant: 'warning',
          });
          return;
        }
        setter(asset);
      }
    } catch (error) {
      console.warn(`[CompleteProfile] pickImage error for ${title}:`, error);
      void notify({
        title: 'Error',
        message: 'Could not open image picker. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      void notify({
        title: 'Incomplete Form',
        message: 'Please fill all required fields, upload all documents, and agree to Terms & Conditions.',
        variant: 'warning',
      });
      return;
    }

    if (!profile?.uid) {
      void notify({
        title: 'Error',
        message: 'User not authenticated. Please sign out and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const uid = profile.uid;

      // Convert base64 to data URL strings (matching web's FileReader.readAsDataURL output)
      const toDataUrl = (asset: Asset | null): string => {
        if (!asset?.base64) {return '';}
        const mime = asset.type || 'image/jpeg';
        return `data:${mime};base64,${asset.base64}`;
      };

      const badgeUrl = toDataUrl(badgeImage);
      const insuranceUrl = toDataUrl(insuranceImage);
      const profilePictureUrl = toDataUrl(profilePicture);

      // 1. Create instructor application document in Firestore (matches web exactly)
      const applicationId = await createInstructorApplication({
        instructor_id: uid,
        instructor_name: fullName.trim(),
        instructor_email: profile.email || '',
        phone: phone.trim(),
        address: address.trim(),
        postcode: postcode.trim().toUpperCase(),
        car_transmission: transmission!,
        badge_number: badgeNumber.trim(),
        about_me: aboutMe.trim(),
        badge_url: badgeUrl,
        insurance_url: insuranceUrl,
        profile_picture_url: profilePictureUrl,
      });

      // 2. Update user profile to mark profile as complete (matches web exactly)
      await completeInstructorProfile(uid, {
        full_name: fullName.trim(),
        email: profile.email || '',
        phone: phone.trim(),
        address: address.trim(),
        postcode: postcode.trim().toUpperCase(),
        car_transmission: transmission!,
        badge_number: badgeNumber.trim(),
        about_me: aboutMe.trim(),
        badge_url: badgeUrl,
        insurance_url: insuranceUrl,
        profile_picture_url: profilePictureUrl,
        profileImage: profilePictureUrl,
        application_submitted: true,
        application_id: applicationId,
      });

      void notify({
        title: 'Application Submitted',
        message: 'Your profile has been submitted for review. We will get back to you within 2-3 business days.',
        variant: 'success',
      });

      navigation.replace('PendingApproval');
    } catch (error: any) {
      console.error('[CompleteProfile] Submit error:', error);
      void notify({
        title: 'Submission Failed',
        message: error.message || 'Failed to submit your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocDisplayName = (asset: Asset | null, fallback: string) => {
    if (!asset) {return fallback;}
    const name = asset.fileName || 'Selected file';
    return name.length > 25 ? `${name.substring(0, 25)}...` : name;
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
          {/* Back / Sign Out Button */}
          <Pressable
            style={styles.backButton}
            onPress={() => signOut()}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.iconBadge}>
              <Ionicons name="school-outline" size={28} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Become a GDS Instructor</Text>
            <Text style={styles.subtitle}>
              Complete the form below to submit your instructor application
            </Text>
          </View>

          {/* ─── Personal Information ─────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Email (read-only) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons name="mail-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={profile?.email || ''}
                  editable={false}
                  style={[styles.input, { color: theme.colors.textSecondary }]}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+44 7700 000000"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Transmission Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Car Transmission Type *</Text>
              <View style={styles.optionsRow}>
                {TRANSMISSION_OPTIONS.map(opt => {
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
          </View>

          {/* ─── Address Information ──────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Address Information</Text>
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Home Address *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="home-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your full home address"
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Postcode */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Postcode *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="map-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={postcode}
                  onChangeText={text => setPostcode(text.toUpperCase())}
                  placeholder="e.g. NE1 4ST"
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          {/* ─── Required Documents ──────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Required Documents</Text>
            </View>

            {/* Badge Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Driving Instructor Badge Number *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="id-card-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={badgeNumber}
                  onChangeText={setBadgeNumber}
                  placeholder="Enter your badge number"
                  placeholderTextColor={theme.colors.placeholder}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Badge Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Driving Instructor Badge *</Text>
              <Pressable
                style={[
                  styles.uploadCard,
                  badgeImage && {
                    borderColor: theme.colors.success,
                    backgroundColor: theme.colors.successLight,
                  },
                ]}
                onPress={() => pickImage(setBadgeImage, 'Instructor Badge')}
              >
                <Ionicons
                  name={badgeImage ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={28}
                  color={badgeImage ? theme.colors.success : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.uploadText,
                    badgeImage && { color: theme.colors.success },
                  ]}
                >
                  {badgeImage
                    ? getDocDisplayName(badgeImage, 'Badge selected')
                    : 'Tap to upload Instructor Badge'}
                </Text>
                <Text style={styles.uploadHint}>PDF or Image (max 10MB)</Text>
              </Pressable>
            </View>

            {/* Insurance Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Insurance Document *</Text>
              <Pressable
                style={[
                  styles.uploadCard,
                  insuranceImage && {
                    borderColor: theme.colors.success,
                    backgroundColor: theme.colors.successLight,
                  },
                ]}
                onPress={() => pickImage(setInsuranceImage, 'Insurance Document')}
              >
                <Ionicons
                  name={insuranceImage ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={28}
                  color={insuranceImage ? theme.colors.success : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.uploadText,
                    insuranceImage && { color: theme.colors.success },
                  ]}
                >
                  {insuranceImage
                    ? getDocDisplayName(insuranceImage, 'Insurance selected')
                    : 'Tap to upload Insurance Document'}
                </Text>
                <Text style={styles.uploadHint}>PDF or Image (max 10MB)</Text>
              </Pressable>
            </View>
          </View>

          {/* ─── Profile Picture ──────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Profile Picture</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Profile Picture *</Text>
              <Pressable
                style={[
                  styles.uploadCard,
                  profilePicture && {
                    borderColor: theme.colors.success,
                    backgroundColor: theme.colors.successLight,
                  },
                ]}
                onPress={() => pickImage(setProfilePicture, 'Profile Picture')}
              >
                <Ionicons
                  name={profilePicture ? 'checkmark-circle' : 'camera-outline'}
                  size={32}
                  color={profilePicture ? theme.colors.success : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.uploadText,
                    profilePicture && { color: theme.colors.success },
                  ]}
                >
                  {profilePicture
                    ? getDocDisplayName(profilePicture, 'Photo selected')
                    : 'Tap to upload Profile Picture'}
                </Text>
                <Text style={styles.uploadHint}>JPG, PNG (max 10MB)</Text>
              </Pressable>
            </View>
          </View>

          {/* ─── About Me ─────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>About Me</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tell us about yourself *</Text>
              <TextInput
                value={aboutMe}
                onChangeText={setAboutMe}
                placeholder="Describe your teaching experience, qualifications, specialties, and what makes you a great driving instructor..."
                placeholderTextColor={theme.colors.placeholder}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[styles.inputStandalone, styles.textArea]}
              />
              <Text style={styles.hint}>
                This will be displayed on your public instructor profile.
              </Text>
            </View>
          </View>

          {/* ─── Terms & Conditions ───────────────────────────── */}
          <View style={styles.card}>
            <Pressable
              style={styles.termsRow}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: agreeToTerms
                      ? theme.colors.primary
                      : theme.colors.border,
                    backgroundColor: agreeToTerms
                      ? theme.colors.primary
                      : 'transparent',
                  },
                ]}
              >
                {agreeToTerms && (
                  <Ionicons name="checkmark" size={14} color={theme.colors.textInverse} />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the Terms & Conditions and Privacy Policy. I understand that
                my application will be reviewed and I will be contacted within 2-3 business days.
              </Text>
            </Pressable>
          </View>

          {/* ─── Submit Button ─────────────────────────────────── */}
          <Button
            title={isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
            size="lg"
            fullWidth
            style={styles.submitButton}
          />

          {/* ─── Info Cards ────────────────────────────────────── */}
          <View style={styles.infoSection}>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.warningLight }]}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.warning} />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: theme.colors.warning }]}>
                  Document Requirements
                </Text>
                <Text style={styles.infoCardText}>
                  Please ensure all uploaded documents are clear, legible, and valid.
                </Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: theme.colors.primary }]}>
                  Application Timeline
                </Text>
                <Text style={styles.infoCardText}>
                  Applications are typically reviewed within 2-3 business days.
                </Text>
              </View>
            </View>
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
      gap: theme.spacing.md,
    },
    backButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.xxs,
      alignSelf: 'flex-start' as const,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
    },
    backButtonText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    headerSection: {
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    iconBadge: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
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
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    formGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
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
    inputDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
      opacity: 0.7,
    },
    input: {
      flex: 1,
      paddingVertical: 0,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
    },
    inputStandalone: {
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
      minHeight: 120,
      textAlignVertical: 'top',
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
      gap: theme.spacing.xs,
    },
    uploadText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    uploadHint: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
    hint: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
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
    termsText: {
      flex: 1,
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    submitButton: {
      marginTop: theme.spacing.xs,
    },
    infoSection: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    infoCardContent: {
      flex: 1,
    },
    infoCardTitle: {
      ...theme.typography.label,
      marginBottom: theme.spacing.xxs,
    },
    infoCardText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
  });

export default InstructorCompleteProfileScreen;
