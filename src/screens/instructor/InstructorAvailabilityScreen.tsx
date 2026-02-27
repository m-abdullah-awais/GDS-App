/**
 * InstructorAvailabilityScreen
 * ==============================
 * Set availability by selecting specific dates from a horizontal calendar strip.
 * Features: Date picker strip (next 60 days), Auto Generate Schedule,
 * Manual validation: no Sundays, 30-min gap enforcement, overlap check.
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  availabilitySlots as initialSlots,
  type AvailabilitySlot,
} from '../../modules/instructor/mockData';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Availability'>;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MIN_GAP_MINUTES = 30;
const CALENDAR_DAYS = 60; // show next 60 days

/** Generate array of date strings for the next N days starting from today */
const generateDateRange = (days: number): string[] => {
  const result: string[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push(toDateString(d));
  }
  return result;
};

/** Convert Date → "YYYY-MM-DD" */
const toDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Parse "YYYY-MM-DD" → Date */
const parseDateString = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Check if a date string falls on Sunday */
const isSunday = (dateStr: string): boolean => parseDateString(dateStr).getDay() === 0;

/** Get short day name from date string */
const getDayName = (dateStr: string): string => DAY_NAMES[parseDateString(dateStr).getDay()];

/** Get full day name from date string */
const getDayNameFull = (dateStr: string): string => DAY_NAMES_FULL[parseDateString(dateStr).getDay()];

/** Format date for display: "2 Mar" */
const formatDateShort = (dateStr: string): { day: number; month: string } => {
  const d = parseDateString(dateStr);
  return { day: d.getDate(), month: MONTH_NAMES[d.getMonth()] };
};

/** Format for slot card: "Mon, 2 Mar 2026" */
const formatDateLong = (dateStr: string): string => {
  const d = parseDateString(dateStr);
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

/** Parse "HH:MM" → total minutes from midnight */
const parseTime = (time: string): number | null => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
};

/** Format minutes back to "HH:MM" */
const formatTime = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const DATE_RANGE = generateDateRange(CALENDAR_DAYS);

const InstructorAvailabilityScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dateListRef = useRef<FlatList>(null);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([...initialSlots]);
  const [selectedDate, setSelectedDate] = useState(DATE_RANGE[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [slotDrawerVisible, setSlotDrawerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [pickerValue, setPickerValue] = useState<Date>(new Date());

  const selectedIsSunday = isSunday(selectedDate);

  /** Dates that have at least one slot */
  const datesWithSlots = useMemo(
    () => new Set(slots.map((s) => s.date)),
    [slots],
  );

  const filteredSlots = useMemo(
    () => slots.filter((s) => s.date === selectedDate),
    [slots, selectedDate],
  );

  /** Check if a new slot overlaps or violates the 30-min gap with existing slots for the same date */
  const validateSlot = useCallback(
    (date: string, startMins: number, endMins: number): string | null => {
      // Sunday check
      if (isSunday(date)) {
        return 'Sunday slots are not allowed. Please select another day.';
      }
      // Time order check
      if (startMins >= endMins) {
        return 'End time must be after start time.';
      }

      const dateSlots = slots
        .filter((s) => s.date === date)
        .map((s) => ({
          start: parseTime(s.startTime)!,
          end: parseTime(s.endTime)!,
        }))
        .filter((s) => s.start !== null && s.end !== null)
        .sort((a, b) => a.start - b.start);

      for (const existing of dateSlots) {
        if (startMins < existing.end && endMins > existing.start) {
          return `Overlaps with existing slot ${formatTime(existing.start)} – ${formatTime(existing.end)}.`;
        }
        if (endMins <= existing.start && existing.start - endMins < MIN_GAP_MINUTES) {
          return `Must have at least ${MIN_GAP_MINUTES}-minute gap before slot at ${formatTime(existing.start)}.`;
        }
        if (startMins >= existing.end && startMins - existing.end < MIN_GAP_MINUTES) {
          return `Must have at least ${MIN_GAP_MINUTES}-minute gap after slot ending at ${formatTime(existing.end)}.`;
        }
      }
      return null;
    },
    [slots],
  );

  const handleAddSlot = () => {
    setValidationError(null);

    if (!startTime.trim() || !endTime.trim()) {
      setValidationError('Please enter both start and end time.');
      return;
    }
    const startMins = parseTime(startTime);
    const endMins = parseTime(endTime);

    if (startMins === null || endMins === null) {
      setValidationError('Invalid time format. Use HH:MM (e.g. 09:00).');
      return;
    }

    const error = validateSlot(selectedDate, startMins, endMins);
    if (error) {
      setValidationError(error);
      return;
    }

    const newSlot: AvailabilitySlot = {
      id: `SLOT-${Date.now()}`,
      date: selectedDate,
      startTime: formatTime(startMins),
      endTime: formatTime(endMins),
    };
    setSlots((prev) => [...prev, newSlot]);
    setStartTime('');
    setEndTime('');
    setSlotDrawerVisible(false);
  };

  const openTimePicker = (target: 'start' | 'end') => {
    const source = target === 'start' ? startTime : endTime;
    const parsed = source ? parseTime(source) : null;
    const date = new Date();

    if (parsed !== null) {
      date.setHours(Math.floor(parsed / 60), parsed % 60, 0, 0);
    } else if (target === 'start') {
      date.setHours(9, 0, 0, 0);
    } else {
      date.setHours(10, 0, 0, 0);
    }

    setPickerValue(date);
    setPickerTarget(target);
  };

  const onChangeTime = (event: DateTimePickerEvent, selectedDateVal?: Date) => {
    if (event.type === 'dismissed') {
      setPickerTarget(null);
      return;
    }

    if (!selectedDateVal) return;

    const formatted = formatTime(selectedDateVal.getHours() * 60 + selectedDateVal.getMinutes());

    if (pickerTarget === 'start') {
      setStartTime(formatted);
    } else if (pickerTarget === 'end') {
      setEndTime(formatted);
    }

    setValidationError(null);

    if (Platform.OS === 'android') {
      setPickerTarget(null);
    }
  };

  /** Auto Generate: next 5 weekdays (excluding Sun), 9:00-17:30, 1hr lessons, 30min gaps */
  const handleAutoGenerate = () => {
    const AUTO_SLOTS = [
      { start: '09:00', end: '10:00' },
      { start: '10:30', end: '11:30' },
      { start: '12:00', end: '13:00' },
      { start: '13:30', end: '14:30' },
      { start: '15:00', end: '16:00' },
      { start: '16:30', end: '17:30' },
    ];

    // Pick next 5 non-Sunday dates starting from today
    const autoDates: string[] = [];
    const today = new Date();
    let offset = 0;
    while (autoDates.length < 5) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const ds = toDateString(d);
      if (!isSunday(ds)) {
        autoDates.push(ds);
      }
      offset++;
    }

    const generated: AvailabilitySlot[] = [];
    let counter = Date.now();
    for (const date of autoDates) {
      for (const slot of AUTO_SLOTS) {
        generated.push({
          id: `AUTO-${counter++}`,
          date,
          startTime: slot.start,
          endTime: slot.end,
        });
      }
    }

    Alert.alert(
      'Auto Generate Schedule',
      'This will replace all existing slots with a schedule for the next 5 days (excluding Sundays), 9 AM – 5:30 PM, 1hr lessons, 30-min gaps. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            setSlots(generated);
            if (autoDates.length > 0) {
              setSelectedDate(autoDates[0]);
            }
            setValidationError(null);
          },
        },
      ],
    );
  };

  const handleRemoveSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleSave = () => {
    Alert.alert('Success', 'Availability saved successfully!');
  };

  const renderSlotItem = ({ item }: { item: AvailabilitySlot }) => (
    <View style={styles.slotCard}>
      <View style={styles.slotInfo}>
        <View style={styles.slotTimeRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.slotTime}>
            {item.startTime} – {item.endTime}
          </Text>
        </View>
        <Text style={styles.slotDateLabel}>{formatDateLong(item.date)}</Text>
      </View>
      <Pressable
        style={styles.removeButton}
        onPress={() => handleRemoveSlot(item.id)}
      >
        <Ionicons name="close-circle" size={24} color={theme.colors.error} />
      </Pressable>
    </View>
  );

  const renderDateItem = ({ item: dateStr }: { item: string }) => {
    const isSelected = selectedDate === dateStr;
    const isSun = isSunday(dateStr);
    const hasSlots = datesWithSlots.has(dateStr);
    const { day, month } = formatDateShort(dateStr);
    const dayName = getDayName(dateStr);

    return (
      <Pressable
        style={[
          styles.dateChip,
          {
            backgroundColor: isSelected
              ? theme.colors.primary
              : isSun
                ? theme.colors.surfaceSecondary
                : theme.colors.surface,
            borderColor: isSelected
              ? theme.colors.primary
              : isSun
                ? theme.colors.neutral300
                : theme.colors.border,
          },
        ]}
        onPress={() => {
          setSelectedDate(dateStr);
          setValidationError(null);
        }}
      >
        <Text
          style={[
            styles.dateChipDay,
            {
              color: isSelected
                ? theme.colors.textInverse
                : isSun
                  ? theme.colors.textTertiary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          {dayName}
        </Text>
        <Text
          style={[
            styles.dateChipNumber,
            {
              color: isSelected
                ? theme.colors.textInverse
                : isSun
                  ? theme.colors.textTertiary
                  : theme.colors.textPrimary,
            },
          ]}
        >
          {day}
        </Text>
        <Text
          style={[
            styles.dateChipMonth,
            {
              color: isSelected
                ? 'rgba(255,255,255,0.7)'
                : isSun
                  ? theme.colors.textTertiary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          {month}
        </Text>
        {hasSlots && !isSelected && <View style={styles.dateDot} />}
      </Pressable>
    );
  };

  const selectedDayName = getDayNameFull(selectedDate);
  const { day: selectedDayNum, month: selectedMonth } = formatDateShort(selectedDate);

  return (
    <ScreenContainer
      showHeader
      title="Set Availability"
    >
      <View style={styles.container}>
        {/* Auto Generate */}
        <View style={styles.autoSection}>
          <Button
            title="Auto Generate Schedule"
            onPress={handleAutoGenerate}
            variant="secondary"
            size="md"
            fullWidth
          />
          <Text style={styles.autoHint}>
            Next 5 days (excl. Sunday), 9 AM – 5:30 PM, 1hr lessons, 30-min gaps
          </Text>
        </View>

        {/* Date Selector Strip */}
        <View style={styles.dateStripContainer}>
          <FlatList
            ref={dateListRef}
            data={DATE_RANGE}
            renderItem={renderDateItem}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStripContent}
          />
        </View>

        {/* Selected date info */}
        <View style={styles.selectedDateInfo}>
          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          <Text style={styles.selectedDateText}>
            {selectedDayName}, {selectedDayNum} {selectedMonth}
          </Text>
          {selectedIsSunday && (
            <View style={styles.sundayBadge}>
              <Text style={styles.sundayBadgeText}>Unavailable</Text>
            </View>
          )}
        </View>

        {/* Sunday Warning */}
        {selectedIsSunday && (
          <View style={styles.sundayWarning}>
            <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
            <Text style={styles.sundayWarningText}>
              Sunday slots are not allowed
            </Text>
          </View>
        )}

        {/* Add Slot Trigger */}
        <View style={styles.addSlotSection}>
          <View style={styles.addSlotHeaderRow}>
            <Text style={styles.sectionLabel}>Add Time Slot</Text>
            <Button
              title="Add"
              onPress={() => {
                setValidationError(null);
                setSlotDrawerVisible(true);
              }}
              variant="outline"
              size="sm"
              disabled={selectedIsSunday}
              leftIcon={<Ionicons name="add" size={16} color={theme.colors.primary} />}
            />
          </View>
          <Text style={styles.addSlotHint}>
            Tap Add to enter start/end time for this date.
          </Text>
        </View>

        {/* Slots List */}
        <View style={styles.slotsSection}>
          <Text style={styles.sectionLabel}>
            {getDayName(selectedDate)} {selectedDayNum} {selectedMonth} — Slots ({filteredSlots.length})
          </Text>
          <FlatList
            data={filteredSlots}
            renderItem={renderSlotItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.slotsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color={theme.colors.textTertiary} />
                <Text style={styles.emptyText}>
                  {selectedIsSunday
                    ? 'Scheduling is not available on Sundays'
                    : `No slots added for ${getDayName(selectedDate)}, ${selectedDayNum} ${selectedMonth}`}
                </Text>
              </View>
            }
          />
        </View>

        {/* Save */}
        <View style={styles.footer}>
          <Button
            title="Save Availability"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>

        {/* Bottom Drawer: Add Slot */}
        <Modal
          visible={slotDrawerVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setSlotDrawerVisible(false)}>
          <KeyboardAvoidingView
            style={styles.drawerOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.drawerSheet}>
              <View style={styles.drawerHeader}>
                <View style={styles.drawerTitleBlock}>
                  <Text style={styles.drawerTitle}>Add Slot</Text>
                  <Text style={styles.drawerSubtitle}>
                    {getDayNameFull(selectedDate)}, {selectedDayNum} {selectedMonth}
                  </Text>
                </View>
                <Pressable
                  style={styles.drawerCloseBtn}
                  onPress={() => setSlotDrawerVisible(false)}>
                  <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Start</Text>
                  <Pressable
                    onPress={() => !selectedIsSunday && openTimePicker('start')}
                    style={[styles.input, styles.pickerInput, validationError ? styles.inputError : null, selectedIsSunday && styles.inputDisabled]}>
                    <Text style={[styles.pickerValueText, !startTime && styles.pickerPlaceholder]}>
                      {startTime || 'Select start time'}
                    </Text>
                    <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
                  </Pressable>
                </View>
                <Text style={styles.timeSeparator}>to</Text>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>End</Text>
                  <Pressable
                    onPress={() => !selectedIsSunday && openTimePicker('end')}
                    style={[styles.input, styles.pickerInput, validationError ? styles.inputError : null, selectedIsSunday && styles.inputDisabled]}>
                    <Text style={[styles.pickerValueText, !endTime && styles.pickerPlaceholder]}>
                      {endTime || 'Select end time'}
                    </Text>
                    <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
                  </Pressable>
                </View>
              </View>

              {pickerTarget && (
                <View style={styles.inlinePickerWrap}>
                  <DateTimePicker
                    value={pickerValue}
                    mode="time"
                    is24Hour
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeTime}
                  />
                  {Platform.OS === 'ios' && (
                    <Button
                      title="Done"
                      size="sm"
                      variant="outline"
                      onPress={() => setPickerTarget(null)}
                      style={styles.pickerDoneBtn}
                    />
                  )}
                </View>
              )}

              {validationError && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              )}

              <Button
                title="Add Slot"
                onPress={handleAddSlot}
                variant="primary"
                size="md"
                fullWidth
                disabled={selectedIsSunday}
                style={styles.addButton}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    autoSection: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    autoHint: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },

    /* ── Date strip ─────────────────────────── */
    dateStripContainer: {
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.sm,
    },
    dateStripContent: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    dateChip: {
      width: 58,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
    },
    dateChipDay: {
      ...theme.typography.caption,
      fontWeight: '600',
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dateChipNumber: {
      ...theme.typography.h3,
      fontWeight: '700',
      marginTop: 2,
    },
    dateChipMonth: {
      ...theme.typography.caption,
      fontSize: 10,
      marginTop: 1,
    },
    dateDot: {
      width: 5,
      height: 5,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
    },

    /* ── Selected date info ─────────────────── */
    selectedDateInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    selectedDateText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      flex: 1,
    },
    sundayBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.errorLight,
    },
    sundayBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontWeight: '600',
      fontSize: 11,
    },

    /* ── Sunday warning ─────────────────────── */
    sundayWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.warningLight,
    },
    sundayWarningText: {
      ...theme.typography.bodySmall,
      color: theme.colors.warning,
      fontWeight: '600',
    },

    /* ── Add slot ───────────────────────────── */
    addSlotSection: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    addSlotHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    addSlotHint: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    sectionLabel: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },

    /* ── Time inputs ────────────────────────── */
    timeRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
    },
    timeInput: {
      flex: 1,
    },
    timeLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xxs,
    },
    timeSeparator: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      paddingBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 10,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
    },
    pickerInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pickerValueText: {
      ...theme.typography.input,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    pickerPlaceholder: {
      color: theme.colors.placeholder,
    },
    inputDisabled: {
      opacity: 0.6,
    },
    inlinePickerWrap: {
      marginTop: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceSecondary,
    },
    pickerDoneBtn: {
      margin: theme.spacing.sm,
      alignSelf: 'flex-end',
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    errorText: {
      ...theme.typography.bodySmall,
      color: theme.colors.error,
      flex: 1,
    },
    addButton: {
      marginTop: theme.spacing.sm,
    },

    /* ── Slots list ─────────────────────────── */
    slotsSection: {
      flex: 1,
      padding: theme.spacing.md,
    },
    slotsList: {
      gap: theme.spacing.xs,
    },
    slotCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    slotInfo: {
      flex: 1,
    },
    slotTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    slotTime: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    slotDateLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
      marginLeft: theme.spacing.xl + theme.spacing.xs,
    },
    removeButton: {
      padding: theme.spacing.xxs,
    },
    emptyState: {
      paddingVertical: theme.spacing['2xl'],
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    emptyText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.md,
    },

    /* ── Footer ─────────────────────────────── */
    footer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      backgroundColor: theme.colors.background,
    },

    /* ── Bottom drawer ──────────────────────── */
    drawerOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.overlay,
    },
    drawerSheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      ...theme.shadows.lg,
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    drawerTitleBlock: {
      flex: 1,
    },
    drawerTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    drawerSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    drawerCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
    },
  });

export default InstructorAvailabilityScreen;
