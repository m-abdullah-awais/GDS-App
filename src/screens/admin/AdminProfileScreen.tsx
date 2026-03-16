/**
 * GDS Driving School — AdminProfileScreen
 * ==========================================
 *
 * Admin account hub with:
 *   - Tappable avatar (profile picture placeholder with camera icon)
 *   - Editable profile fields (name, role, email, phone, location)
 *   - Access / permissions pills
 *   - Appearance toggle (light / dark / system)
 *   - Sign out
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme, type ColorSchemePreference } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import { useToast } from '../../components/admin';
import { ProfileImageOptionsModal, useConfirmation } from '../../components/common';
import * as authService from '../../services/authService';
import * as userService from '../../services/userService';
import { clearAuth } from '../../store/auth/authSlice';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'AD';

// ─── Constants ──────────────────────────────────────────────────────────────

const INITIAL_PROFILE: ProfileData = {
  name: '',
  role: 'System Administrator',
  email: '',
  phone: '',
  location: '',
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
  { key: 'role', label: 'Role / Title', icon: 'briefcase-outline' },
  { key: 'email', label: 'Email Address', icon: 'mail-outline', keyboard: 'email-address', capitalize: 'none' },
  { key: 'phone', label: 'Phone Number', icon: 'call-outline', keyboard: 'phone-pad' },
  { key: 'location', label: 'Location', icon: 'location-outline' },
];

// ─── Component ──────────────────────────────────────────────────────────────

const AdminProfileScreen = () => {
  const { theme, colorScheme, setColorScheme } = useTheme();
  const { showToast } = useToast();
  const { confirm, notify } = useConfirmation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const authProfile = useSelector((state: RootState) => state.auth.profile);

  // Defer heavy render until navigation animation completes
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => setReady(true));
    });
    return () => task.cancel();
  }, []);

  const profileFromAuth: ProfileData = useMemo(() => ({
    name: authProfile?.full_name || '',
    role: 'System Administrator',
    email: authProfile?.email || '',
    phone: authProfile?.phone || '',
    location: authProfile?.address || '',
  }), [authProfile]);

  const [profile, setProfile] = useState<ProfileData>(profileFromAuth);
  const [draft, setDraft] = useState<ProfileData>(profileFromAuth);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(authProfile?.profile_picture_url || authProfile?.profileImage || null);
  const [imageOptionsVisible, setImageOptionsVisible] = useState(false);
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifEmails, setNotifEmails] = useState(true);

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
      role: draft.role.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      location: draft.location.trim(),
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
          phone: trimmed.phone,
          address: trimmed.location,
        });
      }
      setProfile(trimmed);
      setDraft(trimmed);
      setEditing(false);
      showToast('success', 'Your profile has been updated.');
    } catch {
      showToast('error', 'Failed to update profile.');
    }
  };

  const handlePickImage = () => {
    setImageOptionsVisible(true);
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
        dispatch(clearAuth());
        showToast('info', 'Signed out successfully.');
      } catch {
        showToast('error', 'Sign out failed.');
      }
    }
  };

  const displayName = editing ? draft.name : profile.name;
  const displayRole = editing ? draft.role : profile.role;

  if (!ready) {
    return (
      <ScreenContainer title="Profile">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

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
          <Text style={styles.heroRole} numberOfLines={1}>{displayRole}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Admin</Text>
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

        {/* ── Profile Fields ────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Information</Text>
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

        {/* ── Access ────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Access & Permissions</Text>
          <View style={styles.pillRow}>
            {[
              { label: 'Full Permissions', color: theme.colors.success, bg: theme.colors.successLight },
              { label: 'Live Session', color: theme.colors.info, bg: theme.colors.infoLight },
              { label: 'User Management', color: theme.colors.warning, bg: theme.colors.warningLight },
            ].map((p) => (
              <View key={p.label} style={[styles.pill, { backgroundColor: p.bg }]}>
                <Text style={[styles.pillText, { color: p.color }]}>{p.label}</Text>
              </View>
            ))}
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
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>System Alerts</Text>
            <Switch
              value={notifSystem}
              onValueChange={setNotifSystem}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={notifSystem ? theme.colors.primary : theme.colors.textTertiary}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Email Notifications</Text>
            <Switch
              value={notifEmails}
              onValueChange={setNotifEmails}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={notifEmails ? theme.colors.primary : theme.colors.textTertiary}
            />
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
          onTakePhoto={() => {
            setProfileImage('camera_photo');
            setImageOptionsVisible(false);
          }}
          onChooseFromGallery={() => {
            setProfileImage('gallery_photo');
            setImageOptionsVisible(false);
          }}
          onRemovePhoto={profileImage
            ? () => {
                setProfileImage(null);
                setImageOptionsVisible(false);
              }
            : undefined}
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
    heroRole: {
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

    // Pills
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.full,
    },
    pillText: {
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

export default AdminProfileScreen;
