/**
 * GDS Driving School — StudentDashboardScreen
 * ==============================================
 *
 * Primary landing screen for students after login.
 * Features welcome hero, remaining hours, active instructor,
 * upcoming lessons preview, and quick action buttons.
 */

import React from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { studentProfile, lessons, instructors } from '../../modules/student/mockData';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

// ─── Avatar Helper ────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 44,
  theme,
}: {
  initials: string;
  size?: number;
  theme: AppTheme;
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text
      style={[
        theme.typography.buttonSmall,
        { color: theme.colors.textInverse, fontSize: size * 0.36 },
      ]}>
      {initials}
    </Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

const StudentDashboardScreen = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  const upcomingLessons = lessons.filter(l => l.status === 'upcoming');
  const activeInstructor = instructors.find(
    i => i.name === studentProfile.activeInstructor,
  );
  const hoursUsed = studentProfile.totalHours - studentProfile.remainingHours;
  const progress = hoursUsed / studentProfile.totalHours;

  return (
    <ScreenContainer>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Welcome Hero ─────────────────────────────────────── */}
        <View style={s.heroCard}>
          <View style={s.heroGradientOverlay} />
          <View style={s.heroContent}>
            <Text style={s.heroGreeting}>Good morning,</Text>
            <Text style={s.heroName}>{studentProfile.name}</Text>
            <Text style={s.heroSubtitle}>
              You have {upcomingLessons.length} upcoming lesson
              {upcomingLessons.length !== 1 ? 's' : ''} this week
            </Text>
          </View>
        </View>

        {/* ── Remaining Hours ──────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Your Progress</Text>
        </View>
        <View style={s.hoursCard}>
          <View style={s.hoursRow}>
            <View style={s.hoursStat}>
              <Text style={s.hoursNumber}>
                {studentProfile.remainingHours}
              </Text>
              <Text style={s.hoursLabel}>Hours Left</Text>
            </View>
            <View style={s.hoursDivider} />
            <View style={s.hoursStat}>
              <Text style={s.hoursUsed}>{hoursUsed}</Text>
              <Text style={s.hoursLabel}>Completed</Text>
            </View>
            <View style={s.hoursDivider} />
            <View style={s.hoursStat}>
              <Text style={s.hoursTotal}>{studentProfile.totalHours}</Text>
              <Text style={s.hoursLabel}>Total</Text>
            </View>
          </View>
          <View style={s.progressBarBg}>
            <View
              style={[s.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={s.progressText}>
            {Math.round(progress * 100)}% of your package completed
          </Text>
        </View>

        {/* ── Active Instructor ────────────────────────────────── */}
        {activeInstructor && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Your Instructor</Text>
            </View>
            <Pressable
              style={s.instructorCard}
              onPress={() =>
                navigation.navigate('InstructorProfile', {
                  instructorId: activeInstructor.id,
                })
              }>
              <Avatar
                initials={activeInstructor.avatar}
                size={52}
                theme={theme}
              />
              <View style={s.instructorInfo}>
                <Text style={s.instructorName}>{activeInstructor.name}</Text>
                <View style={s.instructorMeta}>
                  <Text style={s.instructorRating}>
                    ★ {activeInstructor.rating}
                  </Text>
                  <Text style={s.instructorDot}>·</Text>
                  <Text style={s.instructorDetail}>
                    {activeInstructor.transmissionType}
                  </Text>
                  <Text style={s.instructorDot}>·</Text>
                  <Text style={s.instructorDetail}>
                    {activeInstructor.passRate}% pass rate
                  </Text>
                </View>
              </View>
              <Text style={s.chevron}>›</Text>
            </Pressable>
          </>
        )}

        {/* ── Upcoming Lessons Preview ─────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Upcoming Lessons</Text>
          <Pressable onPress={() => navigation.navigate('MyLessons')}>
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
            renderItem={({ item }) => (
              <View style={s.lessonCard}>
                <View style={s.lessonDateBadge}>
                  <Text style={s.lessonDateDay}>
                    {new Date(item.date).getDate()}
                  </Text>
                  <Text style={s.lessonDateMonth}>
                    {new Date(item.date).toLocaleString('en-GB', {
                      month: 'short',
                    })}
                  </Text>
                </View>
                <View style={s.lessonDetails}>
                  <Text style={s.lessonTime}>{item.time}</Text>
                  <Text style={s.lessonDuration}>{item.duration}</Text>
                  <Text style={s.lessonInstructor} numberOfLines={1}>
                    {item.instructorName}
                  </Text>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📅</Text>
            <Text style={s.emptyText}>No upcoming lessons</Text>
            <Text style={s.emptySubtext}>
              Book a lesson to get started
            </Text>
          </View>
        )}

        {/* ── Quick Actions ────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={s.actionsRow}>
          <Pressable
            style={s.actionCard}
            onPress={() => navigation.navigate('InstructorDiscovery')}>
            <View
              style={[s.actionIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={s.actionEmoji}>🔍</Text>
            </View>
            <Text style={s.actionLabel}>Find{'\n'}Instructor</Text>
          </Pressable>
          <Pressable
            style={s.actionCard}
            onPress={() => navigation.navigate('MyLessons')}>
            <View
              style={[
                s.actionIcon,
                { backgroundColor: theme.colors.successLight },
              ]}>
              <Text style={s.actionEmoji}>📋</Text>
            </View>
            <Text style={s.actionLabel}>View My{'\n'}Lessons</Text>
          </Pressable>
          <Pressable
            style={s.actionCard}
            onPress={() => navigation.navigate('StudentMessages')}>
            <View
              style={[
                s.actionIcon,
                { backgroundColor: theme.colors.warningLight },
              ]}>
              <Text style={s.actionEmoji}>💬</Text>
            </View>
            <Text style={s.actionLabel}>Messages</Text>
          </Pressable>
        </View>

        <View style={{ height: theme.spacing['2xl'] }} />
      </ScrollView>
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing['3xl'],
    },

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
      backgroundColor: theme.dark
        ? 'rgba(0,0,0,0.2)'
        : 'rgba(255,255,255,0.06)',
    },
    heroContent: {
      padding: theme.spacing.xl,
    },
    heroGreeting: {
      ...theme.typography.bodyMedium,
      color: 'rgba(255,255,255,0.8)',
    },
    heroName: {
      ...theme.typography.displayMedium,
      color: '#FFFFFF',
      marginTop: theme.spacing.xxs,
    },
    heroSubtitle: {
      ...theme.typography.bodyMedium,
      color: 'rgba(255,255,255,0.75)',
      marginTop: theme.spacing.xs,
    },

    // Section Headers
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    seeAll: {
      ...theme.typography.buttonSmall,
      color: theme.colors.primary,
    },

    // Hours Card
    hoursCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    hoursRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    hoursStat: {
      flex: 1,
      alignItems: 'center',
    },
    hoursNumber: {
      ...theme.typography.displayLarge,
      color: theme.colors.primary,
    },
    hoursUsed: {
      ...theme.typography.displayMedium,
      color: theme.colors.success,
    },
    hoursTotal: {
      ...theme.typography.displayMedium,
      color: theme.colors.textTertiary,
    },
    hoursLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xxs,
    },
    hoursDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.divider,
      marginHorizontal: theme.spacing.sm,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: theme.colors.neutral200,
      borderRadius: theme.borderRadius.full,
      marginTop: theme.spacing.md,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
    },
    progressText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },

    // Instructor Card
    instructorCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    instructorInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    instructorName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    instructorMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xxs,
    },
    instructorRating: {
      ...theme.typography.bodySmall,
      color: theme.colors.warning,
      fontWeight: '600',
    },
    instructorDot: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginHorizontal: theme.spacing.xxs,
    },
    instructorDetail: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    chevron: {
      fontSize: 24,
      color: theme.colors.textTertiary,
      marginLeft: theme.spacing.xs,
    },

    // Upcoming Lessons
    lessonList: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    lessonCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
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
    lessonDateDay: {
      ...theme.typography.h2,
      color: theme.colors.primary,
    },
    lessonDateMonth: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },
    lessonDetails: {
      gap: theme.spacing.xxs,
    },
    lessonTime: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    lessonDuration: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    lessonInstructor: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },

    // Quick Actions
    actionsRow: {
      flexDirection: 'row',
      marginHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
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
    actionEmoji: {
      fontSize: 22,
    },
    actionLabel: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      fontWeight: '600',
    },

    // Empty State
    emptyState: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing['2xl'],
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    emptyIcon: {
      fontSize: 36,
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    emptySubtext: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
  });

export default StudentDashboardScreen;