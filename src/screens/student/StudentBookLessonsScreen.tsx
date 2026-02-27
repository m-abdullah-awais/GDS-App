/**
 * GDS Driving School — StudentBookLessonsScreen
 * ================================================
 *
 * Progressive lesson-booking flow:
 *   Step 1 → Select / change instructor
 *   Step 2 → Choose one of that instructor's packages
 *   Step 3 → Pick date, time, duration, location, notes → confirm
 *
 * UI only — no backend integration.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import {
  bookingPackages,
  generateAvailableDates,
  instructors,
  timeSlots,
  type BookingDate,
  type BookingPackage,
  type Instructor,
  type TimeSlot,
} from '../../modules/student/mockData';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DURATIONS = [1, 1.5, 2];

// Only show instructors that are accepting students
const availableInstructors = instructors.filter(i => i.acceptingStudents);

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 52,
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

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({
  title,
  theme,
  style,
}: {
  title: string;
  theme: AppTheme;
  style?: object;
}) => (
  <Text
    style={[
      theme.typography.h3,
      { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
      style,
    ]}>
    {title}
  </Text>
);

// ─── Component ────────────────────────────────────────────────────────────────

const StudentBookLessonsScreen = () => {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  // ── State ─────────────────────────────────────────────
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showInstructorPicker, setShowInstructorPicker] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<BookingPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState<BookingDate | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [pickupLocation, setPickupLocation] = useState('SW1 Pick-up Point');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const dates = useMemo(() => generateAvailableDates(), []);

  const canBook = selectedInstructor && selectedPackage && selectedDate && selectedSlot;

  // ── Instructor change handler ─────────────────────────
  const handleSelectInstructor = useCallback((ins: Instructor) => {
    setSelectedInstructor(ins);
    setShowInstructorPicker(false);
    // Reset downstream selections
    setSelectedPackage(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setDuration(1);
    setNotes('');
  }, []);

  // ── Duration stepper ──────────────────────────────────
  const durationIdx = DURATIONS.indexOf(duration);
  const handleDurationMinus = useCallback(() => {
    if (durationIdx > 0) setDuration(DURATIONS[durationIdx - 1]);
  }, [durationIdx]);
  const handleDurationPlus = useCallback(() => {
    if (durationIdx < DURATIONS.length - 1) setDuration(DURATIONS[durationIdx + 1]);
  }, [durationIdx]);

  // ── Formatted summary values ──────────────────────────
  const formattedDate = selectedDate
    ? `${selectedDate.dayName}, ${selectedDate.dayNumber} ${selectedDate.monthShort}`
    : '—';

  const totalPrice = selectedPackage
    ? `£${selectedPackage.price}`
    : '—';

  // ── Handlers ──────────────────────────────────────────
  const handleConfirm = () => setShowSuccess(true);

  const handleDismiss = () => {
    setShowSuccess(false);
    // Full reset after success
    setSelectedInstructor(null);
    setSelectedPackage(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setDuration(1);
    setNotes('');
    // Navigate to My Lessons after purchase
    navigation.navigate('My Lessons');
  };

  // ── Render Helpers ────────────────────────────────────

  const renderInstructorPickerItem = useCallback(
    ({ item }: { item: Instructor }) => {
      const isSelected = selectedInstructor?.id === item.id;
      return (
        <Pressable
          onPress={() => handleSelectInstructor(item)}
          style={[s.pickerItem, isSelected && s.pickerItemActive]}>
          <Avatar initials={item.avatar} size={44} theme={theme} />
          <View style={s.pickerItemInfo}>
            <Text style={[s.pickerItemName, isSelected && s.pickerItemNameActive]}>
              {item.name}
            </Text>
            <View style={s.pickerItemMeta}>
              <Ionicons name="star" size={12} color={theme.colors.warning} />
              <Text style={s.pickerItemRating}>{item.rating}</Text>
              <View style={s.metaDot} />
              <Text style={s.pickerItemTransmission}>{item.transmissionType}</Text>
              <View style={s.metaDot} />
              <Text style={s.pickerItemPassRate}>{item.passRate}% pass</Text>
            </View>
            <Text style={s.pickerItemCoverage} numberOfLines={1}>
              {item.coveredPostcodes.join(', ')}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
          )}
        </Pressable>
      );
    },
    [selectedInstructor, s, theme, handleSelectInstructor],
  );

  const renderPackageCard = useCallback(
    ({ item }: { item: BookingPackage }) => {
      const isActive = selectedPackage?.id === item.id;
      return (
        <Pressable
          onPress={() => {
            setSelectedPackage(item);
            // Reset date/slot when changing package
            setSelectedDate(null);
            setSelectedSlot(null);
            setDuration(1);
          }}
          style={[s.packageCard, isActive && s.packageCardActive]}>
          {item.popular && (
            <View style={s.popularBadge}>
              <Text style={s.popularBadgeText}>Popular</Text>
            </View>
          )}
          <Text style={[s.packageTitle, isActive && s.packageTitleActive]}>
            {item.title}
          </Text>
          <Text style={[s.packageLessons, isActive && s.packageLessonsActive]}>
            {item.lessonCount} lesson{item.lessonCount > 1 ? 's' : ''}
          </Text>
          <Text style={[s.packageDuration, isActive && s.packageDurationActive]}>
            {item.durationPerLesson} each
          </Text>
          <Text style={[s.packagePrice, isActive && s.packagePriceActive]}>
            £{item.price}
          </Text>
          {isActive && (
            <View style={s.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            </View>
          )}
        </Pressable>
      );
    },
    [selectedPackage, s, theme],
  );

  const renderDateItem = useCallback(
    ({ item }: { item: BookingDate }) => {
      const isActive = selectedDate?.dayNumber === item.dayNumber && selectedDate?.monthShort === item.monthShort;
      const disabled = !item.available;
      return (
        <Pressable
          onPress={() => !disabled && setSelectedDate(item)}
          disabled={disabled}
          style={[
            s.dateItem,
            isActive && s.dateItemActive,
            disabled && s.dateItemDisabled,
          ]}>
          <Text
            style={[
              s.dateDayName,
              isActive && s.dateDayNameActive,
              disabled && s.dateTextDisabled,
            ]}>
            {item.dayName}
          </Text>
          <Text
            style={[
              s.dateNumber,
              isActive && s.dateNumberActive,
              disabled && s.dateTextDisabled,
            ]}>
            {item.dayNumber}
          </Text>
          <Text
            style={[
              s.dateMonth,
              isActive && s.dateMonthActive,
              disabled && s.dateTextDisabled,
            ]}>
            {item.monthShort}
          </Text>
        </Pressable>
      );
    },
    [selectedDate, s],
  );

  const renderTimeSlot = useCallback(
    ({ item }: { item: TimeSlot }) => {
      const isActive = selectedSlot?.id === item.id;
      const disabled = !item.available;
      return (
        <Pressable
          onPress={() => !disabled && setSelectedSlot(item)}
          disabled={disabled}
          style={[
            s.timeSlot,
            isActive && s.timeSlotActive,
            disabled && s.timeSlotDisabled,
          ]}>
          <Text
            style={[
              s.timeSlotTime,
              isActive && s.timeSlotTimeActive,
              disabled && s.timeSlotTimeDisabled,
            ]}>
            {item.startTime}
          </Text>
          <Text
            style={[
              s.timeSlotDuration,
              isActive && s.timeSlotDurationActive,
              disabled && s.timeSlotDurationDisabled,
            ]}>
            {item.duration}
          </Text>
          {item.available && !isActive && (
            <View style={s.availableDot} />
          )}
          {isActive && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.primary}
              style={{ marginTop: 4 }}
            />
          )}
        </Pressable>
      );
    },
    [selectedSlot, s, theme],
  );

  // ── Main Render ───────────────────────────────────────

  return (
    <ScreenContainer showHeader title="Book Lesson">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 1. Instructor Selection / Summary Card           ║
              ╚═══════════════════════════════════════════════════╝ */}
          {!selectedInstructor ? (
            /* ── No instructor selected — prompt user ── */
            <Pressable
              style={s.selectInstructorCard}
              onPress={() => setShowInstructorPicker(true)}>
              <View style={s.selectInstructorIcon}>
                <Ionicons name="person-add-outline" size={28} color={theme.colors.primary} />
              </View>
              <Text style={s.selectInstructorTitle}>Select an Instructor</Text>
              <Text style={s.selectInstructorHint}>
                Choose your instructor to see their packages and availability
              </Text>
              <View style={s.selectInstructorBtn}>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textInverse} />
                <Text style={s.selectInstructorBtnText}>Browse Instructors</Text>
              </View>
            </Pressable>
          ) : (
            /* ── Instructor selected — show summary card ── */
            <View style={s.card}>
              <View style={s.instructorRow}>
                <Avatar initials={selectedInstructor.avatar} size={56} theme={theme} />
                <View style={s.instructorInfo}>
                  <Text style={s.instructorName}>{selectedInstructor.name}</Text>
                  <View style={s.instructorMeta}>
                    <Ionicons name="star" size={14} color={theme.colors.warning} />
                    <Text style={s.instructorRating}>{selectedInstructor.rating}</Text>
                    <View style={s.metaDot} />
                    <View style={s.transmissionBadge}>
                      <Text style={s.transmissionText}>
                        {selectedInstructor.transmissionType}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.instructorCoverage} numberOfLines={1}>
                    <Ionicons name="location-outline" size={12} color={theme.colors.textTertiary} />
                    {'  '}
                    {selectedInstructor.coveredPostcodes.join(', ')}
                  </Text>
                </View>
              </View>
              <Pressable
                style={s.changeBtn}
                onPress={() => setShowInstructorPicker(true)}>
                <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.primary} />
                <Text style={s.changeBtnText}>Change Instructor</Text>
              </Pressable>
            </View>
          )}

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 2. Package Selection (visible after instructor)  ║
              ╚═══════════════════════════════════════════════════╝ */}
          {selectedInstructor && (
            <View style={s.section}>
              <SectionHeader title="Select Package" theme={theme} />
              <FlatList
                horizontal
                data={bookingPackages}
                keyExtractor={i => i.id}
                renderItem={renderPackageCard}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.horizontalList}
              />
            </View>
          )}

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 3. Date Selection (visible after package)        ║
              ╚═══════════════════════════════════════════════════╝ */}
          {selectedPackage && (
            <View style={s.section}>
              <SectionHeader title="Select Date" theme={theme} />
              <FlatList
                horizontal
                data={dates}
                keyExtractor={(_, i) => `date-${i}`}
                renderItem={renderDateItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.horizontalList}
              />
            </View>
          )}

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 4. Time Slot Selection (visible after package)   ║
              ╚═══════════════════════════════════════════════════╝ */}
          {selectedPackage && (
            <View style={s.section}>
              <SectionHeader title="Available Time Slots" theme={theme} />
              <FlatList
                data={timeSlots}
                keyExtractor={i => i.id}
                renderItem={renderTimeSlot}
                numColumns={2}
                columnWrapperStyle={s.timeGrid}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 5. Duration Selector (visible after package)     ║
              ╚═══════════════════════════════════════════════════╝ */}
          {selectedPackage?.customDuration && (
            <View style={s.section}>
              <SectionHeader title="Lesson Duration" theme={theme} />
              <View style={s.stepperCard}>
                <Pressable
                  onPress={handleDurationMinus}
                  disabled={durationIdx === 0}
                  style={[
                    s.stepperBtn,
                    durationIdx === 0 && s.stepperBtnDisabled,
                  ]}>
                  <Ionicons
                    name="remove"
                    size={22}
                    color={durationIdx === 0 ? theme.colors.disabledText : theme.colors.primary}
                  />
                </Pressable>
                <View style={s.stepperValue}>
                  <Text style={s.stepperNumber}>
                    {duration === 1.5 ? '1.5' : duration}
                  </Text>
                  <Text style={s.stepperUnit}>
                    {duration === 1 ? 'Hour' : 'Hours'}
                  </Text>
                </View>
                <Pressable
                  onPress={handleDurationPlus}
                  disabled={durationIdx === DURATIONS.length - 1}
                  style={[
                    s.stepperBtn,
                    durationIdx === DURATIONS.length - 1 && s.stepperBtnDisabled,
                  ]}>
                  <Ionicons
                    name="add"
                    size={22}
                    color={
                      durationIdx === DURATIONS.length - 1
                        ? theme.colors.disabledText
                        : theme.colors.primary
                    }
                  />
                </Pressable>
              </View>
            </View>
          )}

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 6. Pickup Location (visible after package)       ║
              ╚═══════════════════════════════════════════════════╝ */}
          {selectedPackage && (
            <View style={s.section}>
              <SectionHeader title="Pickup Location" theme={theme} />
              <View style={s.locationCard}>
                <Ionicons
                  name="navigate-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <TextInput
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                  style={s.locationInput}
                  placeholderTextColor={theme.colors.placeholder}
                  placeholder="Enter pickup address"
                />
              </View>
            </View>
          )}

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 7. Notes (visible after package)                 ║
              ╚═══════════════════════════════════════════════════╝ */}
          {selectedPackage && (
            <View style={s.section}>
              <SectionHeader title="Special Requests" theme={theme} />
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Any special requests or notes for your instructor…"
                placeholderTextColor={theme.colors.placeholder}
                style={s.notesInput}
              />
            </View>
          )}

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 8. Booking Summary Card (visible after package)  ║
              ╚═══════════════════════════════════════════════════╝ */}
          {selectedPackage && (
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>Booking Summary</Text>
              <View style={s.summaryDivider} />

              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Instructor</Text>
                <Text style={s.summaryValue}>{selectedInstructor?.name ?? '—'}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Package</Text>
                <Text style={s.summaryValue}>
                  {selectedPackage.title}
                </Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Date</Text>
                <Text style={s.summaryValue}>{formattedDate}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Time</Text>
                <Text style={s.summaryValue}>
                  {selectedSlot?.startTime ?? '—'}
                </Text>
              </View>
              {selectedPackage.customDuration && (
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Duration</Text>
                  <Text style={s.summaryValue}>
                    {duration} {duration === 1 ? 'hour' : 'hours'}
                  </Text>
                </View>
              )}

              <View style={[s.summaryDivider, { marginTop: theme.spacing.sm }]} />
              <View style={s.summaryRow}>
                <Text style={s.totalLabel}>Total Price</Text>
                <Text style={s.totalValue}>{totalPrice}</Text>
              </View>
            </View>
          )}

          {/* ╔═══════════════════════════════════════════════════╗
              ║ 9. Confirm Booking Button                        ║
              ╚═══════════════════════════════════════════════════╝ */}
          {selectedInstructor && (
            <View style={s.confirmSection}>
              <Button
                title="Buy Package"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canBook}
                onPress={handleConfirm}
              />
              {!canBook && (
                <Text style={s.hintText}>
                  {!selectedPackage
                    ? 'Select a package to continue'
                    : 'Select a date and time to continue'}
                </Text>
              )}
            </View>
          )}

          <View style={{ height: theme.spacing['3xl'] }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ═══ Instructor Picker Modal ════════════════════════════ */}
      <Modal
        visible={showInstructorPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInstructorPicker(false)}>
        <View style={s.pickerOverlay}>
          <View style={s.pickerCard}>
            {/* Header */}
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>Choose Instructor</Text>
              <Pressable
                onPress={() => setShowInstructorPicker(false)}
                hitSlop={12}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </Pressable>
            </View>
            <Text style={s.pickerSubtitle}>
              {availableInstructors.length} instructor{availableInstructors.length !== 1 ? 's' : ''} available
            </Text>

            {/* List */}
            <FlatList
              data={availableInstructors}
              keyExtractor={i => i.id}
              renderItem={renderInstructorPickerItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: theme.spacing.md }}
              ItemSeparatorComponent={() => (
                <View style={{ height: theme.spacing.xs }} />
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ═══ Payment Success Modal (Stripe-style) ═══════════════ */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {/* Stripe-style animated icon */}
            <View style={s.stripeIconOuter}>
              <View style={s.stripeIconInner}>
                <Ionicons name="checkmark" size={36} color={theme.colors.textInverse} />
              </View>
            </View>

            <Text style={s.modalTitle}>Payment Successful!</Text>
            <Text style={s.modalBody}>
              Your package has been purchased successfully.{' '}
              Your instructor will be notified shortly.
            </Text>

            {/* Receipt card */}
            <View style={s.receiptCard}>
              <View style={s.receiptHeader}>
                <Ionicons name="receipt-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={s.receiptLabel}>Payment Receipt</Text>
              </View>
              <View style={s.receiptDivider} />
              <ModalRow label="Instructor" value={selectedInstructor?.name ?? '—'} theme={theme} />
              <ModalRow label="Package" value={selectedPackage?.title ?? '—'} theme={theme} />
              <ModalRow label="Date" value={formattedDate} theme={theme} />
              <ModalRow label="Time" value={selectedSlot?.startTime ?? '—'} theme={theme} />
              <View style={s.receiptDivider} />
              <ModalRow label="Amount Paid" value={totalPrice} theme={theme} bold />
            </View>

            <Button
              title="View My Lessons"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleDismiss}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

// ─── Modal Row Helper ─────────────────────────────────────────────────────────

const ModalRow = ({
  label,
  value,
  theme,
  bold,
}: {
  label: string;
  value: string;
  theme: AppTheme;
  bold?: boolean;
}) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xxs,
    }}>
    <Text style={[theme.typography.bodySmall, { color: theme.colors.textTertiary }]}>
      {label}
    </Text>
    <Text
      style={[
        theme.typography.bodySmall,
        {
          color: bold ? theme.colors.primary : theme.colors.textPrimary,
          fontWeight: bold ? '700' : '600',
        },
      ]}>
      {value}
    </Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: theme.spacing['2xl'] },

    // ── Generic Section ──────────────────────────────────
    section: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    horizontalList: {
      paddingRight: theme.spacing.md,
    },

    // ── Card Base ────────────────────────────────────────
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.md,
    },

    // ── Select Instructor Prompt ─────────────────────────
    selectInstructorCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xl,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    selectInstructorIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    selectInstructorTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    selectInstructorHint: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    selectInstructorBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.full,
      gap: theme.spacing.xs,
    },
    selectInstructorBtnText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textInverse,
    },

    // ── 1. Instructor Card ───────────────────────────────
    instructorRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    instructorInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    instructorName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    instructorMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: theme.spacing.xxs,
    },
    instructorRating: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginLeft: 2,
    },
    metaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textTertiary,
    },
    transmissionBadge: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    transmissionText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    instructorCoverage: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 4,
    },
    changeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      gap: theme.spacing.xxs,
    },
    changeBtnText: {
      ...theme.typography.buttonSmall,
      color: theme.colors.primary,
    },

    // ── Instructor Picker Modal ──────────────────────────
    pickerOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    pickerCard: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing['2xl'],
      maxHeight: '80%',
      ...theme.shadows.lg,
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    pickerSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xxs,
      marginBottom: theme.spacing.md,
    },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    pickerItemActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    pickerItemInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    pickerItemName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    pickerItemNameActive: {
      color: theme.colors.primary,
    },
    pickerItemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: theme.spacing.xxs,
    },
    pickerItemRating: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginLeft: 2,
    },
    pickerItemTransmission: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    pickerItemPassRate: {
      ...theme.typography.caption,
      color: theme.colors.success,
      fontWeight: '600',
    },
    pickerItemCoverage: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },

    // ── 2. Package Cards ─────────────────────────────────
    packageCard: {
      width: 150,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginRight: theme.spacing.sm,
      marginTop: theme.spacing.xxs,
      marginBottom: theme.spacing.xxs,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    packageCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    popularBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    popularBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.textInverse,
      fontWeight: '700',
      fontSize: 9,
    },
    packageTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xxs,
    },
    packageTitleActive: {
      color: theme.colors.primary,
    },
    packageLessons: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    packageLessonsActive: {
      color: theme.colors.primary,
    },
    packageDuration: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    packageDurationActive: {
      color: theme.colors.primary,
    },
    packagePrice: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
    },
    packagePriceActive: {
      color: theme.colors.primary,
    },
    selectedIndicator: {
      position: 'absolute',
      bottom: theme.spacing.xs,
      right: theme.spacing.xs,
    },

    // ── 3. Date Items ────────────────────────────────────
    dateItem: {
      width: 62,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    dateItemActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    dateItemDisabled: {
      opacity: 0.4,
    },
    dateDayName: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
    },
    dateDayNameActive: {
      color: theme.colors.textInverse,
    },
    dateNumber: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginVertical: 2,
    },
    dateNumberActive: {
      color: theme.colors.textInverse,
    },
    dateMonth: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    dateMonthActive: {
      color: theme.colors.textInverse,
    },
    dateTextDisabled: {
      color: theme.colors.disabledText,
    },

    // ── 4. Time Slots ────────────────────────────────────
    timeGrid: {
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    timeSlot: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.xxs,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    timeSlotActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    timeSlotDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderColor: 'transparent',
      opacity: 0.5,
    },
    timeSlotTime: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    timeSlotTimeActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    timeSlotTimeDisabled: {
      color: theme.colors.disabledText,
    },
    timeSlotDuration: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    timeSlotDurationActive: {
      color: theme.colors.primary,
    },
    timeSlotDurationDisabled: {
      color: theme.colors.disabledText,
    },
    availableDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.success,
      marginTop: theme.spacing.xxs,
    },

    // ── 5. Duration Stepper ──────────────────────────────
    stepperCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    stepperBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    stepperBtnDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
    },
    stepperValue: {
      alignItems: 'center',
      marginHorizontal: theme.spacing['2xl'],
    },
    stepperNumber: {
      ...theme.typography.displayMedium,
      color: theme.colors.textPrimary,
    },
    stepperUnit: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },

    // ── 6. Location ──────────────────────────────────────
    locationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    locationInput: {
      flex: 1,
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      padding: 0,
    },

    // ── 7. Notes ─────────────────────────────────────────
    notesInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      minHeight: 90,
    },

    // ── 8. Booking Summary ───────────────────────────────
    summaryCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.md,
    },
    summaryTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    summaryDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xxs,
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
    totalLabel: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    totalValue: {
      ...theme.typography.h2,
      color: theme.colors.primary,
    },

    // ── 9. Confirm ───────────────────────────────────────
    confirmSection: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    hintText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },

    // ── Payment Success Modal (Stripe-style) ────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    modalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 380,
      alignItems: 'center',
      ...theme.shadows.lg,
    },
    stripeIconOuter: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.successLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    stripeIconInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTitle: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    modalBody: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    receiptCard: {
      width: '100%',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.xxs,
    },
    receiptHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      marginBottom: theme.spacing.xs,
    },
    receiptLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    receiptDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xs,
    },
  });

export default StudentBookLessonsScreen;