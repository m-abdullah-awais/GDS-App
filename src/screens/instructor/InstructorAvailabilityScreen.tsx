/**
 * InstructorAvailabilityScreen
 * ==============================
 * Set weekly availability with day/time slot selectors.
 * Features: Auto Generate Schedule (Mon-Fri, 9-5, 1hr lessons, 30min gaps)
 * Manual validation: no weekends, 30-min gap enforcement, overlap check.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_SET = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
const MIN_GAP_MINUTES = 30;

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

const InstructorAvailabilityScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([...initialSlots]);
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const filteredSlots = useMemo(
    () => slots.filter((s) => s.day === selectedDay),
    [slots, selectedDay],
  );

  /** Check if a new slot overlaps or violates the 30-min gap with existing slots for the same day */
  const validateSlot = useCallback(
    (day: string, startMins: number, endMins: number): string | null => {
      // Weekend check
      if (!WEEKDAY_SET.has(day)) {
        return 'Weekend slots are not allowed. Please select a weekday (Mon–Fri).';
      }
      // Time order check
      if (startMins >= endMins) {
        return 'End time must be after start time.';
      }

      const daySlots = slots
        .filter((s) => s.day === day)
        .map((s) => ({
          start: parseTime(s.startTime)!,
          end: parseTime(s.endTime)!,
        }))
        .filter((s) => s.start !== null && s.end !== null)
        .sort((a, b) => a.start - b.start);

      for (const existing of daySlots) {
        // Overlap check: new slot overlaps if it starts before existing ends AND ends after existing starts
        if (startMins < existing.end && endMins > existing.start) {
          return `Overlaps with existing slot ${formatTime(existing.start)} – ${formatTime(existing.end)}.`;
        }
        // Gap check: must have at least 30-min gap
        // New slot ends before existing starts — gap = existing.start - endMins
        if (endMins <= existing.start && existing.start - endMins < MIN_GAP_MINUTES) {
          return `Must have at least ${MIN_GAP_MINUTES}-minute gap before slot at ${formatTime(existing.start)}.`;
        }
        // New slot starts after existing ends — gap = startMins - existing.end
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

    const error = validateSlot(selectedDay, startMins, endMins);
    if (error) {
      setValidationError(error);
      return;
    }

    const newSlot: AvailabilitySlot = {
      id: `SLOT-${Date.now()}`,
      day: selectedDay,
      startTime: formatTime(startMins),
      endTime: formatTime(endMins),
    };
    setSlots((prev) => [...prev, newSlot]);
    setStartTime('');
    setEndTime('');
  };

  /** Auto Generate: Mon-Fri, 9:00-17:00, 1hr lessons, 30min gaps */
  const handleAutoGenerate = () => {
    const AUTO_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const AUTO_SLOTS = [
      { start: '09:00', end: '10:00' },
      { start: '10:30', end: '11:30' },
      { start: '12:00', end: '13:00' },
      { start: '13:30', end: '14:30' },
      { start: '15:00', end: '16:00' },
      { start: '16:30', end: '17:30' },
    ];

    const generated: AvailabilitySlot[] = [];
    let counter = Date.now();
    for (const day of AUTO_DAYS) {
      for (const slot of AUTO_SLOTS) {
        generated.push({
          id: `AUTO-${counter++}`,
          day,
          startTime: slot.start,
          endTime: slot.end,
        });
      }
    }

    Alert.alert(
      'Auto Generate Schedule',
      'This will replace all existing slots with a standard Mon–Fri schedule (9 AM – 5:30 PM, 1hr lessons, 30-min gaps). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            setSlots(generated);
            setSelectedDay('Mon');
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
    Alert.alert('Success', 'Availability saved successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
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
        <Text style={styles.slotDay}>{item.day}</Text>
      </View>
      <Pressable
        style={styles.removeButton}
        onPress={() => handleRemoveSlot(item.id)}
      >
        <Ionicons name="close-circle" size={24} color={theme.colors.error} />
      </Pressable>
    </View>
  );

  const isWeekend = !WEEKDAY_SET.has(selectedDay);

  return (
    <ScreenContainer
      showHeader
      title="Set Availability"
      onBackPress={() => navigation.goBack()}
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
            Mon–Fri, 9 AM – 5:30 PM, 1hr lessons, 30-min gaps
          </Text>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          {WEEKDAYS.map((day) => {
            const isSelected = selectedDay === day;
            const hasSlots = slots.some((s) => s.day === day);
            const isWE = !WEEKDAY_SET.has(day);
            return (
              <Pressable
                key={day}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : isWE
                        ? theme.colors.surfaceSecondary
                        : theme.colors.surface,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : isWE
                        ? theme.colors.neutral300
                        : theme.colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedDay(day);
                  setValidationError(null);
                }}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    {
                      color: isSelected
                        ? theme.colors.textInverse
                        : isWE
                          ? theme.colors.textTertiary
                          : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {day}
                </Text>
                {hasSlots && !isSelected && <View style={styles.dayDot} />}
              </Pressable>
            );
          })}
        </View>

        {/* Weekend Warning */}
        {isWeekend && (
          <View style={styles.weekendWarning}>
            <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
            <Text style={styles.weekendWarningText}>
              Weekend slots are not allowed
            </Text>
          </View>
        )}

        {/* Add Slot */}
        <View style={styles.addSlotSection}>
          <Text style={styles.sectionLabel}>Add Time Slot</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Start</Text>
              <TextInput
                value={startTime}
                onChangeText={(t) => {
                  setStartTime(t);
                  setValidationError(null);
                }}
                placeholder="09:00"
                placeholderTextColor={theme.colors.placeholder}
                style={[styles.input, validationError ? styles.inputError : null]}
                editable={!isWeekend}
              />
            </View>
            <Text style={styles.timeSeparator}>to</Text>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>End</Text>
              <TextInput
                value={endTime}
                onChangeText={(t) => {
                  setEndTime(t);
                  setValidationError(null);
                }}
                placeholder="10:00"
                placeholderTextColor={theme.colors.placeholder}
                style={[styles.input, validationError ? styles.inputError : null]}
                editable={!isWeekend}
              />
            </View>
          </View>

          {/* Validation Error */}
          {validationError && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          )}

          <Button
            title="Add Slot"
            onPress={handleAddSlot}
            variant="outline"
            size="md"
            fullWidth
            disabled={isWeekend}
            style={styles.addButton}
          />
        </View>

        {/* Slots List */}
        <View style={styles.slotsSection}>
          <Text style={styles.sectionLabel}>
            {selectedDay} Slots ({filteredSlots.length})
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
                  No slots added for {selectedDay}
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
    daySelector: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xxs,
      backgroundColor: theme.colors.background,
    },
    dayChip: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
    },
    dayChipText: {
      ...theme.typography.buttonSmall,
    },
    dayDot: {
      width: 5,
      height: 5,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
      marginTop: 3,
    },
    weekendWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.warningLight,
    },
    weekendWarningText: {
      ...theme.typography.bodySmall,
      color: theme.colors.warning,
      fontWeight: '600',
    },
    addSlotSection: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    sectionLabel: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
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
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
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
    slotDay: {
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
    },
    footer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      backgroundColor: theme.colors.background,
    },
  });

export default InstructorAvailabilityScreen;
