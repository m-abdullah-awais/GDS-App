/**
 * GDS Driving School — InstructorProfileScreen
 * ===============================================
 *
 * Instructor account hub with:
 *   - Tappable avatar (profile picture placeholder with camera icon)
 *   - Editable profile fields (name, email, phone, experience, transmission, areas)
 *   - Badges section (insurance badge & driving licence status)
 *   - Overview stats (students, lessons, earnings)
 *   - Appearance toggle (light / dark / system)
 *   - Notification preference toggles
 *   - Sign out
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme, type ColorSchemePreference } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import {
  instructorProfile,
  instructorStudents,
  earningsSummary,
} from '../../modules/instructor/mockData';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  transmissionType: string;
  areas: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'IN';

const toProfileData = (): ProfileData => ({
  fullName: instructorProfile.fullName,
  email: instructorProfile.email,
  phone: instructorProfile.phone,
  experience: `${instructorProfile.experience}`,
  transmissionType: instructorProfile.transmissionType,
  areas: instructorProfile.areas.join(', '),
});

// ─── Constants ──────────────────────────────────────────────────────────────

const APPEARANCE_OPTIONS: { label: string; value: ColorSchemePreference }[] = [
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
  { label: 'Dark', value: 'dark' },
];

const PROFILE_FIELDS: {
  key: keyof ProfileData;
  label: string;
  icon: string;
  keyboard?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  capitalize?: 'none' | 'words' | 'sentences';
}[] = [
  { key: 'fullName', label: 'Full Name', icon: 'person-outline', capitalize: 'words' },
  { key: 'email', label: 'Email Address', icon: 'mail-outline', keyboard: 'email-address', capitalize: 'none' },
  { key: 'phone', label: 'Phone Number', icon: 'call-outline', keyboard: 'phone-pad' },
  { key: 'experience', label: 'Experience (years)', icon: 'time-outline', keyboard: 'numeric' },
  { key: 'transmissionType', label: 'Transmission', icon: 'car-outline' },
  { key: 'areas', label: 'Teaching Areas', icon: 'map-outline' },
];

// ─── Component ──────────────────────────────────────────────────────────────

const InstructorProfileScreen = () => {
  const { theme, colorScheme, setColorScheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const initial = toProfileData();
  const [profile, setProfile] = useState<ProfileData>(initial);
  const [draft, setDraft] = useState<ProfileData>(initial);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Notification toggles
  const [notifLessons, setNotifLessons] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);
  const [notifEarnings, setNotifEarnings] = useState(false);

  const handleEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  const handleSave = () => {
    const trimmed: ProfileData = {
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      experience: draft.experience.trim(),
      transmissionType: draft.transmissionType.trim(),
      areas: draft.areas.trim(),
    };
    if (!trimmed.fullName) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    if (!trimmed.email || !trimmed.email.includes('@')) {
      Alert.alert('Validation', 'Please enter a valid email address.');
      return;
    }
    setProfile(trimmed);
    setDraft(trimmed);
    setEditing(false);
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const handlePickImage = () => {
    Alert.alert('Profile Picture', 'Choose an option', [
      { text: 'Take Photo', onPress: () => setProfileImage('camera_photo') },
      { text: 'Choose from Gallery', onPress: () => setProfileImage('gallery_photo') },
      ...(profileImage
        ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => setProfileImage(null) }]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleSignOut = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {} },
    ]);

  const displayName = editing ? draft.fullName : profile.fullName;
  const totalStudents = instructorStudents.length;

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
          <Pressable onPress={handlePickImage} style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              {profileImage ? (
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={36} color={theme.colors.textInverse} />
                </View>
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
          <Text style={styles.heroSub} numberOfLines={1}>
            {profile.experience} years experience · {profile.transmissionType}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Instructor</Text>
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

        {/* ── Overview Stats ────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overview</Text>
          <View style={styles.statsRow}>
            {[
              { value: `${totalStudents}`, label: 'Students' },
              { value: `${earningsSummary.totalLessons}`, label: 'Lessons' },
              { value: `£${earningsSummary.totalEarnings.toLocaleString()}`, label: 'Earned' },
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
                    multiline={f.key === 'areas'}
                  />
                ) : (
                  <Text style={styles.fieldValue} numberOfLines={f.key === 'areas' ? 2 : 1}>
                    {f.key === 'experience'
                      ? `${profile[f.key]} years`
                      : profile[f.key]}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Badges & Credentials ──────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Badges & Credentials</Text>
          <View style={styles.badgeRow}>
            <View style={[
              styles.badgeCard,
              {
                backgroundColor: instructorProfile.insuranceBadge
                  ? theme.colors.successLight
                  : theme.colors.errorLight,
                borderColor: instructorProfile.insuranceBadge
                  ? theme.colors.success
                  : theme.colors.error,
              },
            ]}>
              <Ionicons
                name={instructorProfile.insuranceBadge ? 'shield-checkmark' : 'shield-outline'}
                size={28}
                color={
                  instructorProfile.insuranceBadge
                    ? theme.colors.success
                    : theme.colors.error
                }
              />
              <Text style={[
                styles.badgeTitle,
                {
                  color: instructorProfile.insuranceBadge
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}>
                Insurance
              </Text>
              <Text style={[
                styles.badgeStatus,
                {
                  color: instructorProfile.insuranceBadge
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}>
                {instructorProfile.insuranceBadge ? 'Verified' : 'Not Uploaded'}
              </Text>
            </View>

            <View style={[
              styles.badgeCard,
              {
                backgroundColor: instructorProfile.drivingLicense
                  ? theme.colors.successLight
                  : theme.colors.errorLight,
                borderColor: instructorProfile.drivingLicense
                  ? theme.colors.success
                  : theme.colors.error,
              },
            ]}>
              <Ionicons
                name={instructorProfile.drivingLicense ? 'card' : 'card-outline'}
                size={28}
                color={
                  instructorProfile.drivingLicense
                    ? theme.colors.success
                    : theme.colors.error
                }
              />
              <Text style={[
                styles.badgeTitle,
                {
                  color: instructorProfile.drivingLicense
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}>
                Driving Licence
              </Text>
              <Text style={[
                styles.badgeStatus,
                {
                  color: instructorProfile.drivingLicense
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}>
                {instructorProfile.drivingLicense ? 'Verified' : 'Not Uploaded'}
              </Text>
            </View>
          </View>

          {/* Approval status */}
          <View style={styles.approvalRow}>
            <Text style={styles.approvalLabel}>Approval Status</Text>
            <View style={[
              styles.approvalBadge,
              {
                backgroundColor:
                  instructorProfile.approvalStatus === 'approved'
                    ? theme.colors.successLight
                    : instructorProfile.approvalStatus === 'pending'
                      ? theme.colors.warningLight
                      : theme.colors.errorLight,
              },
            ]}>
              <Ionicons
                name={
                  instructorProfile.approvalStatus === 'approved'
                    ? 'checkmark-circle'
                    : instructorProfile.approvalStatus === 'pending'
                      ? 'time'
                      : 'close-circle'
                }
                size={14}
                color={
                  instructorProfile.approvalStatus === 'approved'
                    ? theme.colors.success
                    : instructorProfile.approvalStatus === 'pending'
                      ? theme.colors.warning
                      : theme.colors.error
                }
              />
              <Text style={[
                styles.approvalBadgeText,
                {
                  color:
                    instructorProfile.approvalStatus === 'approved'
                      ? theme.colors.success
                      : instructorProfile.approvalStatus === 'pending'
                        ? theme.colors.warning
                        : theme.colors.error,
                },
              ]}>
                {instructorProfile.approvalStatus.charAt(0).toUpperCase() +
                  instructorProfile.approvalStatus.slice(1)}
              </Text>
            </View>
          </View>
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

        {/* ── Notifications ─────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>
          {[
            { label: 'Lesson Reminders', val: notifLessons, set: setNotifLessons },
            { label: 'Messages', val: notifMessages, set: setNotifMessages },
            { label: 'Student Requests', val: notifRequests, set: setNotifRequests },
            { label: 'Earnings & Payouts', val: notifEarnings, set: setNotifEarnings },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Switch
                  value={item.val}
                  onValueChange={item.set}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={item.val ? theme.colors.primary : theme.colors.textTertiary}
                />
              </View>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
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

    // Badges
    badgeRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    badgeCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      gap: 6,
    },
    badgeTitle: {
      ...theme.typography.bodySmall,
      fontWeight: '700',
      textAlign: 'center',
    },
    badgeStatus: {
      ...theme.typography.caption,
      fontWeight: '500',
    },
    approvalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    approvalLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    approvalBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    approvalBadgeText: {
      ...theme.typography.caption,
      fontWeight: '700',
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

    // Toggles
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    toggleLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
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

export default InstructorProfileScreen;
