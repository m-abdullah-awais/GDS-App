/**
 * GDS Driving School — SlotSelector Component
 * ===============================================
 * 2-column grid of available time slots for booking.
 * Shows 30-min buffer indicators and slot availability.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { AvailableSlot } from '../../store/student/types';

interface SlotSelectorProps {
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
  loading?: boolean;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  loading = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <View key={i} style={styles.loadingSlot} />
          ))}
        </View>
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={32} color={theme.colors.textTertiary} />
        <Text style={styles.emptyText}>No available slots for this date</Text>
        <Text style={styles.emptySubtext}>Try selecting a different date</Text>
      </View>
    );
  }

  // Group slots into morning / afternoon / evening
  const grouped = useMemo(() => {
    const morning: AvailableSlot[] = [];
    const afternoon: AvailableSlot[] = [];
    const evening: AvailableSlot[] = [];

    slots.forEach(slot => {
      const hour = parseInt(slot.startTime.split(':')[0], 10);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [slots]);

  const renderSlotGroup = (
    title: string,
    icon: string,
    groupSlots: AvailableSlot[],
  ) => {
    if (groupSlots.length === 0) { return null; }
    return (
      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <Ionicons name={icon} size={16} color={theme.colors.textSecondary} />
          <Text style={styles.groupTitle}>{title}</Text>
        </View>
        <View style={styles.grid}>
          {groupSlots.map(slot => {
            const isSelected = selectedSlot?.id === slot.id;
            const isBooked = slot.booked;

            return (
              <Pressable
                key={slot.id}
                style={[
                  styles.slot,
                  isSelected && styles.slotSelected,
                  isBooked && styles.slotBooked,
                ]}
                onPress={() => !isBooked && onSelectSlot(slot)}
                disabled={isBooked}>
                <Text
                  style={[
                    styles.slotTime,
                    isSelected && styles.slotTimeSelected,
                    isBooked && styles.slotTimeBooked,
                  ]}>
                  {slot.startTime}
                </Text>
                <Text
                  style={[
                    styles.slotEndTime,
                    isSelected && styles.slotEndTimeSelected,
                    isBooked && styles.slotEndTimeBooked,
                  ]}>
                  {slot.endTime}
                </Text>
                {isBooked && (
                  <Ionicons
                    name="lock-closed"
                    size={10}
                    color={theme.colors.textTertiary}
                    style={styles.lockIcon}
                  />
                )}
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={theme.colors.textInverse}
                    style={styles.checkIcon}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSlotGroup('Morning', 'sunny-outline', grouped.morning)}
      {renderSlotGroup('Afternoon', 'partly-sunny-outline', grouped.afternoon)}
      {renderSlotGroup('Evening', 'moon-outline', grouped.evening)}

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.surfaceSecondary }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.spacing.xs,
    },
    group: {
      marginBottom: theme.spacing.md,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: theme.spacing.xs,
    },
    groupTitle: {
      ...theme.typography.bodySmall,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    slot: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 4,
    },
    slotSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...theme.shadows.sm,
    },
    slotBooked: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderColor: 'transparent',
      opacity: 0.6,
    },
    slotTime: {
      ...theme.typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    slotTimeSelected: {
      color: theme.colors.textInverse,
    },
    slotTimeBooked: {
      color: theme.colors.textTertiary,
      textDecorationLine: 'line-through',
    },
    slotEndTime: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    slotEndTimeSelected: {
      color: theme.colors.textInverse,
      opacity: 0.85,
    },
    slotEndTimeBooked: {
      color: theme.colors.textTertiary,
    },
    lockIcon: {
      marginLeft: 2,
    },
    checkIcon: {
      marginLeft: 4,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.lg,
      marginTop: theme.spacing.xs,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    emptySubtext: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
    loadingContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    loadingSlot: {
      width: '48%',
      height: 48,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
    },
  });

export default SlotSelector;
