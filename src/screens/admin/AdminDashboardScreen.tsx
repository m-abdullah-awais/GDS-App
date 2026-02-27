/**
 * GDS Driving School — AdminDashboardScreen
 * ============================================
 * Admin overview dashboard with stats, chart placeholders, and recent cards.
 */

import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import {
  StatsCard,
  SectionHeader,
  ChartPlaceholder,
  StatusBadge,
  Avatar,
} from '../../components/admin';

const AdminDashboardScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { dashboardStats, students, instructors, transactions } = useSelector(
    (state: RootState) => state.admin,
  );

  const recentStudents = useMemo(
    () =>
      [...students]
        .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))
        .slice(0, 5),
    [students],
  );

  const recentInstructors = useMemo(
    () =>
      [...instructors]
        .sort((a, b) => {
          const aDate = a.documentsUploaded[0]?.uploadedDate ?? '';
          const bDate = b.documentsUploaded[0]?.uploadedDate ?? '';
          return bDate.localeCompare(aDate);
        })
        .slice(0, 5),
    [instructors],
  );

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [transactions],
  );

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
      year: 'numeric',
    });
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Welcome Header */}
      {/* <View style={styles.welcomeSection}>
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.adminName}>Admin</Text>
            <Text style={styles.dateText}>{todayStr}</Text>
          </View>
          <Avatar initials="AD" size={48} theme={theme} />
        </View>
      </View> */}

      {/* Stats Grid */}
      <SectionHeader title="Overview" />
      <View style={styles.statsGrid}>
        <StatsCard
          title="Total Students"
          value={dashboardStats.totalStudents}
          icon="people-outline"
          accentColor="#2F6BFF"
          tintColor="#2F6BFF"
        />
        <StatsCard
          title="Total Instructors"
          value={dashboardStats.totalInstructors}
          icon="car-outline"
          accentColor="#7141F4"
          tintColor="#7141F4"
        />
        <StatsCard
          title="Active Lessons"
          value={dashboardStats.activeLessons}
          icon="calendar-outline"
          accentColor="#1FBF5B"
          tintColor="#1FBF5B"
        />
        <StatsCard
          title="Pending Approvals"
          value={dashboardStats.pendingApprovals}
          icon="time-outline"
          accentColor="#EF4444"
          tintColor="#EF4444"
        />
        <StatsCard
          title="Monthly Revenue"
          value={dashboardStats.monthlyRevenue}
          icon="cash-outline"
          accentColor="#0EA5E9"
          tintColor="#0EA5E9"
          prefix="£"
        />
        <StatsCard
          title="Pending Payouts"
          value={dashboardStats.pendingPayouts}
          icon="wallet-outline"
          accentColor="#D946EF"
          tintColor="#D946EF"
          prefix="£"
        />
      </View>

      {/* Chart Placeholders */}
      <View style={styles.section}>
        <SectionHeader title="Activity" />
        <View style={styles.chartsColumn}>
          <ChartPlaceholder
            title="Revenue Chart"
            icon="trending-up-outline"
            accentColor={theme.colors.highlight}
            subtitle="Monthly revenue trends"
          />
          <ChartPlaceholder
            title="Lessons Activity"
            icon="bar-chart-outline"
            accentColor={theme.colors.success}
            subtitle="Weekly lesson completions"
          />
          <ChartPlaceholder
            title="Approval Trends"
            icon="analytics-outline"
            accentColor={theme.colors.info}
            subtitle="Student & instructor approvals"
          />
        </View>
      </View>

      {/* Recent Students — Card-based */}
      <View style={styles.section}>
        <SectionHeader title="Recent Students" />
        <View style={styles.cardList}>
          {recentStudents.map(student => (
            <View key={student.id} style={styles.listCard}>
              <View style={styles.listCardRow}>
                <Avatar initials={student.avatar} size={36} theme={theme} />
                <View style={styles.listCardInfo}>
                  <Text style={styles.listCardName} numberOfLines={1}>{student.name}</Text>
                  <Text style={styles.listCardSub} numberOfLines={1}>{student.city}</Text>
                </View>
                <StatusBadge status={student.approvalStatus} />
              </View>
              <View style={styles.listCardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={12} color={theme.colors.textTertiary} />
                  <Text style={styles.metaText}>{student.registrationDate}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Instructors — Card-based */}
      <View style={styles.section}>
        <SectionHeader title="Recent Instructors" />
        <View style={styles.cardList}>
          {recentInstructors.map(inst => (
            <View key={inst.id} style={styles.listCard}>
              <View style={styles.listCardRow}>
                <Avatar initials={inst.avatar} size={36} theme={theme} />
                <View style={styles.listCardInfo}>
                  <Text style={styles.listCardName} numberOfLines={1}>{inst.name}</Text>
                  <Text style={styles.listCardSub} numberOfLines={1}>{inst.city}</Text>
                </View>
                <StatusBadge status={inst.approvalStatus} />
              </View>
              <View style={styles.listCardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="briefcase-outline" size={12} color={theme.colors.textTertiary} />
                  <Text style={styles.metaText}>{inst.experience}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="star-outline" size={12} color={theme.colors.textTertiary} />
                  <Text style={styles.metaText}>{inst.rating > 0 ? inst.rating : 'N/A'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Transactions — Card-based */}
      <View style={styles.section}>
        <SectionHeader title="Recent Transactions" />
        <View style={styles.cardList}>
          {recentTransactions.map(txn => (
            <View key={txn.id} style={styles.listCard}>
              <View style={styles.listCardRow}>
                <View style={[styles.txnIcon, { backgroundColor: txn.status === 'paid' ? theme.colors.successLight : theme.colors.warningLight }]}>
                  <Ionicons
                    name={txn.status === 'paid' ? 'checkmark-circle-outline' : 'time-outline'}
                    size={18}
                    color={txn.status === 'paid' ? theme.colors.success : theme.colors.warning}
                  />
                </View>
                <View style={styles.listCardInfo}>
                  <Text style={styles.listCardName} numberOfLines={1}>{txn.instructorName}</Text>
                  <Text style={styles.listCardSub} numberOfLines={1}>{txn.description}</Text>
                </View>
                <View style={styles.txnAmount}>
                  <Text style={styles.txnAmountText}>{'\u00A3'}{txn.amount}</Text>
                  <StatusBadge status={txn.status} />
                </View>
              </View>
              <View style={styles.listCardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={12} color={theme.colors.textTertiary} />
                  <Text style={styles.metaText}>{txn.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="card-outline" size={12} color={theme.colors.textTertiary} />
                  <Text style={styles.metaText}>{txn.method}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['4xl'],
    },
    welcomeSection: {
      marginBottom: theme.spacing.lg,
    },
    welcomeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    greeting: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    adminName: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
      marginTop: 2,
    },
    dateText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing['2xl'],
    },
    section: {
      marginBottom: theme.spacing['2xl'],
    },
    chartsColumn: {
      gap: theme.spacing.sm,
    },
    cardList: {
      gap: theme.spacing.sm,
    },
    listCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    listCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    listCardInfo: {
      flex: 1,
    },
    listCardName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    listCardSub: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    listCardMeta: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    txnIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txnAmount: {
      alignItems: 'flex-end',
      gap: 4,
    },
    txnAmountText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
  });

export default AdminDashboardScreen;