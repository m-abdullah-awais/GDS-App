/**
 * GDS Driving School — InstructorDiscoveryScreen
 * =================================================
 *
 * Browse and search for driving instructors with filtering.
 * Premium card-based list with search and filter row.
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { instructors, type Instructor } from '../../modules/student/mockData';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

type TransmissionFilter = 'All' | 'Manual' | 'Automatic' | 'Both';

const TRANSMISSION_OPTIONS: TransmissionFilter[] = [
  'All',
  'Manual',
  'Automatic',
  'Both',
];

const AREA_OPTIONS = ['All Areas', 'SW', 'E', 'N', 'SE', 'W'];

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

// ─── Instructor Card ──────────────────────────────────────────────────────────

const InstructorCard = ({
  instructor,
  theme,
  onViewProfile,
}: {
  instructor: Instructor;
  theme: AppTheme;
  onViewProfile: () => void;
}) => {
  const s = cardStyles(theme);

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Avatar initials={instructor.avatar} size={52} theme={theme} />
        <View style={s.cardInfo}>
          <Text style={s.cardName}>{instructor.name}</Text>
          <View style={s.ratingRow}>
            <Text style={s.ratingStar}>★</Text>
            <Text style={s.ratingText}>
              {instructor.rating} ({instructor.reviewCount} reviews)
            </Text>
          </View>
        </View>
        {instructor.acceptingStudents && (
          <View style={s.acceptingBadge}>
            <Text style={s.acceptingText}>Accepting</Text>
          </View>
        )}
      </View>

      <View style={s.cardDetails}>
        <View style={s.detailChip}>
          <Text style={s.detailChipText}>
            {instructor.transmissionType === 'Both'
              ? '⚙️ Manual & Auto'
              : instructor.transmissionType === 'Manual'
              ? '⚙️ Manual'
              : '⚙️ Automatic'}
          </Text>
        </View>
        <View style={s.detailChip}>
          <Text style={s.detailChipText}>
            📍 {instructor.coveredPostcodes.join(', ')}
          </Text>
        </View>
      </View>

      <View style={s.cardFooter}>
        <View style={s.statsRow}>
          <Text style={s.statText}>
            🎯 {instructor.passRate}% pass rate
          </Text>
          <Text style={s.statDot}>·</Text>
          <Text style={s.statText}>
            {instructor.yearsExperience} yrs exp
          </Text>
        </View>
        <Button
          title="View Profile"
          variant="primary"
          size="sm"
          onPress={onViewProfile}
        />
      </View>
    </View>
  );
};

const cardStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    cardName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xxs,
    },
    ratingStar: {
      fontSize: 14,
      color: theme.colors.warning,
      marginRight: theme.spacing.xxs,
    },
    ratingText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    acceptingBadge: {
      backgroundColor: theme.colors.successLight,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.sm,
    },
    acceptingText: {
      ...theme.typography.caption,
      color: theme.colors.success,
      fontWeight: '600',
    },
    cardDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    detailChip: {
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs + 2,
      borderRadius: theme.borderRadius.sm,
    },
    detailChipText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    statText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    statDot: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginHorizontal: theme.spacing.xxs,
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const InstructorDiscoveryScreen = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [transmissionFilter, setTransmissionFilter] =
    useState<TransmissionFilter>('All');
  const [areaFilter, setAreaFilter] = useState('All Areas');

  // Temp filter state for the modal
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempTransmission, setTempTransmission] =
    useState<TransmissionFilter>('All');
  const [tempArea, setTempArea] = useState('All Areas');

  const openFilters = () => {
    setTempTransmission(transmissionFilter);
    setTempArea(areaFilter);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setTransmissionFilter(tempTransmission);
    setAreaFilter(tempArea);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setTempTransmission('All');
    setTempArea('All Areas');
  };

  const hasActiveFilters =
    transmissionFilter !== 'All' || areaFilter !== 'All Areas';
  const activeFilterCount =
    (transmissionFilter !== 'All' ? 1 : 0) +
    (areaFilter !== 'All Areas' ? 1 : 0);

  const filtered = useMemo(() => {
    return instructors.filter(inst => {
      // Search
      if (
        searchQuery &&
        !inst.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Transmission
      if (
        transmissionFilter !== 'All' &&
        inst.transmissionType !== transmissionFilter &&
        inst.transmissionType !== 'Both'
      ) {
        return false;
      }
      // Area
      if (areaFilter !== 'All Areas') {
        const hasArea = inst.coveredPostcodes.some(p =>
          p.startsWith(areaFilter),
        );
        if (!hasArea) return false;
      }
      return true;
    });
  }, [searchQuery, transmissionFilter, areaFilter]);

  return (
    <ScreenContainer showHeader title="Find Instructor">
      {/* ── Search Bar + Filter Button ─────────────── */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search instructors..."
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Text style={s.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={[s.filterButton, hasActiveFilters && s.filterButtonActive]}
          onPress={openFilters}>
          <Text style={s.filterButtonIcon}>⚙️</Text>
          {activeFilterCount > 0 && (
            <View style={s.filterCountBadge}>
              <Text style={s.filterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <View style={s.activeTagsRow}>
          {transmissionFilter !== 'All' && (
            <View style={s.activeTag}>
              <Text style={s.activeTagText}>{transmissionFilter}</Text>
              <Pressable onPress={() => setTransmissionFilter('All')}>
                <Text style={s.activeTagClose}>✕</Text>
              </Pressable>
            </View>
          )}
          {areaFilter !== 'All Areas' && (
            <View style={s.activeTag}>
              <Text style={s.activeTagText}>{areaFilter}</Text>
              <Pressable onPress={() => setAreaFilter('All Areas')}>
                <Text style={s.activeTagClose}>✕</Text>
              </Pressable>
            </View>
          )}
          <Pressable
            style={s.clearFiltersButton}
            onPress={() => {
              setTransmissionFilter('All');
              setAreaFilter('All Areas');
            }}>
            <Text style={s.clearFiltersText}>Clear All</Text>
          </Pressable>
        </View>
      )}

      {/* ── Filter Modal ───────────────────────────────── */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={s.modalOverlay}>
          <Pressable
            style={s.modalBackdrop}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={s.modalContainer}>
            {/* Handle bar */}
            <View style={s.modalHandle} />

            {/* Header */}
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Filters</Text>
              <Pressable onPress={resetFilters}>
                <Text style={s.modalReset}>Reset</Text>
              </Pressable>
            </View>

            <ScrollView
              style={s.modalBody}
              showsVerticalScrollIndicator={false}>
              {/* Transmission */}
              <Text style={s.modalSectionTitle}>Transmission Type</Text>
              <View style={s.modalChipGrid}>
                {TRANSMISSION_OPTIONS.map(option => {
                  const isSelected = tempTransmission === option;
                  return (
                    <Pressable
                      key={option}
                      style={[
                        s.modalChip,
                        isSelected && s.modalChipSelected,
                      ]}
                      onPress={() => setTempTransmission(option)}>
                      <Text
                        style={[
                          s.modalChipText,
                          isSelected && s.modalChipTextSelected,
                        ]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Area */}
              <Text style={s.modalSectionTitle}>Area</Text>
              <View style={s.modalChipGrid}>
                {AREA_OPTIONS.map(option => {
                  const isSelected = tempArea === option;
                  return (
                    <Pressable
                      key={option}
                      style={[
                        s.modalChip,
                        isSelected && s.modalChipSelected,
                      ]}
                      onPress={() => setTempArea(option)}>
                      <Text
                        style={[
                          s.modalChipText,
                          isSelected && s.modalChipTextSelected,
                        ]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ height: theme.spacing.xl }} />
            </ScrollView>

            {/* Footer */}
            <View style={s.modalFooter}>
              <Button
                title="Apply Filters"
                variant="primary"
                size="lg"
                fullWidth
                onPress={applyFilters}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Results ────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <InstructorCard
            instructor={item}
            theme={theme}
            onViewProfile={() =>
              navigation.navigate('InstructorProfile', {
                instructorId: item.id,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyTitle}>No instructors found</Text>
            <Text style={s.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={s.resultCount}>
            {filtered.length} instructor{filtered.length !== 1 ? 's' : ''}{' '}
            found
          </Text>
        }
      />
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Search + Filter Row
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      height: 46,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    searchInput: {
      flex: 1,
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      padding: 0,
    },
    clearIcon: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      padding: theme.spacing.xxs,
    },

    // Filter Button
    filterButton: {
      width: 46,
      height: 46,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    filterButtonIcon: {
      fontSize: 18,
    },
    filterCountBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: theme.colors.primary,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    filterCountText: {
      ...theme.typography.caption,
      color: theme.colors.textInverse,
      fontWeight: '700',
      fontSize: 11,
    },
    clearFiltersButton: {
      paddingVertical: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.xs,
      marginLeft: 'auto',
    },
    clearFiltersText: {
      ...theme.typography.bodySmall,
      color: theme.colors.error,
      fontWeight: '600',
    },

    // Active Tags
    activeTagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    activeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.full,
      gap: 4,
    },
    activeTagText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    activeTagClose: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 10,
      padding: 4,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius['2xl'],
      borderTopRightRadius: theme.borderRadius['2xl'],
      maxHeight: '70%',
      ...theme.shadows.xl,
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.neutral300,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    modalTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    modalReset: {
      ...theme.typography.bodyMedium,
      color: theme.colors.error,
      fontWeight: '600',
    },
    modalBody: {
      paddingHorizontal: theme.spacing.lg,
    },
    modalSectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    modalChipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    modalChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    modalChipSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    modalChipText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    modalChipTextSelected: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    modalFooter: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },

    // List
    listContent: {
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing['3xl'],
    },
    resultCount: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },

    // Empty
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing['3xl'],
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
  });

export default InstructorDiscoveryScreen;
