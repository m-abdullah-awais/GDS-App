/**
 * GDS Driving School — StudentBookLessonsScreen
 * ================================================
 *
 * Progressive lesson-booking flow:
 *   1. Select purchased package (pre-selected if navigated with packageId)
 *   2. Pick date on 14-day calendar strip
 *   3. Choose available time slot
 *   4. Confirm booking via modal
 *
 * Redux-connected. Uses shared BookingCalendar, SlotSelector,
 * and BookingConfirmModal components.
 *
 * Navigation params:
 *   - instructorId  (required)
 *   - packageId     (optional — pre-selects a package)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/types';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenContainer from '../../components/ScreenContainer';
import Avatar from '../../components/Avatar';
import {
  BookingCalendar,
  generateCalendarDays,
  SlotSelector,
  BookingConfirmModal,
} from '../../components/student';
import {
  fetchAvailableSlots,
  getSlotsForDate,
  validateBooking,
  createBooking,
} from '../../services/bookingService';
import type { AvailableSlot, PurchasedPackage } from '../../store/student/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Route = RouteProp<StudentStackParamList, 'BookLesson'>;

// ─── Component ────────────────────────────────────────────────────────────────

const StudentBookLessonsScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const instructorId = route.params?.instructorId ?? '';
  const preselectedPackageId = route.params?.packageId;

  // Defer heavy render until navigation animation completes
  const [screenReady, setScreenReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => setScreenReady(true));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ── Redux state ────────────────────────────────────────
  const instructors = useSelector((st: RootState) => st.student.instructors || []);
  const myInstructors = useSelector((st: RootState) => st.student.myInstructors || []);
  const purchasedPackages = useSelector((st: RootState) => st.student.purchasedPackages || []);
  const availableSlots = useSelector((st: RootState) => st.student.availableSlots || []);
  const lessons = useSelector((st: RootState) => st.student.lessons || []);
  const slotsLoading = useSelector((st: RootState) => st.student.slotsLoading);
  const bookingLoading = useSelector((st: RootState) => st.student.bookingLoading);

  const instructor = instructors.find(i => i.id === instructorId);
  const isAccepted = myInstructors.some(i => i.id === instructorId);

  // Active packages for this instructor
  const activePackages = useMemo(
    () =>
      purchasedPackages.filter(
        p =>
          p.instructorId === instructorId &&
          p.status === 'active' &&
          p.lessonsUsed < p.totalLessons,
      ),
    [purchasedPackages, instructorId],
  );

  // ── Local state ────────────────────────────────────────
  const [selectedPkg, setSelectedPkg] = useState<PurchasedPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Initialize ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    if (instructorId) {
      fetchAvailableSlots(instructorId, dispatch).catch((error) => {
        if (!cancelled && __DEV__) console.error('[BookLesson] Failed to load slots:', error);
      });
    }
    return () => { cancelled = true; };
  }, [instructorId, dispatch]);

  // Pre-select package if navigated with packageId
  useEffect(() => {
    if (preselectedPackageId && activePackages.length > 0) {
      const match = activePackages.find(p => p.packageId === preselectedPackageId);
      if (match) { setSelectedPkg(match); }
    } else if (activePackages.length === 1 && !selectedPkg) {
      setSelectedPkg(activePackages[0]);
    }
  }, [preselectedPackageId, activePackages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build calendar from available slots
  const slotsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    availableSlots
      .filter(slot => slot.instructorId === instructorId && !slot.booked)
      .forEach(slot => { map[slot.date] = true; });
    return map;
  }, [availableSlots, instructorId]);

  const calendarDays = useMemo(() => generateCalendarDays(slotsMap), [slotsMap]);

  // Slots for selected date
  const dateSlots = useMemo(
    () =>
      selectedDate
        ? getSlotsForDate(availableSlots, instructorId, selectedDate)
        : [],
    [availableSlots, instructorId, selectedDate],
  );

  // ── Handlers ───────────────────────────────────────────
  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setValidationError(null);
  }, []);

  const handleSelectSlot = useCallback(
    (slot: AvailableSlot) => {
      setSelectedSlot(slot);
      setValidationError(null);

      if (selectedPkg) {
        const result = validateBooking(slot, lessons, selectedPkg);
        if (!result.valid) {
          setValidationError(result.error ?? 'Cannot book this slot.');
        }
      }
    },
    [selectedPkg, lessons],
  );

  const handleOpenConfirm = useCallback(() => {
    if (!selectedSlot || !selectedPkg) { return; }

    const result = validateBooking(selectedSlot, lessons, selectedPkg);
    if (!result.valid) {
      setValidationError(result.error ?? 'Cannot book this slot.');
      return;
    }
    setShowConfirm(true);
  }, [selectedSlot, selectedPkg, lessons]);

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedSlot || !selectedPkg || !instructor || !instructorId) { return; }

    try {
      await createBooking(
        instructorId,
        instructor.name || '',
        instructor.avatar || '',
        selectedPkg.packageId,
        selectedPkg.packageName || '',
        selectedSlot,
        dispatch,
      );
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (error) {
      setShowConfirm(false);
      setValidationError('Booking failed. Please try again.');
      if (__DEV__) console.error('[BookLesson] Booking failed:', error);
    }
  }, [selectedSlot, selectedPkg, instructor, instructorId, dispatch]);

  const handleSuccessDismiss = useCallback(() => {
    setShowSuccess(false);
    navigation.navigate('My Lessons' as any);
  }, [navigation]);

  const remaining = selectedPkg
    ? selectedPkg.totalLessons - selectedPkg.lessonsUsed
    : 0;

  // Loading state during navigation animation — use plain View to avoid
  // ScreenContainer overhead during transition
  if (!screenReady) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ── Guard: not accepted ────────────────────────────────
  if (!isAccepted || !instructor) {
    return (
      <ScreenContainer showHeader title="Book Lesson">
        <View style={s.guardContainer}>
          <Ionicons name="lock-closed-outline" size={52} color={theme.colors.textTertiary} />
          <Text style={s.guardTitle}>Not Connected</Text>
          <Text style={s.guardSubtitle}>
            You need an accepted connection with this instructor to book lessons.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // ── Guard: no active packages ──────────────────────────
  if (activePackages.length === 0) {
    return (
      <ScreenContainer showHeader title="Book Lesson">
        <View style={s.guardContainer}>
          <Ionicons name="cube-outline" size={52} color={theme.colors.textTertiary} />
          <Text style={s.guardTitle}>No Active Packages</Text>
          <Text style={s.guardSubtitle}>
            Purchase a package from {instructor.name} to start booking lessons.
          </Text>
          <Pressable
            style={s.guardAction}
            onPress={() =>
              navigation.navigate('PackageListing', { instructorId })
            }>
            <Text style={s.guardActionText}>View Packages</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.textInverse} />
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // ── Success overlay ────────────────────────────────────
  if (showSuccess) {
    return (
      <ScreenContainer showHeader title="Book Lesson">
        <View style={s.successContainer}>
          <View style={s.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
          </View>
          <Text style={s.successTitle}>Lesson Booked!</Text>
          <Text style={s.successSubtitle}>
            Your lesson with {instructor.name} has been requested.
            You'll receive confirmation shortly.
          </Text>
          <Pressable style={s.successBtn} onPress={handleSuccessDismiss}>
            <Text style={s.successBtnText}>View My Lessons</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // ── Main render ────────────────────────────────────────
  return (
    <ScreenContainer showHeader title="Book Lesson">
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Instructor Header */}
        <View style={s.instructorHeader}>
          <Avatar initials={instructor.avatar} size={48} />
          <View style={s.instructorInfo}>
            <Text style={s.instructorName}>{instructor.name}</Text>
            <View style={s.instructorMeta}>
              <Ionicons name="star" size={14} color={theme.colors.warning} />
              <Text style={s.instructorRating}>{instructor.rating}</Text>
              <View style={s.dot} />
              <Text style={s.instructorCity}>{instructor.city}</Text>
            </View>
          </View>
        </View>

        {/* Step 1: Package Selection */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            <Ionicons name="cube-outline" size={16} color={theme.colors.primary} />
            {'  '}Select Package
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.packageStrip}>
            {activePackages.map(pkg => {
              const isSelected = selectedPkg?.id === pkg.id;
              const pkgRemaining = pkg.totalLessons - pkg.lessonsUsed;
              return (
                <Pressable
                  key={pkg.id}
                  style={[s.packageChip, isSelected && s.packageChipActive]}
                  onPress={() => {
                    setSelectedPkg(pkg);
                    setSelectedSlot(null);
                    setValidationError(null);
                  }}>
                  <Text
                    style={[s.packageChipTitle, isSelected && s.packageChipTitleActive]}
                    numberOfLines={1}>
                    {pkg.packageName}
                  </Text>
                  <Text
                    style={[
                      s.packageChipRemaining,
                      isSelected && s.packageChipRemainingActive,
                    ]}>
                    {pkgRemaining} lesson{pkgRemaining !== 1 ? 's' : ''} left
                  </Text>
                  {isSelected && (
                    <View style={s.packageChipCheck}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Step 2: Date Selection */}
        {selectedPkg && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
              {'  '}Pick a Date
            </Text>
            <BookingCalendar
              dates={calendarDays}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          </View>
        )}

        {/* Step 3: Time Slot Selection */}
        {selectedPkg && selectedDate && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
              {'  '}Choose a Time
            </Text>
            <SlotSelector
              slots={dateSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              loading={slotsLoading}
            />
          </View>
        )}

        {/* Validation error */}
        {validationError && (
          <View style={s.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
            <Text style={s.errorText}>{validationError}</Text>
          </View>
        )}

        {/* Confirm button */}
        {selectedPkg && selectedDate && selectedSlot && !validationError && (
          <Pressable style={s.confirmBtn} onPress={handleOpenConfirm}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.textInverse} />
            <Text style={s.confirmBtnText}>Confirm Booking</Text>
          </Pressable>
        )}

        {/* Booking summary */}
        {selectedPkg && (
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Booking Summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Package</Text>
              <Text style={s.summaryValue}>{selectedPkg.packageName}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Remaining</Text>
              <Text style={s.summaryValue}>
                {remaining} of {selectedPkg.totalLessons} lessons
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Duration</Text>
              <Text style={s.summaryValue}>{selectedPkg.duration}</Text>
            </View>
            {selectedDate && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Date</Text>
                <Text style={s.summaryValue}>{selectedDate}</Text>
              </View>
            )}
            {selectedSlot && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Time</Text>
                <Text style={s.summaryValue}>
                  {selectedSlot.startTime} – {selectedSlot.endTime}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <BookingConfirmModal
        visible={showConfirm}
        slot={selectedSlot}
        instructorName={instructor.name}
        purchasedPackage={selectedPkg}
        packageName={selectedPkg?.packageName ?? ''}
        onConfirm={handleConfirmBooking}
        onClose={() => setShowConfirm(false)}
        loading={bookingLoading}
        validationError={validationError}
      />
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
    },

    // Instructor header
    instructorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    },
    instructorInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    instructorName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    instructorMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xxs,
    },
    instructorRating: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginLeft: 4,
      fontWeight: '600',
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.xs,
    },
    instructorCity: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },

    // Sections
    section: {
      marginTop: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },

    // Package strip
    packageStrip: {
      paddingRight: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    packageChip: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      minWidth: 160,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    packageChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight ?? theme.colors.surface,
    },
    packageChipTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    packageChipTitleActive: {
      color: theme.colors.primary,
    },
    packageChipRemaining: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
    packageChipRemainingActive: {
      color: theme.colors.primary,
    },
    packageChipCheck: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
    },

    // Error banner
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.errorLight ?? '#FEE2E2',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    errorText: {
      ...theme.typography.bodySmall,
      color: theme.colors.error,
      flex: 1,
    },

    // Confirm button
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
      ...theme.shadows.md,
    },
    confirmBtnText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textInverse,
    },

    // Summary card
    summaryCard: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
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
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    summaryLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
    summaryValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },

    // Guard / empty states
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
    guardAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.xs,
      marginTop: theme.spacing.lg,
    },
    guardActionText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textInverse,
    },

    // Success
    successContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: theme.spacing['3xl'],
    },
    successIcon: {
      marginBottom: theme.spacing.md,
    },
    successTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    successSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
      lineHeight: 22,
    },
    successBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing['3xl'],
      marginTop: theme.spacing.xl,
    },
    successBtnText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textInverse,
    },
  });

export default StudentBookLessonsScreen;
