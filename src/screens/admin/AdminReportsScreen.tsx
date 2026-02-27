/**
 * GDS Driving School — AdminReportsScreen
 * =========================================
 * Reports & analytics with chart placeholder cards and summary stats.
 */

import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import {
  StatsCard,
  ChartPlaceholder,
  SectionHeader,
} from '../../components/admin';

const AdminReportsScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { dashboardStats, students, instructors, transactions } = useSelector(
    (state: RootState) => state.admin,
  );

  const derivedStats = useMemo(() => {
    const approvalRate =
      students.length > 0
        ? Math.round(
            (students.filter(s => s.approvalStatus === 'approved').length /
              students.length) *
              100,
          )
        : 0;
    const avgRating =
      instructors.length > 0
        ? (
            instructors.reduce((sum, i) => sum + i.rating, 0) /
            instructors.length
          ).toFixed(1)
        : '0';
    const totalRevenue = transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
    const avgLessonsPerStudent =
      students.length > 0
        ? Math.round(
            students.reduce((sum, s) => sum + s.lessonsCompleted, 0) /
              students.length,
          )
        : 0;
    return { approvalRate, avgRating, totalRevenue, avgLessonsPerStudent };
  }, [students, instructors, transactions]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Key Metrics */}
      <SectionHeader title="Key Metrics" />
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
          title="Approval Rate"
          value={derivedStats.approvalRate}
          icon="checkmark-done-outline"
          accentColor="#1FBF5B"
          tintColor="#1FBF5B"
          suffix="%"
        />
        <StatsCard
          title="Avg Rating"
          value={Number(derivedStats.avgRating)}
          icon="star-outline"
          accentColor="#F97316"
          tintColor="#F97316"
        />
        <StatsCard
          title="Total Revenue"
          value={derivedStats.totalRevenue}
          icon="cash-outline"
          accentColor="#0EA5E9"
          tintColor="#0EA5E9"
          prefix={'£'}
        />
        <StatsCard
          title="Avg Lessons"
          value={derivedStats.avgLessonsPerStudent}
          icon="book-outline"
          accentColor="#D946EF"
          tintColor="#D946EF"
          suffix="/student"
        />
      </View>

      {/* Chart Placeholders */}
      <SectionHeader title="Charts & Analytics" />
      <View style={styles.chartsGrid}>
        <ChartPlaceholder
          title="Revenue Over Time"
          icon="trending-up-outline"
          accentColor={theme.colors.highlight}
          subtitle="Monthly breakdown of revenue trends"
          height={180}
        />
        <ChartPlaceholder
          title="Student Registrations"
          icon="bar-chart-outline"
          accentColor={theme.colors.primary}
          subtitle="Weekly new student sign-ups"
          height={180}
        />
        <ChartPlaceholder
          title="Lesson Completions"
          icon="analytics-outline"
          accentColor={theme.colors.success}
          subtitle="Daily lesson completion rates"
          height={180}
        />
        <ChartPlaceholder
          title="Instructor Performance"
          icon="podium-outline"
          accentColor={theme.colors.accent}
          subtitle="Top instructors by rating & lessons"
          height={180}
        />
        <ChartPlaceholder
          title="Approval Funnel"
          icon="funnel-outline"
          accentColor={theme.colors.warning}
          subtitle="Pending, approved, rejected breakdowns"
          height={180}
        />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Report Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Active Lessons</Text>
          <Text style={styles.summaryValue}>{dashboardStats.activeLessons}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pending Approvals</Text>
          <Text style={styles.summaryValue}>{dashboardStats.pendingApprovals}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pending Payouts</Text>
          <Text style={styles.summaryValue}>{'\u00A3'}{dashboardStats.pendingPayouts}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Avg Lessons per Student</Text>
          <Text style={styles.summaryValue}>{derivedStats.avgLessonsPerStudent}</Text>
        </View>
        <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.summaryLabel}>Avg Instructor Rating</Text>
          <Text style={styles.summaryValue}>{derivedStats.avgRating}/5</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.md, paddingBottom: theme.spacing['4xl'] },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing['2xl'],
    },
    chartsGrid: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing['2xl'],
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    summaryTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    summaryLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
  });

export default AdminReportsScreen;
