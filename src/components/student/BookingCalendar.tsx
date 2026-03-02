/**
 * GDS Driving School — BookingCalendar Component
 * =================================================
 * Horizontal 14-day date strip for booking slot selection.
 */

import React, { useMemo, useRef, useCallback } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

interface CalendarDay {
  date: string;          // YYYY-MM-DD
  dayName: string;       // Mon, Tue, ...
  dayNumber: number;     // 1-31
  monthShort: string;    // Jan, Feb, ...
  isToday: boolean;
  hasSlots: boolean;
}

interface BookingCalendarProps {
  dates: CalendarDay[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Generate 14 days of calendar data from today.
 */
export const generateCalendarDays = (slotsMap?: Record<string, boolean>): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    days.push({
      date: dateStr,
      dayName: DAY_NAMES[d.getDay()],
      dayNumber: d.getDate(),
      monthShort: MONTH_NAMES[d.getMonth()],
      isToday: i === 0,
      hasSlots: slotsMap ? !!slotsMap[dateStr] : d.getDay() !== 0,
    });
  }

  return days;
};

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  dates,
  selectedDate,
  onSelectDate,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const flatListRef = useRef<FlatList>(null);

  const renderDay = useCallback(
    ({ item }: { item: CalendarDay }) => {
      const isSelected = item.date === selectedDate;
      const disabled = !item.hasSlots;

      return (
        <Pressable
          style={[
            styles.dayItem,
            isSelected && styles.daySelected,
            disabled && styles.dayDisabled,
          ]}
          onPress={() => !disabled && onSelectDate(item.date)}
          disabled={disabled}>
          <Text
            style={[
              styles.dayName,
              isSelected && styles.dayNameSelected,
              disabled && styles.dayNameDisabled,
            ]}>
            {item.dayName}
          </Text>
          <Text
            style={[
              styles.dayNumber,
              isSelected && styles.dayNumberSelected,
              disabled && styles.dayNumberDisabled,
            ]}>
            {item.dayNumber}
          </Text>
          <Text
            style={[
              styles.monthShort,
              isSelected && styles.monthShortSelected,
              disabled && styles.dayNameDisabled,
            ]}>
            {item.monthShort}
          </Text>
          {item.isToday && !isSelected && <View style={styles.todayDot} />}
          {item.hasSlots && !isSelected && !disabled && (
            <View style={styles.slotsDot} />
          )}
        </Pressable>
      );
    },
    [selectedDate, onSelectDate, styles, theme],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dates}
        renderItem={renderDay}
        keyExtractor={item => item.date}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.spacing.sm,
    },
    listContent: {
      paddingHorizontal: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    dayItem: {
      width: 56,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    daySelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...theme.shadows.sm,
    },
    dayDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderColor: 'transparent',
      opacity: 0.5,
    },
    dayName: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginBottom: 4,
    },
    dayNameSelected: {
      color: theme.colors.textInverse,
    },
    dayNameDisabled: {
      color: theme.colors.textTertiary,
    },
    dayNumber: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    dayNumberSelected: {
      color: theme.colors.textInverse,
    },
    dayNumberDisabled: {
      color: theme.colors.textTertiary,
    },
    monthShort: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    monthShortSelected: {
      color: theme.colors.textInverse,
    },
    todayDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
    },
    slotsDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.success,
      marginTop: 4,
    },
  });

export default BookingCalendar;
