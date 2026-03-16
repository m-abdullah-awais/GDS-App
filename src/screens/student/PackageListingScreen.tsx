/**
 * GDS Driving School — PackageListingScreen
 * ============================================
 *
 * Lists available packages for an accepted instructor.
 * Redux-connected.  Guards: only accessible for accepted instructors.
 * Uses PackageCard + PaymentModal from shared student components.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { PackageCard, PaymentModal } from '../../components/student';
import {
  fetchInstructorPackages,
  buyPackage,
  isPackagePurchased,
} from '../../services/packageService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { InstructorPackage, PurchasedPackage } from '../../store/student/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Route = RouteProp<StudentStackParamList, 'PackageListing'>;

const PackageListingScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const instructorId = route.params.instructorId;

  // Redux ──────────────────────────────────────────────
  const instructors = useSelector((state: RootState) => state.student.instructors || []);
  const myInstructors = useSelector((state: RootState) => state.student.myInstructors || []);
  const packages = useSelector((state: RootState) => state.student.packages || {});
  const purchasedPackages = useSelector(
    (state: RootState) => state.student.purchasedPackages || [],
  );
  const loadingPackages = useSelector(
    (state: RootState) => state.student.packagesLoading,
  );

  const instructor = instructors.find(i => i.id === instructorId);
  const isAccepted = myInstructors.some(i => i.id === instructorId);
  const instructorPackages = packages[instructorId] ?? [];

  // Local state ────────────────────────────────────────
  const [paymentPkg, setPaymentPkg] = useState<InstructorPackage | null>(null);
  const [buyingLoading, setBuyingLoading] = useState(false);

  // Fetch packages on mount
  useEffect(() => {
    fetchInstructorPackages(instructorId, dispatch);
  }, [instructorId, dispatch]);

  // Find purchased record for a package
  const findPurchased = useCallback(
    (pkgId: string): PurchasedPackage | undefined =>
      purchasedPackages.find(
        p => p.packageId === pkgId && p.instructorId === instructorId,
      ),
    [purchasedPackages, instructorId],
  );

  // Handlers ───────────────────────────────────────────
  const handleBuy = useCallback(async () => {
    if (!paymentPkg) { return; }
    setBuyingLoading(true);
    await buyPackage(paymentPkg, dispatch);
    setBuyingLoading(false);
  }, [paymentPkg, dispatch]);

  const handleBookLesson = useCallback(
    (pkgId: string) => {
      navigation.navigate('BookLesson', {
        instructorId,
        packageId: pkgId,
      });
    },
    [navigation, instructorId],
  );

  // Guard: not accepted
  if (!isAccepted) {
    return (
      <ScreenContainer showHeader title="Packages">
        <View style={s.guardContainer}>
          <Ionicons name="lock-closed-outline" size={52} color={theme.colors.textTertiary} />
          <Text style={s.guardTitle}>Not Connected</Text>
          <Text style={s.guardSubtitle}>
            You need an accepted connection with this instructor before viewing their packages.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showHeader title="Packages">
      <FlatList
        data={instructorPackages}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          instructor ? (
            <View style={s.header}>
              <Text style={s.headerTitle}>
                Packages by {instructor.name}
              </Text>
              <Text style={s.headerSubtitle}>
                Choose the package that best fits your learning goals
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const purchased = findPurchased(item.id);
          return (
            <View style={s.cardWrapper}>
              <PackageCard
                pkg={item}
                purchased={purchased}
                onBuy={() => setPaymentPkg(item)}
                onBookLesson={() => handleBookLesson(item.id)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          loadingPackages ? (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={s.loadingText}>Loading packages...</Text>
            </View>
          ) : (
            <View style={s.emptyState}>
              <Ionicons name="cube-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={s.emptyTitle}>No packages available</Text>
              <Text style={s.emptySubtitle}>
                This instructor hasn't listed any packages yet
              </Text>
            </View>
          )
        }
      />

      {/* Payment Modal */}
      <PaymentModal
        visible={!!paymentPkg}
        pkg={paymentPkg}
        instructorName={instructor?.name ?? ''}
        onConfirm={handleBuy}
        onClose={() => setPaymentPkg(null)}
        loading={buyingLoading}
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    listContent: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
    },
    header: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    headerTitle: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    headerSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xxs,
    },
    cardWrapper: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: theme.spacing['3xl'],
    },
    loadingText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
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
    },
    guardContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: theme.spacing['3xl'],
    },
    guardTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.md,
    },
    guardSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

export default PackageListingScreen;
