/**
 * GDS Driving School — MyInstructorsScreen
 */

import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import Avatar from '../../components/Avatar';
import type { StudentInstructor, PurchasedPackage } from '../../store/student/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

const MyInstructorsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const myInstructors = useSelector((state: RootState) => state.student.myInstructors || []);
  const purchasedPackages = useSelector((state: RootState) => state.student.purchasedPackages || []);

  const renderItem = useCallback(({ item }: { item: StudentInstructor }) => {
    const activePkgs = (purchasedPackages || []).filter(
      (p: PurchasedPackage) => p.instructorId === item.id && p.status === 'active',
    );
    const totalRemaining = activePkgs.reduce(
      (sum: number, p: PurchasedPackage) => sum + Math.max(0, (p.totalLessons || 0) - (p.lessonsUsed || 0)), 0,
    );

    return (
      <View style={styles.card}>
        <Pressable
          style={styles.cardHeader}
          onPress={() => navigation.navigate('InstructorProfile', { instructorId: item.id })}>
          <Avatar initials={item.avatar || ''} name={item.name} size={48} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name || ''}</Text>
            <Text style={styles.meta}>
              {item.rating || 0} ★ · {item.city || ''}
            </Text>
          </View>
        </Pressable>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {activePkgs.length > 0
              ? `${activePkgs.length} active package${activePkgs.length !== 1 ? 's' : ''} · ${totalRemaining} lessons left`
              : 'No active packages'}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('PackageListing', { instructorId: item.id })}>
            <Text style={styles.btnText}>View Packages</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnOutline]}
            onPress={() => navigation.navigate('InstructorProfile', { instructorId: item.id })}>
            <Text style={[styles.btnText, { color: theme.colors.primary }]}>Profile</Text>
          </Pressable>
        </View>
      </View>
    );
  }, [purchasedPackages, styles, theme, navigation]);

  return (
    <ScreenContainer showHeader title="My Instructors">
      <FlatList
        data={myInstructors}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No instructors yet</Text>
            <Text style={styles.emptySubtitle}>
              Search for instructors and send a connection request
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    list: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
    meta: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    summary: {
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    summaryText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    btn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.borderRadius.md,
    },
    btnOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    btnText: {
      ...theme.typography.buttonSmall,
      color: '#fff',
    },
    empty: {
      alignItems: 'center',
      padding: theme.spacing['3xl'],
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
      textAlign: 'center',
    },
  });

export default MyInstructorsScreen;
