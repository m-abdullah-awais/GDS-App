/**
 * GDS Driving School — AdminDashboardScreen
 * ============================================
 * Clean, professional admin dashboard with essential stats,
 * quick-action shortcuts, and pending attention items.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import { loadAdminDashboard } from '../../store/admin/thunks';
import { StatsCard, Avatar } from '../../components/admin';

/* ─── Quick Action Data ─────────────────────────────────────────────────────── */

interface QuickAction {
  label: string;
  icon: string;
  screen: string;
  color: string;
  bgColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Student\nApprovals', icon: 'person-add-outline', screen: 'Student Approvals', color: '#2F6BFF', bgColor: '#2F6BFF15' },
  { label: 'Instructor\nApprovals', icon: 'car-outline', screen: 'Instructor Approvals', color: '#7141F4', bgColor: '#7141F415' },
  { label: 'Package\nApprovals', icon: 'cube-outline', screen: 'Package Approvals', color: '#0EA5E9', bgColor: '#0EA5E915' },
  { label: 'Payments', icon: 'wallet-outline', screen: 'Payments', color: '#22C55E', bgColor: '#22C55E15' },
  { label: 'Messages', icon: 'chatbubbles-outline', screen: 'Messages', color: '#F59E0B', bgColor: '#F59E0B15' },
  { label: 'Reports', icon: 'analytics-outline', screen: 'Reports', color: '#EF4444', bgColor: '#EF444415' },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

const AdminDashboardScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const dashboardStats = useSelector((s: RootState) => s.admin.dashboardStats);
  const students = useSelector((s: RootState) => s.admin.students);
  const instructors = useSelector((s: RootState) => s.admin.instructors);
  const packages = useSelector((s: RootState) => s.admin.packages);
  const profile = useSelector((s: RootState) => s.auth.profile);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      try {
        await (dispatch as any)(loadAdminDashboard());
      } catch (_e) { /* thunk handles errors */ }
      requestAnimationFrame(() => setReady(true));
    });
    return () => task.cancel();
  }, [dispatch]);

  /* ── Derived data ─────────────────────────────────────────────────── */

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, []);

  const userName = profile?.full_name || 'Admin';
  const initials = useMemo(() => {
    const parts = userName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : userName.slice(0, 2).toUpperCase();
  }, [userName]);

  const pendingStudents = useMemo(
    () => students.filter(s => s.approvalStatus === 'pending').length,
    [students],
  );
  const pendingInstructors = useMemo(
    () => instructors.filter(i => i.approvalStatus === 'pending').length,
    [instructors],
  );
  const pendingPackages = useMemo(
    () => packages.filter(p => p.status === 'pending').length,
    [packages],
  );
  const totalPending = pendingStudents + pendingInstructors + pendingPackages;

  /* ── Handlers ─────────────────────────────────────────────────────── */

  const navigateTo = useCallback(
    (screen: string) => navigation.navigate(screen),
    [navigation],
  );

  /* ── Loading ──────────────────────────────────────────────────────── */

  if (!ready) {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeTextBlock}>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
            <Text style={styles.dateText}>{todayStr}</Text>
          </View>
          <Avatar initials={initials} name={userName} imageUrl={(profile as any)?.profile_picture_url || (profile as any)?.profileImage || ''} size={52} theme={theme} />
        </View>
      </View>

      {/* ── Key Stats ──────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <StatsCard
          title="Students"
          value={dashboardStats.totalStudents}
          icon="people-outline"
          accentColor="#2F6BFF"
          tintColor="#2F6BFF"
        />
        <StatsCard
          title="Instructors"
          value={dashboardStats.totalInstructors}
          icon="car-outline"
          accentColor="#7141F4"
          tintColor="#7141F4"
        />
        <StatsCard
          title="Pending"
          value={dashboardStats.pendingApprovals}
          icon="time-outline"
          accentColor="#EF4444"
          tintColor="#EF4444"
        />
        <StatsCard
          title="Revenue"
          value={dashboardStats.monthlyRevenue}
          icon="cash-outline"
          accentColor="#22C55E"
          tintColor="#22C55E"
          prefix="£"
        />
      </View>

      {/* ── Needs Attention ────────────────────────────────────────── */}
      {totalPending > 0 && (
        <>
          <Text style={styles.sectionTitle}>Needs Attention</Text>
          <View style={styles.attentionCard}>
            <View style={styles.attentionHeader}>
              <View style={styles.attentionIconWrap}>
                <Ionicons name="alert-circle" size={22} color="#EF4444" />
              </View>
              <View style={styles.attentionHeaderText}>
                <Text style={styles.attentionTitle}>
                  {totalPending} pending {totalPending === 1 ? 'item' : 'items'}
                </Text>
                <Text style={styles.attentionSubtitle}>Requires your review</Text>
              </View>
            </View>

            <View style={styles.attentionDivider} />

            {pendingStudents > 0 && (
              <Pressable
                style={styles.attentionRow}
                onPress={() => navigateTo('Student Approvals')}>
                <View style={[styles.attentionDot, { backgroundColor: '#2F6BFF' }]} />
                <Text style={styles.attentionRowText}>
                  {pendingStudents} student {pendingStudents === 1 ? 'application' : 'applications'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </Pressable>
            )}
            {pendingInstructors > 0 && (
              <Pressable
                style={styles.attentionRow}
                onPress={() => navigateTo('Instructor Approvals')}>
                <View style={[styles.attentionDot, { backgroundColor: '#7141F4' }]} />
                <Text style={styles.attentionRowText}>
                  {pendingInstructors} instructor {pendingInstructors === 1 ? 'application' : 'applications'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </Pressable>
            )}
            {pendingPackages > 0 && (
              <Pressable
                style={styles.attentionRow}
                onPress={() => navigateTo('Package Approvals')}>
                <View style={[styles.attentionDot, { backgroundColor: '#0EA5E9' }]} />
                <Text style={styles.attentionRowText}>
                  {pendingPackages} package {pendingPackages === 1 ? 'submission' : 'submissions'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </Pressable>
            )}
          </View>
        </>
      )}

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map(action => (
          <Pressable
            key={action.screen}
            style={({ pressed }) => [
              styles.quickCard,
              pressed && styles.quickCardPressed,
            ]}
            onPress={() => navigateTo(action.screen)}
            android_ripple={{ color: action.bgColor, borderless: false }}>
            <View style={[styles.quickIconWrap, { backgroundColor: action.bgColor }]}>
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <Text style={styles.quickLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── Manage Section ─────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Manage</Text>
      <View style={styles.manageList}>
        <ManageRow
          icon="people-outline"
          color="#2F6BFF"
          label="Student Management"
          subtitle={`${dashboardStats.totalStudents} registered`}
          onPress={() => navigateTo('Student Management')}
          theme={theme}
          styles={styles}
        />
        <ManageRow
          icon="briefcase-outline"
          color="#7141F4"
          label="Instructor Management"
          subtitle={`${dashboardStats.totalInstructors} registered`}
          onPress={() => navigateTo('Instructor Management')}
          theme={theme}
          styles={styles}
        />
        <ManageRow
          icon="gift-outline"
          color="#D946EF"
          label="Exclusive Offers"
          subtitle="Manage promotions"
          onPress={() => navigateTo('Exclusive Offers')}
          theme={theme}
          styles={styles}
        />
        <ManageRow
          icon="person-circle-outline"
          color="#0EA5E9"
          label="Profile & Settings"
          subtitle="Account preferences"
          onPress={() => navigateTo('Profile')}
          theme={theme}
          styles={styles}
        />
      </View>
    </ScrollView>
  );
};

/* ─── ManageRow Sub-component ───────────────────────────────────────────────── */

interface ManageRowProps {
  icon: string;
  color: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}

const ManageRow: React.FC<ManageRowProps> = ({
  icon, color, label, subtitle, onPress, theme, styles,
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.manageRow,
      pressed && { opacity: 0.7 },
    ]}
    onPress={onPress}>
    <View style={[styles.manageIconWrap, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.manageTextBlock}>
      <Text style={styles.manageLabel}>{label}</Text>
      <Text style={styles.manageSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
  </Pressable>
);

/* ─── Styles ────────────────────────────────────────────────────────────────── */

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['5xl'],
    },

    /* Welcome */
    welcomeCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.md,
    },
    welcomeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    welcomeTextBlock: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    greetingText: {
      ...theme.typography.bodyMedium,
      color: 'rgba(255,255,255,0.8)',
    },
    userName: {
      ...theme.typography.h1,
      color: '#FFFFFF',
      marginTop: 2,
    },
    dateText: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.65)',
      marginTop: 4,
    },

    /* Section Titles */
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },

    /* Stats Grid */
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },

    /* Needs Attention */
    attentionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm,
    },
    attentionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    attentionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.md,
      backgroundColor: '#EF444415',
      alignItems: 'center',
      justifyContent: 'center',
    },
    attentionHeaderText: {
      flex: 1,
    },
    attentionTitle: {
      ...theme.typography.bodyMedium,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    attentionSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 1,
    },
    attentionDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.sm,
    },
    attentionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.sm,
    },
    attentionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    attentionRowText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      flex: 1,
    },

    /* Quick Actions */
    quickGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    quickCard: {
      flexBasis: '31%',
      flexGrow: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    quickCardPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.97 }],
    },
    quickIconWrap: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    quickLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: 15,
    },

    /* Manage List */
    manageList: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm,
    },
    manageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    manageIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    manageTextBlock: {
      flex: 1,
    },
    manageLabel: {
      ...theme.typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    manageSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 1,
    },
  });

export default AdminDashboardScreen;
