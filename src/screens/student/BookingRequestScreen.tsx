/**
 * GDS Driving School — BookingRequestScreen
 * ============================================
 *
 * Booking confirmation flow: instructor summary, package summary,
 * date/time selection, and submit with success modal.
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { instructors, packages } from '../../modules/student/mockData';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Route = RouteProp<StudentStackParamList, 'BookingRequest'>;

const AVAILABLE_DATES = [
  { label: 'Mon, 2 Mar', value: '2026-03-02' },
  { label: 'Wed, 4 Mar', value: '2026-03-04' },
  { label: 'Fri, 6 Mar', value: '2026-03-06' },
  { label: 'Mon, 9 Mar', value: '2026-03-09' },
  { label: 'Wed, 11 Mar', value: '2026-03-11' },
];

const AVAILABLE_TIMES = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
];

const DURATIONS = ['1 hour', '1.5 hours', '2 hours'];

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 44,
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

// ─── Component ────────────────────────────────────────────────────────────────

const BookingRequestScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  const instructor = instructors.find(i => i.id === route.params.instructorId);
  const selectedPackage = packages.find(p => p.id === route.params.packageId);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>(DURATIONS[2]);
  const [showSuccess, setShowSuccess] = useState(false);

  const canSubmit = selectedDate && selectedTime && selectedDuration;

  const handleSubmit = () => {
    setShowSuccess(true);
  };

  const handleDismissSuccess = () => {
    setShowSuccess(false);
    navigation.navigate('StudentTabs');
  };

  return (
    <ScreenContainer showHeader title="Book a Lesson">
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Instructor Summary ───────────────────────────── */}
        {instructor && (
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>Instructor</Text>
            <View style={s.instructorRow}>
              <Avatar
                initials={instructor.avatar}
                size={44}
                theme={theme}
              />
              <View style={s.instructorInfo}>
                <Text style={s.instructorName}>{instructor.name}</Text>
                <Text style={s.instructorMeta}>
                  ★ {instructor.rating} · {instructor.transmissionType}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Package Summary ──────────────────────────────── */}
        {selectedPackage && (
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>Selected Package</Text>
            <View style={s.packageRow}>
              <View style={s.packageInfo}>
                <Text style={s.packageTitle}>{selectedPackage.title}</Text>
                <Text style={s.packageMeta}>
                  {selectedPackage.lessonCount} lessons ·{' '}
                  {selectedPackage.description}
                </Text>
              </View>
              <Text style={s.packagePrice}>£{selectedPackage.finalPrice}</Text>
            </View>
          </View>
        )}

        {/* ── Date Picker ──────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Select Date</Text>
          <View style={s.optionGrid}>
            {AVAILABLE_DATES.map(date => (
              <Pressable
                key={date.value}
                style={[
                  s.optionChip,
                  selectedDate === date.value && s.optionChipActive,
                ]}
                onPress={() => setSelectedDate(date.value)}>
                <Text
                  style={[
                    s.optionChipText,
                    selectedDate === date.value && s.optionChipTextActive,
                  ]}>
                  {date.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Time Picker ──────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Select Time</Text>
          <View style={s.optionGrid}>
            {AVAILABLE_TIMES.map(time => (
              <Pressable
                key={time}
                style={[
                  s.optionChip,
                  selectedTime === time && s.optionChipActive,
                ]}
                onPress={() => setSelectedTime(time)}>
                <Text
                  style={[
                    s.optionChipText,
                    selectedTime === time && s.optionChipTextActive,
                  ]}>
                  {time}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Duration Selector ────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Duration</Text>
          <View style={s.durationRow}>
            {DURATIONS.map(dur => (
              <Pressable
                key={dur}
                style={[
                  s.durationChip,
                  selectedDuration === dur && s.durationChipActive,
                ]}
                onPress={() => setSelectedDuration(dur)}>
                <Text
                  style={[
                    s.durationChipText,
                    selectedDuration === dur && s.durationChipTextActive,
                  ]}>
                  {dur}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Submit Button ────────────────────────────────── */}
        <View style={s.submitSection}>
          <Button
            title="Submit Request"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSubmit}
            onPress={handleSubmit}
          />
          {!canSubmit && (
            <Text style={s.hintText}>
              Please select a date and time to continue
            </Text>
          )}
        </View>

        <View style={{ height: theme.spacing['2xl'] }} />
      </ScrollView>

      {/* ── Success Modal ──────────────────────────────────── */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={handleDismissSuccess}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalIconCircle}>
              <Text style={s.modalIcon}>✓</Text>
            </View>
            <Text style={s.modalTitle}>Request Submitted!</Text>
            <Text style={s.modalBody}>
              Your booking request has been sent to {instructor?.name}. You'll
              receive a confirmation once they accept your lesson.
            </Text>
            <View style={s.modalDetails}>
              <View style={s.modalDetailRow}>
                <Text style={s.modalDetailLabel}>Date</Text>
                <Text style={s.modalDetailValue}>
                  {AVAILABLE_DATES.find(d => d.value === selectedDate)?.label ??
                    '—'}
                </Text>
              </View>
              <View style={s.modalDetailRow}>
                <Text style={s.modalDetailLabel}>Time</Text>
                <Text style={s.modalDetailValue}>{selectedTime ?? '—'}</Text>
              </View>
              <View style={s.modalDetailRow}>
                <Text style={s.modalDetailLabel}>Duration</Text>
                <Text style={s.modalDetailValue}>{selectedDuration}</Text>
              </View>
            </View>
            <Button
              title="Back to Dashboard"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleDismissSuccess}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing['3xl'],
    },

    // Summary Cards
    summaryCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    summaryLabel: {
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.sm,
    },
    instructorRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    instructorInfo: {
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    instructorName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    instructorMeta: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    packageRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    packageInfo: {
      flex: 1,
    },
    packageTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    packageMeta: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    packagePrice: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
    },

    // Sections
    section: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },

    // Option Grid
    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    optionChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    optionChipActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    optionChipText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    optionChipTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Duration
    durationRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    durationChip: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    durationChipActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    durationChipText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    durationChipTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Submit
    submitSection: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing['2xl'],
    },
    hintText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
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
    modalIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.successLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    modalIcon: {
      fontSize: 28,
      color: theme.colors.success,
      fontWeight: '700',
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
      lineHeight: 22,
    },
    modalDetails: {
      width: '100%',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    modalDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalDetailLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
    modalDetailValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
  });

export default BookingRequestScreen;
