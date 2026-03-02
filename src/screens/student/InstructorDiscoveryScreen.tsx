/**
 * GDS Driving School — InstructorDiscoveryScreen (Search Instructors)
 * =====================================================================
 *
 * Step 1 of the booking lifecycle.
 * Search and filter instructors, view request status per instructor,
 * send connection requests.  Redux-connected.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { InstructorCard } from '../../components/student';
import {
  searchInstructors,
  getInstructorCities,
  sendInstructorRequest,
  getRequestStatus,
} from '../../services/instructorService';
import { getActivePackagesForInstructor } from '../../services/packageService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { InstructorRequestStatus } from '../../store/student/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

const InstructorDiscoveryScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  // Redux ─────────────────────────────────────────────────
  const instructors = useSelector((state: RootState) => state.student.instructors);
  const requests = useSelector((state: RootState) => state.student.requests);
  const purchasedPackages = useSelector((state: RootState) => state.student.purchasedPackages);

  // Local state ───────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempCity, setTempCity] = useState('All');
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Derived ───────────────────────────────────────────────
  const cities = useMemo(() => getInstructorCities(instructors), [instructors]);
  const cityOptions = useMemo(() => ['All', ...cities], [cities]);

  const filtered = useMemo(
    () =>
      searchInstructors(instructors, {
        query: searchQuery,
        city: cityFilter === 'All' ? undefined : cityFilter,
      }),
    [instructors, searchQuery, cityFilter],
  );

  const hasActiveFilters = cityFilter !== 'All';

  // Handlers ──────────────────────────────────────────────
  const openFilters = () => {
    setTempCity(cityFilter);
    setShowFilterModal(true);
  };
  const applyFilters = () => {
    setCityFilter(tempCity);
    setShowFilterModal(false);
  };

  const handleSendRequest = useCallback(
    async (instructorId: string) => {
      setSendingId(instructorId);
      await sendInstructorRequest(instructorId, dispatch);
      setSendingId(null);
    },
    [dispatch],
  );

  // Render ────────────────────────────────────────────────
  return (
    <ScreenContainer showHeader title="Search Instructors">
      {/* ── Search Bar + Filter ─────────────────────── */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color={theme.colors.placeholder} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[s.filterButton, hasActiveFilters && s.filterButtonActive]}
          onPress={openFilters}>
          <Ionicons
            name="options-outline"
            size={20}
            color={hasActiveFilters ? theme.colors.primary : theme.colors.textSecondary}
          />
          {hasActiveFilters && (
            <View style={s.filterDot} />
          )}
        </Pressable>
      </View>

      {/* Active filter tag */}
      {hasActiveFilters && (
        <View style={s.activeTagsRow}>
          <View style={s.activeTag}>
            <Text style={s.activeTagText}>{cityFilter}</Text>
            <Pressable onPress={() => setCityFilter('All')}>
              <Ionicons name="close" size={14} color={theme.colors.primary} />
            </Pressable>
          </View>
          <Pressable onPress={() => setCityFilter('All')}>
            <Text style={s.clearFiltersText}>Clear</Text>
          </Pressable>
        </View>
      )}

      {/* ── Filter Modal ────────────────────────────── */}
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
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Filter by City</Text>
              <Pressable onPress={() => setTempCity('All')}>
                <Text style={s.modalReset}>Reset</Text>
              </Pressable>
            </View>
            <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
              <View style={s.modalChipGrid}>
                {cityOptions.map(option => {
                  const isSelected = tempCity === option;
                  return (
                    <Pressable
                      key={option}
                      style={[s.modalChip, isSelected && s.modalChipSelected]}
                      onPress={() => setTempCity(option)}>
                      <Text style={[s.modalChipText, isSelected && s.modalChipTextSelected]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ height: theme.spacing.xl }} />
            </ScrollView>
            <View style={s.modalFooter}>
              <Button title="Apply" variant="primary" size="lg" fullWidth onPress={applyFilters} />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Results ─────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const reqStatus = getRequestStatus(requests, item.id) as
            | InstructorRequestStatus
            | 'none';
          const activeCount = getActivePackagesForInstructor(purchasedPackages, item.id).length;

          return (
            <View style={s.cardWrapper}>
              <InstructorCard
                instructor={item}
                requestStatus={reqStatus}
                onViewProfile={() =>
                  navigation.navigate('InstructorProfile', { instructorId: item.id })
                }
                onSendRequest={() => handleSendRequest(item.id)}
                onViewPackages={() =>
                  navigation.navigate('PackageListing', { instructorId: item.id })
                }
                activePackagesCount={activeCount}
                loading={sendingId === item.id}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="search-outline" size={52} color={theme.colors.textTertiary} />
            <Text style={s.emptyTitle}>No instructors found</Text>
            <Text style={s.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={s.resultCount}>
            {filtered.length} instructor{filtered.length !== 1 ? 's' : ''} found
          </Text>
        }
      />
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
    searchIcon: { marginRight: theme.spacing.xs },
    searchInput: {
      flex: 1,
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      padding: 0,
    },
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
    filterDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    activeTagsRow: {
      flexDirection: 'row',
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
    clearFiltersText: {
      ...theme.typography.bodySmall,
      color: theme.colors.error,
      fontWeight: '600',
      marginLeft: 'auto',
    },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius['2xl'],
      borderTopRightRadius: theme.borderRadius['2xl'],
      maxHeight: '60%',
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
    modalTitle: { ...theme.typography.h2, color: theme.colors.textPrimary },
    modalReset: {
      ...theme.typography.bodyMedium,
      color: theme.colors.error,
      fontWeight: '600',
    },
    modalBody: { paddingHorizontal: theme.spacing.lg },
    modalChipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
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
    modalChipTextSelected: { color: theme.colors.primary, fontWeight: '700' },
    modalFooter: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    cardWrapper: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
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
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing['3xl'],
    },
    emptyTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
  });

export default InstructorDiscoveryScreen;
