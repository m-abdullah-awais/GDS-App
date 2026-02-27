/**
 * GDS Driving School — StudentProfileScreen
 * ===========================================
 *
 * Student account hub featuring:
 *   - Avatar hero with name & role badge
 *   - Personal info rows (name, email, phone, joined)
 *   - Active package summary
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
import { useTheme, type ColorSchemePreference } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { studentProfile } from '../../modules/student/mockData';

// ─── Extended mock profile data ───────────────────────────────────────────────

const profileDetails = {
  email: 'alex.johnson@email.com',
  phone: '+44 7700 900 123',
  joinedDate: 'February 2026',
  licenceNumber: 'JOHN5702**AJ9AB',
  transmissionPreference: 'Manual',
};

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
        flex: 2,
        textAlign: 'right',
      }}
      numberOfLines={1}>
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
        paddingVertical: theme.spacing.sm + 2,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: pressed
          ? theme.colors.surfaceSecondary
          : theme.colors.surface,
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
      }}>
      {label}
    </Text>
    {!destructive && (
      <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.textSecondary }}>›</Text>
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
      trackColor={{
        false: theme.colors.border,
        true: theme.colors.primary,
      }}
      thumbColor={theme.colors.textInverse}
    />
  </View>
);

const Card = ({ children, theme }: { children: React.ReactNode; theme: AppTheme }) => (
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

// ─── Screen ───────────────────────────────────────────────────────────────────

const APPEARANCE_OPTIONS: { key: ColorSchemePreference; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'system', label: 'Auto' },
  { key: 'dark', label: 'Dark' },
];

const StudentProfileScreen = () => {
  const { theme, colorScheme, setColorScheme } = useTheme();
  const s = createStyles(theme);

  // Notification prefs (mock state)
  const [notifLessons, setNotifLessons] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifRequests, setNotifRequests] = useState(false);
  const [notifPromotions, setNotifPromotions] = useState(false);

  const hoursUsed = studentProfile.totalHours - studentProfile.remainingHours;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Avatar Hero ────────────────────────────────────────── */}
        <View style={s.heroSection}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarInitials}>
                {getInitials(studentProfile.name)}
              </Text>
            </View>
          </View>
          <Text style={s.heroName}>{studentProfile.name}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleBadgeText}>Student</Text>
          </View>
          <Text style={s.heroSub}>Member since {profileDetails.joinedDate}</Text>
        </View>

        {/* ── Package Summary ────────────────────────────────────── */}
        <SectionHeader title="Active Package" theme={theme} />
        <Card theme={theme}>
          <View style={s.packageCard}>
            <View style={s.packageLeft}>
              <Text style={s.packageInstructor}>{studentProfile.activeInstructor}</Text>
              <Text style={s.packageLabel}>Your instructor</Text>
            </View>
            <View style={s.packageDivider} />
            <View style={s.packageStat}>
              <Text style={s.packageStatValue}>{hoursUsed}</Text>
              <Text style={s.packageStatLabel}>hrs done</Text>
            </View>
            <View style={s.packageStat}>
              <Text style={s.packageStatValue}>{studentProfile.remainingHours}</Text>
              <Text style={s.packageStatLabel}>hrs left</Text>
            </View>
            <View style={s.packageStat}>
              <Text style={s.packageStatValue}>{studentProfile.totalHours}</Text>
              <Text style={s.packageStatLabel}>total</Text>
            </View>
          </View>
          {/* Hours bar */}
          <View style={s.packageBarWrap}>
            <View style={s.packageBarBg}>
              <View
                style={[
                  s.packageBarFill,
                  { width: `${(hoursUsed / studentProfile.totalHours) * 100}%` },
                ]}
              />
            </View>
            <Text style={s.packageBarLabel}>
              {Math.round((hoursUsed / studentProfile.totalHours) * 100)}% complete
            </Text>
          </View>
        </Card>

        {/* ── Personal Info ──────────────────────────────────────── */}
        <SectionHeader title="Personal Information" theme={theme} />
        <Card theme={theme}>
          <InfoRow label="Full Name" value={studentProfile.name} theme={theme} />
          <InfoRow label="Email" value={profileDetails.email} theme={theme} />
          <InfoRow label="Phone" value={profileDetails.phone} theme={theme} />
          <InfoRow label="Licence No." value={profileDetails.licenceNumber} theme={theme} />
          <InfoRow
            label="Transmission"
            value={profileDetails.transmissionPreference}
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
              {APPEARANCE_OPTIONS.map(opt => (
                <Pressable
                  key={opt.key}
                  style={[
                    s.segmentBtn,
                    colorScheme === opt.key && s.segmentBtnActive,
                  ]}
                  onPress={() => setColorScheme(opt.key)}>
                  <Text
                    style={[
                      s.segmentText,
                      colorScheme === opt.key && s.segmentTextActive,
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
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
            label="Booking Requests"
            value={notifRequests}
            onToggle={setNotifRequests}
            theme={theme}
          />
          <ToggleRow
            label="Promotions & Offers"
            value={notifPromotions}
            onToggle={setNotifPromotions}
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

    // Package card
    packageCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    packageLeft: {
      flex: 1,
    },
    packageInstructor: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    packageLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    packageDivider: {
      width: StyleSheet.hairlineWidth,
      height: 36,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.sm,
    },
    packageStat: {
      alignItems: 'center',
      marginHorizontal: theme.spacing.xs,
    },
    packageStatValue: {
      ...theme.typography.h4,
      color: theme.colors.primary,
    },
    packageStatLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    packageBarWrap: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    packageBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primaryLight,
      overflow: 'hidden',
      marginBottom: 4,
    },
    packageBarFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    packageBarLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
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

export default StudentProfileScreen;