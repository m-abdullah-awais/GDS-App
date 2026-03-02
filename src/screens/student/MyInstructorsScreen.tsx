/**
 * GDS Driving School — MyInstructorsScreen
 * ==========================================
 *
 * Shows accepted instructors only.  From here students can:
 *   - View / buy packages for each instructor
 *   - Book lessons for instructors with active packages
 *   - Navigate to chat
 *
 * Redux-connected.
 */

import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import Avatar from '../../components/Avatar';
import { getActivePackagesForInstructor, getRemainingLessons } from '../../services/packageService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { StudentInstructor, PurchasedPackage } from '../../store/student/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

const MyInstructorsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  // Redux ──────────────────────────────────────────────
  const myInstructors = useSelector((state: RootState) => state.student.myInstructors);
  const purchasedPackages = useSelector((state: RootState) => state.student.purchasedPackages);

  // Render ─────────────────────────────────────────────
  const renderInstructor = ({ item }: { item: StudentInstructor }) => {
    const activePkgs = getActivePackagesForInstructor(purchasedPackages, item.id);
    const totalRemaining = activePkgs.reduce((sum, p) => sum + getRemainingLessons(p), 0);

    return (
      <View style={s.card}>
        <Pressable
          style={s.cardHeader}
          onPress={() => navigation.navigate('InstructorProfile', { instructorId: item.id })}>
          <Avatar initials={item.avatar} size={52} />
          <View style={s.info}>
            <Text style={s.name}>{item.name}</Text>
            <View style={s.metaRow}>
              <Ionicons name="star" size={13} color={theme.colors.warning} />
              <Text style={s.rating}>{item.rating}</Text>
              <View style={s.dot} />
              <Ionicons name="location-outline" size={13} color={theme.colors.textTertiary} />
              <Text style={s.city}>{item.city}</Text>
            </View>
            <Text style={s.experience}>{item.experience}</Text>
          </View>
          <View style={s.connectedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
            <Text style={s.connectedText}>Connected</Text>
          </View>
        </Pressable>

        {/* Package summary */}
        {activePkgs.length > 0 ? (
          <View style={s.packageSummary}>
            <View style={s.summaryLeft}>
              <Text style={s.summaryLabel}>
                {activePkgs.length} active {activePkgs.length === 1 ? 'package' : 'packages'}
              </Text>
              <Text style={s.summaryValue}>
                {totalRemaining} {totalRemaining === 1 ? 'lesson' : 'lessons'} remaining
              </Text>
            </View>
            <Pressable
              style={[s.actionButton, { backgroundColor: theme.colors.success }]}
              onPress={() =>
                navigation.navigate('BookLesson', {
                  instructorId: item.id,
                  packageId: activePkgs[0].packageId,
                })
              }>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textInverse} />
              <Text style={[s.actionText, { color: theme.colors.textInverse }]}>Book Lesson</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.packageSummary}>
            <Text style={s.noPackageText}>No active packages</Text>
          </View>
        )}

        {/* Actions row */}
        <View style={s.actionsRow}>
          <Pressable
            style={[s.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() =>
              navigation.navigate('PackageListing', { instructorId: item.id })
            }>
            <Ionicons name="pricetag-outline" size={14} color={theme.colors.textInverse} />
            <Text style={[s.actionText, { color: theme.colors.textInverse }]}>View Packages</Text>
          </Pressable>

          <Pressable
            style={s.outlineButton}
            onPress={() =>
              navigation.navigate('InstructorProfile', { instructorId: item.id })
            }>
            <Ionicons name="person-outline" size={14} color={theme.colors.primary} />
            <Text style={[s.actionText, { color: theme.colors.primary }]}>Profile</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer showHeader title="My Instructors">
      <FlatList
        data={myInstructors}
        keyExtractor={item => item.id}
        renderItem={renderInstructor}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="people-outline" size={52} color={theme.colors.textTertiary} />
            <Text style={s.emptyTitle}>No instructors yet</Text>
            <Text style={s.emptySubtitle}>
              Search for instructors and send a connection request to get started
            </Text>
            <Pressable
              style={[s.actionButton, { backgroundColor: theme.colors.primary, marginTop: theme.spacing.md }]}
              onPress={() => navigation.navigate('InstructorDiscovery' as any)}>
              <Ionicons name="search-outline" size={16} color={theme.colors.textInverse} />
              <Text style={[s.actionText, { color: theme.colors.textInverse }]}>Search Instructors</Text>
            </Pressable>
          </View>
        }
        ListHeaderComponent={
          myInstructors.length > 0 ? (
            <Text style={s.headerCount}>
              {myInstructors.length} connected instructor{myInstructors.length !== 1 ? 's' : ''}
            </Text>
          ) : null
        }
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    listContent: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing['3xl'],
    },
    headerCount: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    info: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    name: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 3,
    },
    rating: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textTertiary,
    },
    city: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    experience: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    connectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.success + '14',
    },
    connectedText: {
      ...theme.typography.caption,
      color: theme.colors.success,
      fontWeight: '600',
    },
    packageSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    summaryLeft: {},
    summaryLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.primary,
      fontWeight: '600',
      marginTop: 2,
    },
    noPackageText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xs + 2,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: 5,
    },
    outlineButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xs + 2,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: 5,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    actionText: {
      ...theme.typography.buttonSmall,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing['3xl'],
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.md,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

export default MyInstructorsScreen;
