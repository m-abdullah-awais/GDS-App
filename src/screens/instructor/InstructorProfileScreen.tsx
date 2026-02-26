/**
 * GDS Driving School — InstructorProfileScreen
 * ===============================================
 *
 * Instructor account hub featuring:
 *   - Avatar hero with name & role badge
 *   - Overview stats (students, lessons, earnings)
 *   - Personal info rows (name, email, phone, experience, transmission, areas)
 *   - Appearance toggle (light / dark / system)
 *   - Notification preference toggles
 *   - App info rows (version, terms, privacy)
 *   - Sign out button
 */

import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
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

const APP_VERSION = '1.0.0 (build 42)';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ─── Small reusable components ────────────────────────────────────────────────

const SectionHeader = ({ title, theme }: { title: string; theme: AppTheme }) => (
  <Text
    style={{
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
    }}>
    {title}
  </Text>
);

const InfoRow = ({
  label,
  value,
  last = false,
  theme,
}: {
  label: string;
  value: string;
  last?: boolean;
  theme: AppTheme;
}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.surface,
      },
      !last && {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
      },
    ]}>
    <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.textSecondary, flex: 1 }}>
      {label}
    </Text>
    <Text
      style={{
        ...theme.typography.bodyMedium,
        color: theme.colors.textPrimary,
        fontWeight: '500',
        flex: 1.4,
        textAlign: 'right',
      }}>
      {value}
    </Text>
  </View>
);

const ActionRow = ({
  label,
  onPress,
  destructive = false,
  last = false,
  theme,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  last?: boolean;
  theme: AppTheme;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: pressed ? theme.colors.pressed : theme.colors.surface,
      },
      !last && {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
      },
    ]}>
    <Text
      style={{
        ...theme.typography.bodyMedium,
        color: destructive ? theme.colors.error : theme.colors.textPrimary,
        fontWeight: destructive ? '600' : '400',
      }}>
      {label}
    </Text>
    {!destructive && (
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
    )}
  </Pressable>
);

const ToggleRow = ({
  label,
  value,
  onToggle,
  last = false,
  theme,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  last?: boolean;
  theme: AppTheme;
}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.surface,
      },
      !last && {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
      },
    ]}>
    <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.textPrimary }}>
      {label}
    </Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
      thumbColor={value ? theme.colors.primary : theme.colors.textTertiary}
    />
  </View>
);

const Card = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: AppTheme;
}) => (
  <View
    style={{
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginHorizontal: theme.spacing.md,
      ...theme.shadows.sm,
    }}>
    {children}
  </View>
);

// ─── Appearance options ───────────────────────────────────────────────────────

