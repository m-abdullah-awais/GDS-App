import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'AD';

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldRow = ({
  icon,
  label,
  value,
  editing,
  onChangeText,
  keyboardType,
  autoCapitalize,
  theme,
}: {
  icon: string;
  label: string;
  value: string;
  editing: boolean;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  theme: AppTheme;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={fieldStyles(theme).wrapper}>
      <View style={fieldStyles(theme).iconCol}>
        <Ionicons name={icon} size={16} color={theme.colors.primary} />
      </View>
      <View style={fieldStyles(theme).content}>
        <Text style={fieldStyles(theme).label}>{label}</Text>
        {editing ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType={keyboardType ?? 'default'}
            autoCapitalize={autoCapitalize ?? 'sentences'}
            style={[
              fieldStyles(theme).input,
              focused && fieldStyles(theme).inputFocused,
            ]}
            placeholderTextColor={theme.colors.textSecondary}
          />
        ) : (
          <Text style={fieldStyles(theme).value} numberOfLines={1}>{value}</Text>
        )}
      </View>
    </View>
  );
};

const fieldStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    iconCol: {
      width: 28,
      marginTop: 2,
    },
    content: { flex: 1 },
    label: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    value: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    input: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceSecondary,
    },
    inputFocused: {
      borderColor: theme.colors.borderFocused,
      backgroundColor: theme.colors.surface,
    },
  });

// ─── Screen ───────────────────────────────────────────────────────────────────

const INITIAL_PROFILE: ProfileData = {
  name: 'Platform Admin',
  role: 'System Administrator',
  email: 'admin@gdsplatform.com',
  phone: '+44 7000 000000',
  location: 'London, UK',
};

const AdminProfileScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);

  const field = (key: keyof ProfileData) => ({
    value: draft[key],
    onChangeText: (v: string) => setDraft(d => ({ ...d, [key]: v })),
  });

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
      name: draft.name.trim(),
      role: draft.role.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      location: draft.location.trim(),
    };

    if (!trimmed.name) {
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

  return (
    <ScreenContainer title="Profile">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Hero ──────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(editing ? draft.name : profile.name)}</Text>
            </View>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={1}>
              {editing ? draft.name : profile.name}
            </Text>
            <Text style={styles.heroRole} numberOfLines={1}>
              {editing ? draft.role : profile.role}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Admin</Text>
            </View>
          </View>
        </View>

        {/* ── Edit / Save / Cancel buttons ──────────────────── */}
        {!editing ? (
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
            onPress={handleEdit}>
            <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        ) : (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
              onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
              onPress={handleSave}>
              <Ionicons name="checkmark-outline" size={16} color={theme.colors.textInverse} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </Pressable>
          </View>
        )}

        {/* ── Contact / Info ────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <FieldRow
            icon="person-outline"
            label="Full Name"
            editing={editing}
            theme={theme}
            {...field('name')}
          />
          <FieldRow
            icon="briefcase-outline"
            label="Role / Title"
            editing={editing}
            theme={theme}
            {...field('role')}
          />
          <FieldRow
            icon="mail-outline"
            label="Email"
            editing={editing}
            keyboardType="email-address"
            autoCapitalize="none"
            theme={theme}
            {...field('email')}
          />
          <FieldRow
            icon="call-outline"
            label="Phone"
            editing={editing}
            keyboardType="phone-pad"
            autoCapitalize="none"
            theme={theme}
            {...field('phone')}
          />
          <FieldRow
            icon="location-outline"
            label="Location"
            editing={editing}
            theme={theme}
            {...field('location')}
          />
        </View>

        {/* ── Access ────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Access</Text>
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: theme.colors.successLight }]}>
              <Text style={[styles.pillText, { color: theme.colors.success }]}>Full Permissions</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: theme.colors.infoLight }]}>
              <Text style={[styles.pillText, { color: theme.colors.info }]}>Live Session</Text>
            </View>
          </View>
        </View>

        <View style={{ height: theme.spacing['4xl'] }} />
      </ScrollView>
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    content: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },

    // Hero
    heroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    avatarRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.h2,
      color: theme.colors.textInverse,
      fontWeight: '700',
    },
    heroInfo: { flex: 1 },
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
      marginTop: theme.spacing.xs,
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
    },
    roleBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Edit button
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primaryLight,
    },
    editBtnPressed: {
      opacity: 0.7,
    },
    editBtnText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Save / Cancel row
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    cancelBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    cancelBtnText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    saveBtn: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
    },
    saveBtnText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textInverse,
      fontWeight: '700',
    },

    // Cards
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },

    // Access pills
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    pill: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
    },
    pillText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
  });

export default AdminProfileScreen;
