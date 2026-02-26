/**
 * GDS Driving School — StudentProgressScreen
 * =============================================
 *
 * Shows a student's overall training progress including:
 *   - Hours completed vs. total package hours
 *   - Lesson completion stats
 *   - Per-skill breakdown with individual progress bars
 *   - Milestones / achievements
 *   - DVSA test readiness indicator
 */

import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { studentProfile, lessons } from '../../modules/student/mockData';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ─── Local Progress Mock Data ─────────────────────────────────────────────────

interface SkillArea {
  id: string;
  name: string;
  progress: number; // 0–1
  badge: string;
}

const skillAreas: SkillArea[] = [
  { id: '1', name: 'Junctions & Crossroads', progress: 0.85, badge: 'git-network-outline' },
  { id: '2', name: 'Roundabouts', progress: 0.72, badge: 'sync-circle-outline' },
  { id: '3', name: 'Parallel Parking', progress: 0.6, badge: 'car-outline' },
  { id: '4', name: 'Bay Parking', progress: 0.55, badge: 'grid-outline' },
  { id: '5', name: 'Dual Carriageway', progress: 0.7, badge: 'speedometer-outline' },
  { id: '6', name: 'Town Centre Driving', progress: 0.9, badge: 'business-outline' },
  { id: '7', name: 'Emergency Stop', progress: 0.8, badge: 'stop-circle-outline' },
  { id: '8', name: 'Independent Driving', progress: 0.45, badge: 'compass-outline' },
];

interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  achieved: boolean;
  icon: string;
}

const milestones: Milestone[] = [
  {
    id: 'm1',
    title: 'First Lesson',
    subtitle: 'Started your journey',
    achieved: true,
    icon: 'flag-outline',
  },
  {
    id: 'm2',
    title: '5 Lessons Done',
    subtitle: 'Building confidence',
    achieved: true,
    icon: 'star-outline',
  },
  {
    id: 'm3',
    title: '10 Hours Completed',
    subtitle: 'Half-way milestone',
    achieved: true,
    icon: 'trophy-outline',
  },
  {
    id: 'm4',
    title: 'Mock Test Ready',
    subtitle: 'Eligible for practice test',
    achieved: false,
    icon: 'clipboard-outline',
  },
  {
    id: 'm5',
    title: 'Full Package Complete',
    subtitle: 'All hours finished',
    achieved: false,
    icon: 'school-outline',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getSkillLabel = (progress: number): string => {
  if (progress >= 0.85) return 'Expert';
  if (progress >= 0.65) return 'Confident';
  if (progress >= 0.45) return 'Developing';
  return 'Beginner';
};

const getSkillColor = (progress: number, theme: AppTheme): string => {
  if (progress >= 0.85) return theme.colors.success;
  if (progress >= 0.65) return theme.colors.primary;
  if (progress >= 0.45) return theme.colors.warning;
  return theme.colors.error;
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const ProgressBar = ({
  progress,
  height = 8,
  color,
  backgroundColor,
}: {
  progress: number;
  height?: number;
  color: string;
  backgroundColor: string;
}) => (
  <View
    style={{
      height,
      borderRadius: height / 2,
      backgroundColor,
      overflow: 'hidden',
    }}>
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: color,
        width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
      }}
    />
  </View>
);

const StatChip = ({
  value,
  label,
  accent,
  theme,
}: {
  value: string | number;
  label: string;
  accent: string;
  theme: AppTheme;
}) => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      ...theme.shadows.sm,
    }}>
    <Text style={[theme.typography.h3, { color: accent, marginBottom: 2 }]}>
      {value}
    </Text>
    <Text
      style={[
        theme.typography.caption,
        { color: theme.colors.textSecondary, textAlign: 'center' },
      ]}>
      {label}
    </Text>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

type SkillTab = 'skills' | 'milestones';