const APPEARANCE_OPTIONS: { label: string; value: ColorSchemePreference }[] = [
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
  { label: 'Dark', value: 'dark' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const InstructorProfileScreen = () => {
  const { theme, colorScheme, setColorScheme } = useTheme();
  const s = createStyles(theme);

  // Notification toggles
  const [notifLessons, setNotifLessons] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);
  const [notifEarnings, setNotifEarnings] = useState(false);

  const handleSignOut = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {} },
    ]);

  const initials = getInitials(instructorProfile.fullName);
  const totalStudents = instructorStudents.length;

  return (
    <ScreenContainer showHeader title="Profile">
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero Section ───────────────────────────────────────── */}
        <View style={s.heroSection}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarInitials}>{initials}</Text>
            </View>
          </View>
          <Text style={s.heroName}>{instructorProfile.fullName}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleBadgeText}>Instructor</Text>
          </View>
          <Text style={s.heroSub}>
            {instructorProfile.experience} years experience
          </Text>
        </View>

        {/* ── Overview Stats ─────────────────────────────────────── */}
        <SectionHeader title="Overview" theme={theme} />
        <Card theme={theme}>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{totalStudents}</Text>
              <Text style={s.statLabel}>Students</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{earningsSummary.totalLessons}</Text>
              <Text style={s.statLabel}>Lessons</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>
                £{earningsSummary.totalEarnings.toLocaleString()}
              </Text>
              <Text style={s.statLabel}>Earned</Text>
            </View>
          </View>
        </Card>

        {/* ── Personal Info ──────────────────────────────────────── */}
        <SectionHeader title="Personal Information" theme={theme} />
        <Card theme={theme}>
          <InfoRow label="Full Name" value={instructorProfile.fullName} theme={theme} />
          <InfoRow label="Email" value={instructorProfile.email} theme={theme} />
          <InfoRow label="Phone" value={instructorProfile.phone} theme={theme} />
          <InfoRow
            label="Experience"
            value={`${instructorProfile.experience} years`}
            theme={theme}
          />
          <InfoRow
            label="Transmission"
            value={instructorProfile.transmissionType}
            theme={theme}
          />
          <InfoRow
            label="Areas"
            value={instructorProfile.areas.join(', ')}
            last
            theme={theme}
          />
        </Card>

        {/* ── Appearance ─────────────────────────────────────────── */}
        <SectionHeader title="Appearance" theme={theme} />
        <Card theme={theme}>
          <View style={s.appearanceRow}>
            <Text style={s.appearanceLabel}>Theme</Text>
            <View style={s.segmented}>
              {APPEARANCE_OPTIONS.map(opt => {
                const active = colorScheme === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[s.segmentBtn, active && s.segmentBtnActive]}
                    onPress={() => setColorScheme(opt.value)}>
                    <Text style={[s.segmentText, active && s.segmentTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        {/* ── Notifications ──────────────────────────────────────── */}
        <SectionHeader title="Notifications" theme={theme} />
        <Card theme={theme}>
          <ToggleRow
            label="Lesson Reminders"
            value={notifLessons}
            onToggle={setNotifLessons}
            theme={theme}
          />
          <ToggleRow
            label="Messages"
            value={notifMessages}
            onToggle={setNotifMessages}
            theme={theme}
          />
          <ToggleRow
            label="Student Requests"
            value={notifRequests}
            onToggle={setNotifRequests}
            theme={theme}
          />
          <ToggleRow
            label="Earnings & Payouts"
            value={notifEarnings}
            onToggle={setNotifEarnings}
            last
            theme={theme}
          />
        </Card>

        {/* ── App Info ───────────────────────────────────────────── */}
        <SectionHeader title="About" theme={theme} />
        <Card theme={theme}>
          <InfoRow label="App Version" value={APP_VERSION} theme={theme} />
          <ActionRow label="Terms & Conditions" onPress={() => {}} theme={theme} />
          <ActionRow label="Privacy Policy" onPress={() => {}} theme={theme} />
          <ActionRow label="Help & Support" onPress={() => {}} last theme={theme} />
        </Card>

        {/* ── Sign Out ───────────────────────────────────────────── */}
        <SectionHeader title="Account" theme={theme} />
        <Card theme={theme}>
          <ActionRow
            label="Sign Out"
            onPress={handleSignOut}
            destructive
            last
            theme={theme}
          />
        </Card>

        <View style={{ height: theme.spacing['2xl'] }} />
      </ScrollView>
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xs,
    },

    // Hero
    heroSection: {
      alignItems: 'center',
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      marginBottom: theme.spacing.xs,
    },
    avatarRing: {
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 3,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      ...theme.typography.h2,
      color: theme.colors.textInverse,
    },
    heroName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    roleBadge: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
      marginBottom: theme.spacing.xs,
    },
    roleBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    heroSub: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },

    // Stats row
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      ...theme.typography.h4,
      color: theme.colors.primary,
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

    // Appearance segmented control
    appearanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    appearanceLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: 3,
    },
    segmentBtn: {
      paddingVertical: 5,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    segmentBtnActive: {
      backgroundColor: theme.colors.primary,
    },
    segmentText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    segmentTextActive: {
      color: theme.colors.textInverse,
      fontWeight: '600',
    },
  });

export default InstructorProfileScreen;