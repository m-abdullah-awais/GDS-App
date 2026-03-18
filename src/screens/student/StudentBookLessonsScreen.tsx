/**
 * GDS Driving School — StudentBookLessonsScreen
 * ================================================
 *
 * Progressive lesson-booking flow with clear step indicators:
 *   Step 1: Select instructor (if not pre-selected)
 *   Step 2: Select package
 *   Step 3: Pick date
 *   Step 4: Choose time slot
 *   → Confirm booking
 *
 * Navigation params:
 *   - instructorId  (optional — if omitted, shows instructor picker)
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
import { useNavigation, useRoute, useFocusEffect, type RouteProp } from '@react-navigation/native';
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
  PendingBookingBanner,
} from '../../components/student';
import {
  fetchAvailableSlots,
  getSlotsForDate,
  validateBooking,
  createBooking,
} from '../../services/bookingService';
import * as userService from '../../services/userService';
import * as assignmentService from '../../services/assignmentService';
import { mapUserToStudentInstructor, mapAssignmentToPurchasedPackage } from '../../utils/mappers';
import { setPurchasedPackages } from '../../store/student/actions';
import { firebaseAuth } from '../../config/firebase';
import type { AvailableSlot, PurchasedPackage, StudentInstructor } from '../../store/student/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Route = RouteProp<StudentStackParamList, 'BookLesson'>;

// ─── Step Indicator ──────────────────────────────────────────────────────────

const StepIndicator = ({
  currentStep,
  totalSteps,
  theme,
}: {
  currentStep: number;
  totalSteps: number;
  theme: AppTheme;
}) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  }}>
    {Array.from({ length: totalSteps }, (_, i) => {
      const step = i + 1;
      const isActive = step === currentStep;
      const isCompleted = step < currentStep;
      return (
        <React.Fragment key={step}>
          {i > 0 && (
            <View style={{
              flex: 1,
              height: 2,
              backgroundColor: isCompleted ? theme.colors.primary : theme.colors.border,
              borderRadius: 1,
            }} />
          )}
          <View style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: isCompleted
              ? theme.colors.primary
              : isActive
              ? theme.colors.primary
              : theme.colors.surface,
            borderWidth: isActive ? 0 : 1.5,
            borderColor: isCompleted ? theme.colors.primary : theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isCompleted ? (
              <Ionicons name="checkmark" size={16} color={theme.colors.textInverse} />
            ) : (
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: isActive ? theme.colors.textInverse : theme.colors.textTertiary,
              }}>
                {step}
              </Text>
            )}
          </View>
        </React.Fragment>
      );
    })}
  </View>
);

// ─── Section Header ──────────────────────────────────────────────────────────

const SectionHeader = ({
  icon,
  title,
  subtitle,
  theme,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  theme: AppTheme;
}) => (
  <View style={{ marginBottom: theme.spacing.sm }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: theme.colors.primaryLight ?? theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name={icon as any} size={18} color={theme.colors.primary} />
      </View>
      <Text style={{ ...theme.typography.h4, color: theme.colors.textPrimary }}>{title}</Text>
    </View>
    {subtitle && (
      <Text style={{
        ...theme.typography.bodySmall,
        color: theme.colors.textTertiary,
        marginTop: 4,
        marginLeft: 40,
      }}>
        {subtitle}
      </Text>
    )}
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

const StudentBookLessonsScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const paramInstructorId = route.params?.instructorId ?? '';
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
  const requests = useSelector((st: RootState) => st.student.requests || []);

  // ── Refresh purchased packages when screen gains focus ──
  // This ensures that after buying a package on PackageListingScreen,
  // the data is fresh when navigating back here.
  useFocusEffect(
    useCallback(() => {
      const studentId = firebaseAuth.currentUser?.uid;
      if (!studentId) return;
      let cancelled = false;
      (async () => {
        try {
          const assignments = await assignmentService.getStudentAssignments(studentId);
          if (!cancelled && assignments.length > 0) {
            const purchasedVMs = assignments.map(a => mapAssignmentToPurchasedPackage(a));
            dispatch(setPurchasedPackages(purchasedVMs));
          }
        } catch (err) {
          if (__DEV__) console.warn('[BookLesson] Failed to refresh packages on focus:', err);
        }
      })();
      return () => { cancelled = true; };
    }, [dispatch]),
  );

  // ── Instructor selection ──
  const [selectedInstructorId, setSelectedInstructorId] = useState(paramInstructorId);

  const connectedInstructors = useMemo(() => {
    const connected = new Map<string, StudentInstructor>();
    for (const inst of myInstructors) connected.set(inst.id, inst);
    for (const pkg of purchasedPackages) {
      if (pkg.instructorId && !connected.has(pkg.instructorId)) {
        const inst = instructors.find(i => i.id === pkg.instructorId);
        if (inst) connected.set(inst.id, inst);
      }
    }
    for (const req of requests) {
      if (req.status === 'accepted' && req.instructorId && !connected.has(req.instructorId)) {
        const inst = instructors.find(i => i.id === req.instructorId);
        if (inst) connected.set(inst.id, inst);
      }
    }
    return Array.from(connected.values());
  }, [myInstructors, purchasedPackages, requests, instructors]);

  useEffect(() => {
    if (paramInstructorId) {
      setSelectedInstructorId(paramInstructorId);
    } else if (connectedInstructors.length === 1 && !selectedInstructorId) {
      setSelectedInstructorId(connectedInstructors[0].id);
    }
  }, [paramInstructorId, connectedInstructors]); // eslint-disable-line react-hooks/exhaustive-deps

  const instructorId = selectedInstructorId;
  const instructorFromRedux = instructors.find(i => i.id === instructorId);

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

  // Connection check
  const isAccepted = myInstructors.some(i => i.id === instructorId);
  const hasAcceptedRequest = requests.some(
    r => r.instructorId === instructorId && r.status === 'accepted',
  );
  const hasPackages = purchasedPackages.some(p => p.instructorId === instructorId);
  const isConnected = isAccepted || hasAcceptedRequest || hasPackages;

  // Fetch instructor from Firestore if not in Redux store
  const [fetchedInstructor, setFetchedInstructor] = useState<StudentInstructor | null>(null);
  const [instructorLoading, setInstructorLoading] = useState(false);
  useEffect(() => {
    if (!instructorFromRedux && instructorId) {
      setInstructorLoading(true);
      userService.getUserById(instructorId).then(user => {
        if (user) setFetchedInstructor(mapUserToStudentInstructor(user));
      }).catch(() => {}).finally(() => setInstructorLoading(false));
    } else {
      setInstructorLoading(false);
      setFetchedInstructor(null);
    }
  }, [instructorFromRedux, instructorId]);

  const instructor = instructorFromRedux || fetchedInstructor;

  // ── Local state ────────────────────────────────────────
  const [selectedPkg, setSelectedPkg] = useState<PurchasedPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Fetch slots when instructor is selected ──
  useEffect(() => {
    let cancelled = false;
    if (instructorId) {
      fetchAvailableSlots(instructorId, dispatch).catch((error) => {
        if (!cancelled && __DEV__) console.error('[BookLesson] Failed to load slots:', error);
      });
    }
    return () => { cancelled = true; };
  }, [instructorId, dispatch]);

  // Reset booking state when instructor changes
  useEffect(() => {
    setSelectedPkg(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setValidationError(null);
    setShowSuccess(false);
  }, [instructorId]);

  // Pre-select package
  useEffect(() => {
    if (preselectedPackageId && activePackages.length > 0) {
      const match = activePackages.find(p => p.packageId === preselectedPackageId);
      if (match) setSelectedPkg(match);
    } else if (activePackages.length === 1 && !selectedPkg) {
      setSelectedPkg(activePackages[0]);
    }
  }, [preselectedPackageId, activePackages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build calendar
  const slotsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    availableSlots
      .filter(slot => slot.instructorId === instructorId && !slot.booked)
      .forEach(slot => { map[slot.date] = true; });
    return map;
  }, [availableSlots, instructorId]);

  const calendarDays = useMemo(() => generateCalendarDays(slotsMap), [slotsMap]);

  const dateSlots = useMemo(
    () => selectedDate ? getSlotsForDate(availableSlots, instructorId, selectedDate) : [],
    [availableSlots, instructorId, selectedDate],
  );

  // Compute current step for progress indicator
  const currentStep = useMemo(() => {
    if (!instructorId) return 1;
    if (!selectedPkg) return 2;
    if (!selectedDate) return 3;
    return 4;
  }, [instructorId, selectedPkg, selectedDate]);

  // ── Handlers ───────────────────────────────────────────
  const handleSelectInstructor = useCallback((id: string) => {
    setSelectedInstructorId(id);
  }, []);

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
        if (!result.valid) setValidationError(result.error ?? 'Cannot book this slot.');
      }
    },
    [selectedPkg, lessons],
  );

  const handleOpenConfirm = useCallback(() => {
    if (!selectedSlot || !selectedPkg) return;
    const result = validateBooking(selectedSlot, lessons, selectedPkg);
    if (!result.valid) {
      setValidationError(result.error ?? 'Cannot book this slot.');
      return;
    }
    setShowConfirm(true);
  }, [selectedSlot, selectedPkg, lessons]);

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedSlot || !selectedPkg || !instructor || !instructorId) return;
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

  const remaining = selectedPkg ? selectedPkg.totalLessons - selectedPkg.lessonsUsed : 0;

  // ── Loading ──
  if (!screenReady) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ── Guard: no connected instructors ──
  if (!paramInstructorId && connectedInstructors.length === 0) {
    return (
      <ScreenContainer showHeader title="Book Lesson">
        <View style={s.guardContainer}>
          <View style={s.guardIconCircle}>
            <Ionicons name="people-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text style={s.guardTitle}>No Instructors Yet</Text>
          <Text style={s.guardSubtitle}>
            Connect with an instructor and purchase a package to start booking lessons.
          </Text>
          <Pressable
            style={s.guardAction}
            onPress={() => navigation.navigate('InstructorDiscovery' as any)}>
            <Ionicons name="search-outline" size={18} color={theme.colors.textInverse} />
            <Text style={s.guardActionText}>Find Instructors</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // ── Instructor selector screen ──
  if (!paramInstructorId && !selectedInstructorId) {
    return (
      <ScreenContainer showHeader title="Book Lesson">
        <StepIndicator currentStep={1} totalSteps={4} theme={theme} />
        <ScrollView
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: theme.spacing['3xl'] }}
          showsVerticalScrollIndicator={false}>

          <PendingBookingBanner />

          <SectionHeader
            icon="person-outline"
            title="Choose Your Instructor"
            subtitle="Select who you'd like to book a lesson with"
            theme={theme}
          />

          {connectedInstructors.map(item => {
            const totalRemaining = purchasedPackages
              .filter(p => p.instructorId === item.id && p.status === 'active' && p.lessonsUsed < p.totalLessons)
              .reduce((sum, p) => sum + (p.totalLessons - p.lessonsUsed), 0);
            const hasActivePkgs = totalRemaining > 0;

            return (
              <Pressable
                key={item.id}
                style={s.instructorCard}
                onPress={() => handleSelectInstructor(item.id)}>
                <Avatar initials={item.name} imageUrl={item.avatar} size={50} />
                <View style={s.instructorCardInfo}>
                  <Text style={s.instructorCardName}>{item.name}</Text>
                  <View style={s.instructorMeta}>
                    {item.rating > 0 && (
                      <>
                        <Ionicons name="star" size={13} color={theme.colors.warning} />
                        <Text style={s.instructorRating}>{item.rating}</Text>
                        <View style={s.dot} />
                      </>
                    )}
                    <Text style={s.instructorCity}>{item.city || 'Instructor'}</Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                    gap: 4,
                  }}>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: hasActivePkgs ? theme.colors.success : theme.colors.textTertiary,
                    }} />
                    <Text style={{
                      ...theme.typography.caption,
                      color: hasActivePkgs ? theme.colors.success : theme.colors.textTertiary,
                      fontWeight: '600',
                    }}>
                      {hasActivePkgs ? `${totalRemaining}h remaining` : 'No active hours'}
                    </Text>
                  </View>
                </View>
                <View style={{
                  backgroundColor: theme.colors.primaryLight ?? theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  padding: 8,
                }}>
                  <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Loading instructor data
  if (instructorLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ── Guard: not connected (only for direct navigation) ──
  if (paramInstructorId && (!isConnected || !instructor)) {
    return (
      <ScreenContainer showHeader title="Book Lesson">
        <View style={s.guardContainer}>
          <View style={s.guardIconCircle}>
            <Ionicons name="lock-closed-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text style={s.guardTitle}>Not Connected</Text>
          <Text style={s.guardSubtitle}>
            You need an accepted connection with this instructor to book lessons.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!instructor) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textTertiary, marginTop: theme.spacing.md }}>
          Loading instructor...
        </Text>
      </View>
    );
  }

  // ── Guard: no active packages ──
  if (activePackages.length === 0) {
    return (
      <ScreenContainer showHeader title="Book Lesson">
        <View style={s.guardContainer}>
          <View style={s.guardIconCircle}>
            <Ionicons name="cube-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text style={s.guardTitle}>No Active Hours</Text>
          <Text style={s.guardSubtitle}>
            Purchase a package from {instructor.name} to start booking lessons.
          </Text>
          <Pressable
            style={s.guardAction}
            onPress={() => navigation.navigate('PackageListing', { instructorId })}>
            <Ionicons name="cart-outline" size={18} color={theme.colors.textInverse} />
            <Text style={s.guardActionText}>View Packages</Text>
          </Pressable>
          {!paramInstructorId && connectedInstructors.length > 1 && (
            <Pressable
              style={s.guardSecondaryAction}
              onPress={() => setSelectedInstructorId('')}>
              <Ionicons name="arrow-back" size={16} color={theme.colors.textSecondary} />
              <Text style={s.guardSecondaryText}>Choose Different Instructor</Text>
            </Pressable>
          )}
        </View>
      </ScreenContainer>
    );
  }

  // ── Success overlay ──
  if (showSuccess) {
    return (
      <ScreenContainer showHeader title="Book Lesson">
        <View style={s.successContainer}>
          <View style={s.successIconCircle}>
            <Ionicons name="checkmark" size={48} color={theme.colors.textInverse} />
          </View>
          <Text style={s.successTitle}>Lesson Requested!</Text>
          <Text style={s.successSubtitle}>
            Your lesson with {instructor.name} has been submitted.{'\n'}
            You'll receive confirmation shortly.
          </Text>
          <Pressable style={s.guardAction} onPress={handleSuccessDismiss}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textInverse} />
            <Text style={s.guardActionText}>View My Lessons</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // ── Main booking flow ──
  return (
    <ScreenContainer showHeader title="Book Lesson">
      <StepIndicator currentStep={currentStep} totalSteps={4} theme={theme} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Pending requests banner */}
        <PendingBookingBanner />

        {/* Instructor Header */}
        <View style={s.instructorHeader}>
          <Avatar initials={instructor.name} imageUrl={instructor.avatar} size={44} />
          <View style={s.instructorInfo}>
            <Text style={s.instructorName}>{instructor.name}</Text>
            <View style={s.instructorMeta}>
              {instructor.rating > 0 && (
                <>
                  <Ionicons name="star" size={13} color={theme.colors.warning} />
                  <Text style={s.instructorRating}>{instructor.rating}</Text>
                  <View style={s.dot} />
                </>
              )}
              <Text style={s.instructorCity}>{instructor.city}</Text>
            </View>
          </View>
          {!paramInstructorId && connectedInstructors.length > 1 && (
            <Pressable
              style={s.changeBtn}
              onPress={() => setSelectedInstructorId('')}>
              <Ionicons name="swap-horizontal" size={18} color={theme.colors.primary} />
              <Text style={{ ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' }}>
                Change
              </Text>
            </Pressable>
          )}
        </View>

        {/* Step 2: Package Selection */}
        <View style={s.section}>
          <SectionHeader
            icon="cube-outline"
            title="Select Package"
            subtitle={activePackages.length > 1 ? 'Choose which package to use for this lesson' : undefined}
            theme={theme}
          />
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
                  {isSelected && (
                    <View style={s.packageChipCheck}>
                      <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                    </View>
                  )}
                  <Text
                    style={[s.packageChipTitle, isSelected && s.packageChipTitleActive]}
                    numberOfLines={1}>
                    {pkg.packageName}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 6,
                    gap: 4,
                  }}>
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color={isSelected ? theme.colors.primary : theme.colors.textTertiary}
                    />
                    <Text style={[s.packageChipRemaining, isSelected && s.packageChipRemainingActive]}>
                      {pkgRemaining}h remaining
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Step 3: Date Selection */}
        {selectedPkg && (
          <View style={s.section}>
            <SectionHeader icon="calendar-outline" title="Pick a Date" theme={theme} />
            <BookingCalendar
              dates={calendarDays}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          </View>
        )}

        {/* Step 4: Time Slot Selection */}
        {selectedPkg && selectedDate && (
          <View style={s.section}>
            <SectionHeader
              icon="time-outline"
              title="Choose a Time"
              subtitle={dateSlots.length > 0 ? `${dateSlots.length} slot${dateSlots.length !== 1 ? 's' : ''} available` : undefined}
              theme={theme}
            />
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

        {/* Booking summary + confirm */}
        {selectedPkg && selectedDate && selectedSlot && (
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Booking Summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Instructor</Text>
              <Text style={s.summaryValue}>{instructor.name}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Package</Text>
              <Text style={s.summaryValue}>{selectedPkg.packageName}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Hours Left</Text>
              <Text style={s.summaryValue}>{remaining}h</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Date</Text>
              <Text style={s.summaryValue}>{selectedDate}</Text>
            </View>
            <View style={[s.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={s.summaryLabel}>Time</Text>
              <Text style={s.summaryValue}>
                {selectedSlot.startTime} – {selectedSlot.endTime}
              </Text>
            </View>

            {!validationError && (
              <Pressable style={s.confirmBtn} onPress={handleOpenConfirm}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.textInverse} />
                <Text style={s.confirmBtnText}>Confirm Booking</Text>
              </Pressable>
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
      paddingTop: theme.spacing.xs,
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
      marginLeft: theme.spacing.sm,
    },
    instructorName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    instructorMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    instructorRating: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginLeft: 3,
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
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    changeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primaryLight ?? theme.colors.surface,
    },

    // Instructor selector card
    instructorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    instructorCardInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    instructorCardName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },

    // Sections
    section: {
      marginTop: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
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
      paddingTop: theme.spacing.lg,
      minWidth: 170,
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

    // Summary + confirm
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
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
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

    // Guard / empty states
    guardContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: theme.spacing['3xl'],
    },
    guardIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primaryLight ?? theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    guardTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.xs,
    },
    guardSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
      lineHeight: 22,
    },
    guardAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.xs,
      marginTop: theme.spacing.lg,
    },
    guardActionText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textInverse,
    },
    guardSecondaryAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    guardSecondaryText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },

    // Success
    successContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: theme.spacing['3xl'],
    },
    successIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
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
  });

export default StudentBookLessonsScreen;