const StudentProgressScreen = () => {
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [activeTab, setActiveTab] = useState<SkillTab>('skills');

  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const upcomingLessons = lessons.filter(l => l.status === 'upcoming').length;
  const hoursUsed = studentProfile.totalHours - studentProfile.remainingHours;
  const hoursProgress = hoursUsed / studentProfile.totalHours;

  const avgSkill =
    skillAreas.reduce((sum, skill) => sum + skill.progress, 0) / skillAreas.length;
  const testReadiness = Math.round((hoursProgress * 0.5 + avgSkill * 0.5) * 100);
  const achievedCount = milestones.filter(m => m.achieved).length;

  return (
    <ScreenContainer>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero Card ──────────────────────────────────────────── */}
        <View style={s.heroCard}>
          <View style={s.heroLeft}>
            <Text style={s.heroLabel}>Overall Progress</Text>
            <Text style={s.heroPercent}>{Math.round(hoursProgress * 100)}%</Text>
            <Text style={s.heroSub}>
              {hoursUsed} of {studentProfile.totalHours} hours completed
            </Text>
          </View>
          <View style={s.heroRight}>
            <View style={s.heroRingOuter}>
              <View style={s.heroRingInner}>
                <Text style={s.heroRingPercent}>{Math.round(hoursProgress * 100)}</Text>
                <Text style={s.heroRingPct}>%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Stat Chips ─────────────────────────────────────────── */}
        <View style={s.statsRow}>
          <StatChip
            value={hoursUsed}
            label={'Hours\nDone'}
            accent={theme.colors.primary}
            theme={theme}
          />
          <View style={{ width: theme.spacing.sm }} />
          <StatChip
            value={completedLessons}
            label={'Lessons\nCompleted'}
            accent={theme.colors.success}
            theme={theme}
          />
          <View style={{ width: theme.spacing.sm }} />
          <StatChip
            value={upcomingLessons}
            label={'Upcoming\nLessons'}
            accent={theme.colors.accent}
            theme={theme}
          />
        </View>

        {/* ── Hours Progress Bar ─────────────────────────────────── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Package Hours</Text>
            <Text style={s.cardBadge}>
              {studentProfile.remainingHours} hrs remaining
            </Text>
          </View>
          <ProgressBar
            progress={hoursProgress}
            height={10}
            color={theme.colors.primary}
            backgroundColor={theme.colors.primaryLight}
          />
          <View style={s.barLabels}>
            <Text style={s.barLabel}>0 hrs</Text>
            <Text style={s.barLabel}>{studentProfile.totalHours} hrs</Text>
          </View>
        </View>

        {/* ── Test Readiness ─────────────────────────────────────── */}
        <View style={[s.card, s.readinessCard]}>
          <View style={s.readinessLeft}>
            <Text style={s.readinessTitle}>DVSA Test Readiness</Text>
            <Text style={s.readinessSubtitle}>
              {testReadiness >= 80
                ? "You're approaching test-ready level!"
                : testReadiness >= 60
                ? 'Good progress — keep building!'
                : 'Keep practising to improve readiness.'}
            </Text>
            <ProgressBar
              progress={testReadiness / 100}
              height={8}
              color={
                testReadiness >= 80
                  ? theme.colors.success
                  : testReadiness >= 60
                  ? theme.colors.primary
                  : theme.colors.warning
              }
              backgroundColor={theme.colors.border}
            />
          </View>
          <View style={s.readinessScore}>
            <Text
              style={[
                s.readinessNumber,
                {
                  color:
                    testReadiness >= 80
                      ? theme.colors.success
                      : testReadiness >= 60
                      ? theme.colors.primary
                      : theme.colors.warning,
                },
              ]}>
              {testReadiness}
            </Text>
            <Text style={s.readinessPct}>/ 100</Text>
          </View>
        </View>

        {/* ── Tab Toggle ─────────────────────────────────────────── */}
        <View style={s.tabRow}>
          <Pressable
            style={[s.tab, activeTab === 'skills' && s.tabActive]}
            onPress={() => setActiveTab('skills')}>
            <Text style={[s.tabText, activeTab === 'skills' && s.tabTextActive]}>
              Driving Skills
            </Text>
          </Pressable>
          <Pressable
            style={[s.tab, activeTab === 'milestones' && s.tabActive]}
            onPress={() => setActiveTab('milestones')}>
            <Text
              style={[s.tabText, activeTab === 'milestones' && s.tabTextActive]}>
              Milestones {achievedCount}/{milestones.length}
            </Text>
          </Pressable>
        </View>

        {/* ── Skills ─────────────────────────────────────────────── */}
        {activeTab === 'skills' && (
          <View style={s.card}>
            <Text style={s.cardSubNote}>
              Average level:{' '}
              <Text
                style={{
                  color: getSkillColor(avgSkill, theme),
                  fontWeight: '600',
                }}>
                {getSkillLabel(avgSkill)} ({Math.round(avgSkill * 100)}%)
              </Text>
            </Text>
            {skillAreas.map((skill, idx) => (
              <View
                key={skill.id}
                style={[
                  s.skillRow,
                  idx < skillAreas.length - 1 && s.skillRowBorder,
                ]}>
                <Ionicons
                  name={skill.badge}
                  size={20}
                  color={getSkillColor(skill.progress, theme)}
                  style={s.skillIcon}
                />
                <View style={s.skillInfo}>
                  <View style={s.skillTitleRow}>
                    <Text style={s.skillName}>{skill.name}</Text>
                    <Text
                      style={[
                        s.skillLevelLabel,
                        { color: getSkillColor(skill.progress, theme) },
                      ]}>
                      {getSkillLabel(skill.progress)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={skill.progress}
                    height={6}
                    color={getSkillColor(skill.progress, theme)}
                    backgroundColor={theme.colors.border}
                  />
                  <Text style={s.skillPct}>{Math.round(skill.progress * 100)}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Milestones ─────────────────────────────────────────── */}
        {activeTab === 'milestones' && (
          <View style={s.card}>
            {milestones.map((milestone, idx) => (
              <View
                key={milestone.id}
                style={[
                  s.milestoneRow,
                  idx < milestones.length - 1 && s.milestoneRowBorder,
                  !milestone.achieved && s.milestoneRowDim,
                ]}>
                <View
                  style={[
                    s.milestoneIconWrap,
                    {
                      backgroundColor: milestone.achieved
                        ? theme.colors.primaryLight
                        : theme.colors.border,
                    },
                  ]}>
                  <Ionicons
                    name={milestone.icon}
                    size={20}
                    color={milestone.achieved ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                <View style={s.milestoneText}>
                  <Text
                    style={[
                      s.milestoneTitle,
                      !milestone.achieved && { color: theme.colors.textSecondary },
                    ]}>
                    {milestone.title}
                  </Text>
                  <Text style={s.milestoneSubtitle}>{milestone.subtitle}</Text>
                </View>
                <View
                  style={[
                    s.milestoneBadge,
                    {
                      backgroundColor: milestone.achieved
                        ? theme.colors.successLight
                        : theme.colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      s.milestoneBadgeText,
                      {
                        color: milestone.achieved
                          ? theme.colors.success
                          : theme.colors.disabledText,
                      },
                    ]}>
                    {milestone.achieved ? '✓ Done' : 'Locked'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

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
      padding: theme.spacing.md,
      paddingTop: theme.spacing.lg,
    },

    // Hero
    heroCard: {
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      ...theme.shadows.md,
    },
    heroLeft: { flex: 1 },
    heroLabel: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    heroPercent: {
      ...theme.typography.h1,
      color: theme.colors.textInverse,
      fontSize: 40,
      lineHeight: 46,
    },
    heroSub: {
      ...theme.typography.bodySmall,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },
    heroRight: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.spacing.md,
    },
    heroRingOuter: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 6,
      borderColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroRingInner: { alignItems: 'center' },
    heroRingPercent: {
      ...theme.typography.h2,
      color: theme.colors.textInverse,
      lineHeight: 28,
    },
    heroRingPct: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.75)',
    },

    // Stats row
    statsRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },

    // Cards
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    cardTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    cardBadge: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    cardSubNote: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    barLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    barLabel: {
      ...theme.typography.caption,
      color: theme.colors.disabledText,
    },

    // Test Readiness
    readinessCard: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    readinessLeft: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    readinessTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    readinessSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    readinessScore: { alignItems: 'center' },
    readinessNumber: {
      ...theme.typography.h1,
      fontSize: 36,
      lineHeight: 40,
    },
    readinessPct: {
      ...theme.typography.caption,
      color: theme.colors.disabledText,
    },

    // Tab Toggle
    tabRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 4,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
    },
    tabActive: { backgroundColor: theme.colors.primary },
    tabText: {
      ...theme.typography.buttonSmall,
      color: theme.colors.textSecondary,
    },
    tabTextActive: { color: theme.colors.textInverse },

    // Skills
    skillRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.sm,
    },
    skillRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    skillIcon: {
      marginRight: theme.spacing.sm,
      marginTop: 2,
      width: 26,
      textAlign: 'center' as const,
    },
    skillInfo: { flex: 1 },
    skillTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    skillName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    skillLevelLabel: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
    skillPct: {
      ...theme.typography.caption,
      color: theme.colors.disabledText,
      marginTop: 3,
    },

    // Milestones
    milestoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    milestoneRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    milestoneRowDim: { opacity: 0.55 },
    milestoneIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    milestoneIcon: {},
    milestoneText: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    milestoneTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    milestoneSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    milestoneBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    milestoneBadgeText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
  });

export default StudentProgressScreen;