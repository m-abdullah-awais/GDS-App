/**
 * InstructorDashboardScreen
 * ==========================
 * Main instructor dashboard — matches StudentDashboardScreen layout and design.
 */

import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';
import ScreenContainer from '../../components/ScreenContainer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  instructorProfile,
  instructorPackages,
  instructorStudents,
  instructorLessons,
  type InstructorLesson,
} from '../../modules/instructor/mockData';

type Props = CompositeScreenProps<
  DrawerScreenProps<InstructorTabsParamList, 'Dashboard'>,
  NativeStackScreenProps<InstructorStackParamList>
>;

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  screen: keyof InstructorStackParamList;
}

const InstructorDashboardScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const upcomingLessons = instructorLessons.filter(l => l.status === 'upcoming');
  const completedLessons = instructorLessons.filter(l => l.status === 'completed');
  const approvedPackages = instructorPackages.filter(p => p.status === 'approved').length;
  const activeStudents = instructorStudents.length;

  const QUICK_ACTIONS: QuickAction[] = [
    { id: '1', label: 'Configure\nAreas', icon: 'location-outline', iconBg: 'rgba(255,255,255,0.2)', iconColor: theme.colors.textInverse, cardBg: '#2F6BFF', screen: 'Areas' },
    { id: '2', label: 'Manage\nPackages', icon: 'cube-outline', iconBg: 'rgba(255,255,255,0.2)', iconColor: theme.colors.textInverse, cardBg: '#7141F4', screen: 'CreatePackage' },
    { id: '3', label: 'Set\nAvailability', icon: 'time-outline', iconBg: 'rgba(255,255,255,0.2)', iconColor: theme.colors.textInverse, cardBg: '#1FBF5B', screen: 'Availability' },
    { id: '4', label: 'View\nSchedule', icon: 'calendar-outline', iconBg: 'rgba(255,255,255,0.2)', iconColor: theme.colors.textInverse, cardBg: '#EF4444', screen: 'Schedule' },
    { id: '5', label: 'Student\nRequests', icon: 'people-outline', iconBg: 'rgba(255,255,255,0.2)', iconColor: theme.colors.textInverse, cardBg: '#0EA5E9', screen: 'Requests' },
    { id: '6', label: 'Manage\nEarnings', icon: 'cash-outline', iconBg: 'rgba(255,255,255,0.2)', iconColor: theme.colors.textInverse, cardBg: '#D946EF', screen: 'Earnings' },
  ];

  const handleQuickAction = (action: QuickAction) => {
    navigation.getParent()?.navigate(action.screen);
  };

  return (
    <ScreenContainer>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={s.heroCard}>
          <View style={s.heroGradientOverlay} />
          <View style={s.heroContent}>
            <Text style={s.heroGreeting}>Welcome back,</Text>
            <Text style={s.heroName}>{instructorProfile.fullName}</Text>
            <Text style={s.heroSubtitle}>
              You have {upcomingLessons.length} upcoming lesson{upcomingLessons.length !== 1 ? 's' : ''} this week
            </Text>
          </View>
        </View>

        {/* Overview Stats */}
        <View style={s.sectionHeader}><Text style={s.sectionTitle}>Overview</Text></View>
        <View style={s.statsCard}>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statNumber}>{activeStudents}</Text>
              <Text style={s.statLabel}>Students</Text>
            </View>
            <View style={s.statsDivider} />
            <View style={s.statItem}>
              <Text style={s.statNumberSuccess}>{approvedPackages}</Text>
              <Text style={s.statLabel}>Packages</Text>
            </View>
            <View style={s.statsDivider} />
            <View style={s.statItem}>
              <Text style={s.statNumberMuted}>{completedLessons.length}</Text>
              <Text style={s.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Lessons */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Upcoming Lessons</Text>
          <Pressable onPress={() => navigation.navigate('Schedule')}>
            <Text style={s.seeAll}>See All</Text>
          </Pressable>
        </View>
        {upcomingLessons.length > 0 ? (
          <FlatList
            horizontal
            data={upcomingLessons.slice(0, 5)}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.lessonList}
            renderItem={({ item }: { item: InstructorLesson }) => (
              <View style={s.lessonCard}>
                <View style={s.lessonDateBadge}>
                  <Text style={s.lessonDateDay}>{new Date(item.date).getDate()}</Text>
                  <Text style={s.lessonDateMonth}>{new Date(item.date).toLocaleString('en-GB', { month: 'short' })}</Text>
                </View>
                <View style={s.lessonDetails}>
                  <Text style={s.lessonTime}>{item.time}</Text>
                  <Text style={s.lessonDuration}>{item.duration}</Text>
                  <Text style={s.lessonStudent} numberOfLines={1}>{item.studentName}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={s.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={theme.colors.textTertiary} style={s.emptyIcon} />
            <Text style={s.emptyText}>No upcoming lessons</Text>
            <Text style={s.emptySubtext}>Your schedule is clear</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={s.sectionHeader}><Text style={s.sectionTitle}>Quick Actions</Text></View>
        <View style={s.actionsGrid}>
          <View style={s.actionsRow}>
            {QUICK_ACTIONS.slice(0, 3).map(action => (
              <Pressable key={action.id} style={[s.actionCard, { backgroundColor: action.cardBg }]} onPress={() => handleQuickAction(action)}>
                <View style={[s.actionIcon, { backgroundColor: action.iconBg }]}>
                  <Ionicons name={action.icon} size={24} color={action.iconColor} />
                </View>
                <Text style={[s.actionLabel, { color: theme.colors.textInverse }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.actionsRow}>
            {QUICK_ACTIONS.slice(3, 6).map(action => (
              <Pressable key={action.id} style={[s.actionCard, { backgroundColor: action.cardBg }]} onPress={() => handleQuickAction(action)}>
                <View style={[s.actionIcon, { backgroundColor: action.iconBg }]}>
                  <Ionicons name={action.icon} size={24} color={action.iconColor} />
                </View>
                <Text style={[s.actionLabel, { color: theme.colors.textInverse }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: theme.spacing['2xl'] }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: theme.spacing['3xl'] },
    // Hero
    heroCard: {
      backgroundColor: theme.colors.primary,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      ...theme.shadows.lg,
    },
    heroGradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.06)',
    },
    heroContent: { padding: theme.spacing.xl },
    heroGreeting: { ...theme.typography.bodyMedium, color: 'rgba(255,255,255,0.8)' },
    heroName: { ...theme.typography.displayMedium, color: '#FFFFFF', marginTop: theme.spacing.xxs },
    heroSubtitle: { ...theme.typography.bodyMedium, color: 'rgba(255,255,255,0.75)', marginTop: theme.spacing.xs },
    // Sections
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
    seeAll: { ...theme.typography.buttonSmall, color: theme.colors.primary },
    // Stats Card
    statsCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { ...theme.typography.displayLarge, color: theme.colors.primary },
    statNumberSuccess: { ...theme.typography.displayMedium, color: theme.colors.success },
    statNumberMuted: { ...theme.typography.displayMedium, color: theme.colors.textTertiary },
    statLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs },
    statsDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.divider,
      marginHorizontal: theme.spacing.sm,
    },
    // Upcoming Lessons
    lessonList: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm },
    lessonCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      width: 150,
      ...theme.shadows.sm,
    },
    lessonDateBadge: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      alignSelf: 'flex-start',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    lessonDateDay: { ...theme.typography.h2, color: theme.colors.primary },
    lessonDateMonth: { ...theme.typography.caption, color: theme.colors.primary, textTransform: 'uppercase' },
    lessonDetails: { gap: theme.spacing.xxs },
    lessonTime: { ...theme.typography.h4, color: theme.colors.textPrimary },
    lessonDuration: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
    lessonStudent: { ...theme.typography.caption, color: theme.colors.textTertiary },
    // Quick Actions
    actionsGrid: { marginHorizontal: theme.spacing.md, gap: theme.spacing.sm },
    actionsRow: { flexDirection: 'row', gap: theme.spacing.sm },
    actionCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    actionLabel: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      fontWeight: '600',
    },
    // Empty
    emptyState: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing['2xl'],
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    emptyIcon: { marginBottom: theme.spacing.sm },
    emptyText: { ...theme.typography.h4, color: theme.colors.textPrimary },
    emptySubtext: { ...theme.typography.bodySmall, color: theme.colors.textTertiary, marginTop: theme.spacing.xxs },
  });

export default InstructorDashboardScreen;
