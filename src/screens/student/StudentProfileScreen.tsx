/**
 * GDS Driving School — StudentProfileScreen
 * ===========================================
 *
 * Student account hub with:
 *   - Tappable avatar (profile picture placeholder with camera icon)
 *   - Editable profile fields (name, email, phone, licence number, transmission)
 *   - Active package summary with progress bar
 *   - Appearance toggle (light / dark / system)
 *   - Notification preference toggles
 *   - Sign out
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme, type ColorSchemePreference } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import * as userService from '../../services/userService';
import * as authService from '../../services/authService';
import { useToast } from '../../components/admin';
import { ProfileImageOptionsModal, useConfirmation } from '../../components/common';
import { useProfileImage } from '../../hooks';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  transmissionPreference: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'ST';

// ─── Constants ──────────────────────────────────────────────────────────────

const INITIAL_PROFILE: ProfileData = {
  name: '',
  email: '',
  phone: '',
  postcode: '',
  transmissionPreference: 'Manual',
};

const APPEARANCE_OPTIONS: { label: string; value: ColorSchemePreference }[] = [
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
  { label: 'Dark', value: 'dark' },
];

const PROFILE_FIELDS: {
  key: keyof ProfileData;
  label: string;
  icon: string;
  keyboard?: 'default' | 'email-address' | 'phone-pad';
  capitalize?: 'none' | 'words' | 'sentences';
}[] = [
  { key: 'name', label: 'Full Name', icon: 'person-outline', capitalize: 'words' },
  { key: 'email', label: 'Email Address', icon: 'mail-outline', keyboard: 'email-address', capitalize: 'none' },
  { key: 'phone', label: 'Phone Number', icon: 'call-outline', keyboard: 'phone-pad' },
  { key: 'postcode', label: 'Post Code', icon: 'location-outline', capitalize: 'none' },
  { key: 'transmissionPreference', label: 'Transmission Preference', icon: 'car-outline' },
];

// ─── Component ──────────────────────────────────────────────────────────────

const StudentProfileScreen = () => {
  const { theme, colorScheme, setColorScheme } = useTheme();
  const { showToast } = useToast();
  const { confirm, notify } = useConfirmation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const authProfile = useSelector((state: RootState) => state.auth.profile);
  const myInstructors = useSelector((state: RootState) => state.student.myInstructors);
  const purchasedPackages = useSelector((state: RootState) => state.student.purchasedPackages);
  const lessons = useSelector((state: RootState) => state.student.lessons);

  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);
  const { profileImage, imageOptionsVisible, setImageOptionsVisible, uploading, openPicker, takePhoto, chooseFromGallery, removePhoto } = useProfileImage(authProfile?.uid, (authProfile as any)?.photoURL || authProfile?.profile_picture_url || null);

  // Load profile from auth state
  useEffect(() => {
    if (authProfile) {
      const loaded: ProfileData = {
        name: authProfile.full_name || '',
        email: authProfile.email || '',
        phone: authProfile.phone || '',
        postcode: authProfile.postcode || '',
        transmissionPreference: authProfile.transmissionType || 'Manual',
      };
      setProfile(loaded);
      setDraft(loaded);

    }
  }, [authProfile]);

  const activePackage = useMemo(
    () => purchasedPackages.find((pkg) => pkg.status === 'active') ?? purchasedPackages[0] ?? null,
    [purchasedPackages],
  );

  const activeInstructor = useMemo(
    () => myInstructors.find((instructor) => instructor.id === activePackage?.instructorId),
    [myInstructors, activePackage],
  );

  const totalHours = activePackage?.totalLessons ?? 0;
  const hoursUsed = Math.min(activePackage?.lessonsUsed ?? 0, totalHours);
  const remainingHours = Math.max(totalHours - hoursUsed, 0);
  const completedLessons = (lessons || []).filter((lesson) => lesson.status === 'completed').length;
  const progressPercent = totalHours > 0 ? Math.round((hoursUsed / totalHours) * 100) : 0;
  const activeInstructorName = activeInstructor?.name ?? 'No instructor assigned';
  const activeInstructorAvatar = activeInstructor?.avatar ?? getInitials(activeInstructorName);

  const handleEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  const handleSave = async () => {
    const trimmed: ProfileData = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      postcode: draft.postcode.trim(),
      transmissionPreference: draft.transmissionPreference.trim(),
    };
    if (!trimmed.name) {
      void notify({
        title: 'Validation',
        message: 'Name cannot be empty.',
        variant: 'warning',
      });
      return;
    }
    if (!trimmed.email || !trimmed.email.includes('@')) {
      void notify({
        title: 'Validation',
        message: 'Please enter a valid email address.',
        variant: 'warning',
      });
      return;
    }
    try {
      if (authProfile?.uid) {
        await userService.updateUserProfile(authProfile.uid, {
          full_name: trimmed.name,
          email: trimmed.email,
          phone: trimmed.phone,
          postcode: trimmed.postcode,
          transmissionType: trimmed.transmissionPreference as any,
        });
      }
      setProfile(trimmed);
      setDraft(trimmed);
      setEditing(false);
      showToast('success', 'Your profile has been updated.');
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast('error', 'Failed to save profile. Please try again.');
    }
  };


  const handleSignOut = async () => {
    const shouldSignOut = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmLabel: 'Sign Out',
      cancelLabel: 'Cancel',
      variant: 'destructive',
      icon: 'log-out-outline',
    });

    if (shouldSignOut) {
      try {
        await authService.signOut();
      } catch {}
      showToast('info', 'Signed out successfully.');
    }
  };

  const displayName = editing ? draft.name : profile.name;

  // Format member since date
  const memberSince = (authProfile as any)?.createdAt
    ? new Date((authProfile as any).createdAt).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <ScreenContainer title="Profile">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ──────────────────────────────── */}
        <View style={styles.hero}>
          <Pressable onPress={openPicker} style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarCircle} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                </View>
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </Pressable>
          <Text style={styles.heroName} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.heroSub} numberOfLines={1}>Member since {memberSince}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Student</Text>
          </View>
        </View>

        {/* ── Edit / Save / Cancel ──────────────── */}
        {!editing ? (
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        ) : (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </Pressable>
          </View>
        )}

        {/* ── Active Package Summary ────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Package</Text>
          <View style={styles.packageRow}>
            <View style={styles.packageLeft}>
              <View style={styles.packageInstructorRow}>
                <View style={styles.packageInstructorAvatar}>
                  <Text style={styles.packageInstructorInitials}>
                    {activeInstructorAvatar}
                  </Text>
                </View>
                <View>
                  <Text style={styles.packageInstructorName}>
                    {activeInstructorName}
                  </Text>
                  <Text style={styles.packageInstructorLabel}>Your instructor</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { value: `${hoursUsed}`, label: 'Hrs Done' },
              { value: `${remainingHours}`, label: 'Hrs Left' },
              { value: `${totalHours}`, label: 'Total' },
              { value: `${completedLessons}`, label: 'Lessons' },
            ].map((stat, idx) => (
              <React.Fragment key={stat.label}>
                {idx > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{progressPercent}% complete</Text>
          </View>
        </View>

        {/* ── Profile Fields ────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          {PROFILE_FIELDS.map((f, idx) => (
            <View
              key={f.key}
              style={[
                styles.fieldRow,
                idx < PROFILE_FIELDS.length - 1 && styles.fieldBorder,
              ]}
            >
              <View style={styles.fieldIcon}>
                <Ionicons name={f.icon as any} size={16} color={theme.colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                {editing ? (
                  <TextInput
                    value={draft[f.key]}
                    onChangeText={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                    keyboardType={f.keyboard ?? 'default'}
                    autoCapitalize={f.capitalize ?? 'sentences'}
                    style={styles.fieldInput}
                    placeholderTextColor={theme.colors.placeholder}
                  />
                ) : (
                  <Text style={styles.fieldValue} numberOfLines={1}>
                    {profile[f.key]}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Appearance ────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appearance</Text>
          <View style={styles.themeRow}>
            <Text style={styles.themeLabel}>Theme</Text>
            <View style={styles.segmented}>
              {APPEARANCE_OPTIONS.map((opt) => {
                const active = colorScheme === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.segBtn, active && styles.segBtnActive]}
                    onPress={() => setColorScheme(opt.value)}
                  >
                    <Text style={[styles.segText, active && styles.segTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Sign Out ──────────────────────────── */}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.7 }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
      <ProfileImageOptionsModal
        visible={imageOptionsVisible}
        onClose={() => setImageOptionsVisible(false)}
        onTakePhoto={takePhoto}
        onChooseFromGallery={chooseFromGallery}
        onRemovePhoto={profileImage ? removePhoto : undefined}
      />
    </ScreenContainer>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    content: { padding: 16, gap: 14 },

    // Hero
    hero: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: 24,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    avatarWrap: { position: 'relative', marginBottom: 12 },
    avatarRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.h1,
      color: '#FFF',
      fontWeight: '700',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    heroName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    heroSub: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    roleBadge: {
      marginTop: 8,
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    roleBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '700',
    },

    // Edit / Action row
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      backgroundColor: theme.colors.primaryLight,
    },
    editBtnText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.primary,
    },
    actionRow: { flexDirection: 'row', gap: 10 },
    cancelBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
    },
    cancelBtnText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textSecondary,
    },
    saveBtn: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      backgroundColor: theme.colors.primary,
    },
    saveBtnText: {
      ...theme.typography.buttonMedium,
      color: '#FFF',
    },

    // Card
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    cardTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: 12,
    },

    // Package
    packageRow: {
      marginBottom: 8,
    },
    packageLeft: {},
    packageInstructorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    packageInstructorAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    packageInstructorInitials: {
      ...theme.typography.caption,
      color: '#FFF',
      fontWeight: '700',
    },
    packageInstructorName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    packageInstructorLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: {
      ...theme.typography.h4,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 36,
      backgroundColor: theme.colors.border,
    },

    // Progress bar
    progressWrap: { paddingTop: 4 },
    progressBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primaryLight,
      overflow: 'hidden',
      marginBottom: 4,
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    progressLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },

    // Field rows
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
    },
    fieldBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    fieldIcon: { width: 28, marginTop: 2 },
    fieldContent: { flex: 1 },
    fieldLabel: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginBottom: 2,
    },
    fieldValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    fieldInput: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: theme.colors.surfaceSecondary,
    },

    // Theme
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    themeLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: 3,
    },
    segBtn: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: theme.borderRadius.sm,
    },
    segBtnActive: {
      backgroundColor: theme.colors.primary,
    },
    segText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    segTextActive: {
      color: '#FFF',
      fontWeight: '700',
    },

    // Sign Out
    signOutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.errorLight,
    },
    signOutText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.error,
      fontWeight: '700',
    },
  });

export default StudentProfileScreen;
