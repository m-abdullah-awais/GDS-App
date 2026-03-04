/**
 * InstructorAreasScreen
 * ======================
 * Web-parity area configuration for instructor:
 * - full city/postcode catalog
 * - active-area gating from systemSettings/areaSettings
 * - postcode search + select all/clear all
 * - save to users.postcodesCovered
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';
import { useConfirmation } from '../../components/common';
import { useSelector } from 'react-redux';
import { getAreaSettings } from '../../services/adminService';
import { getUserById, updateUserProfile } from '../../services/userService';
import { CITY_POSTCODES } from '../../constants/cityPostcodes';

type Props = NativeStackScreenProps<InstructorStackParamList, 'Areas'>;
type CityName = keyof typeof CITY_POSTCODES;

const ALL_CITIES = Object.keys(CITY_POSTCODES) as CityName[];

const toActiveAreaMap = (input: unknown): Record<string, boolean> => {
  if (Array.isArray(input)) {
    return input.reduce<Record<string, boolean>>((acc, city) => {
      if (typeof city === 'string') {
        acc[city] = true;
      }
      return acc;
    }, {});
  }

  if (input && typeof input === 'object') {
    return Object.entries(input as Record<string, unknown>).reduce<Record<string, boolean>>((acc, [city, enabled]) => {
      acc[city] = Boolean(enabled);
      return acc;
    }, {});
  }

  return {};
};

const normalizePostcodes = (values: unknown): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .filter((value): value is string => typeof value === 'string')
    .map((postcode) => postcode.trim().toUpperCase())
    .filter(Boolean);
};

const InstructorAreasScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { notify } = useConfirmation();
  const authProfile = useSelector((state: any) => state.auth.profile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityName>(ALL_CITIES[0]);
  const [selectedPostcodes, setSelectedPostcodes] = useState<string[]>([]);
  const [activeAreas, setActiveAreas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!authProfile?.uid) {
        setLoading(false);
        return;
      }

      try {
        const [settings, userDoc] = await Promise.all([
          getAreaSettings(),
          getUserById(authProfile.uid),
        ]);

        setActiveAreas(toActiveAreaMap((settings as any)?.activeAreas));

        const existingPostcodes = normalizePostcodes((userDoc as any)?.postcodesCovered);
        if (existingPostcodes.length > 0) {
          setSelectedPostcodes(existingPostcodes);

          const matchingCity = ALL_CITIES.find((city) =>
            existingPostcodes.some((postcode) => CITY_POSTCODES[city].includes(postcode)),
          );

          if (matchingCity) {
            setSelectedCity(matchingCity);
          }
        }
      } catch (_error) {
        await notify({
          title: 'Error',
          message: 'Failed to load existing areas.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authProfile?.uid, notify]);

  const availablePostcodes = CITY_POSTCODES[selectedCity] || [];
  const filteredPostcodes = useMemo(
    () => availablePostcodes.filter((postcode) => postcode.toLowerCase().includes(searchTerm.toLowerCase())),
    [availablePostcodes, searchTerm],
  );

  const isCurrentCityActive = Boolean(activeAreas[selectedCity]);

  const handleCityChange = (city: CityName) => {
    setSelectedCity(city);
    setSelectedPostcodes([]);
    setSearchTerm('');
  };

  const togglePostcode = (postcode: string) => {
    setSelectedPostcodes((prev) =>
      prev.includes(postcode)
        ? prev.filter((code) => code !== postcode)
        : [...prev, postcode],
    );
  };

  const selectAllPostcodes = () => {
    setSelectedPostcodes(filteredPostcodes);
  };

  const clearAllPostcodes = () => {
    setSelectedPostcodes([]);
  };

  const handleSave = async () => {
    if (!authProfile?.uid) {
      await notify({
        title: 'Error',
        message: 'User not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile(authProfile.uid, {
        postcodesCovered: selectedPostcodes,
      } as any);

      await notify({
        title: 'Success',
        message: 'Areas updated!',
        variant: 'success',
      });
    } catch (_error) {
      await notify({
        title: 'Error',
        message: 'Failed to update areas.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer showHeader title="Configure Areas" onBackPress={() => navigation.goBack()}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your areas...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showHeader title="Configure Areas" onBackPress={() => navigation.goBack()}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Your City</Text>
          <View style={styles.cityList}>
            {ALL_CITIES.map((city) => {
              const isSelected = city === selectedCity;
              const isActive = Boolean(activeAreas[city]);

              return (
                <Pressable
                  key={city}
                  disabled={!isActive}
                  onPress={() => isActive && handleCityChange(city)}
                  style={[
                    styles.cityChip,
                    isSelected && styles.cityChipSelected,
                    !isActive && styles.cityChipDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.cityChipText,
                      isSelected && styles.cityChipTextSelected,
                      !isActive && styles.cityChipTextDisabled,
                    ]}
                  >
                    {city}
                  </Text>
                  <Text style={styles.cityChipCount}>{CITY_POSTCODES[city].length}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardTitle}>Select Postcodes for {selectedCity}</Text>
            <Text style={styles.counterText}>{selectedPostcodes.length} of {filteredPostcodes.length}</Text>
          </View>

          {!isCurrentCityActive && (
            <View style={styles.noticeCard}>
              <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
              <Text style={styles.noticeText}>This area is not active yet (Coming Soon).</Text>
            </View>
          )}

          {isCurrentCityActive && (
            <>
              <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search postcodes..."
                  placeholderTextColor={theme.colors.placeholder}
                  style={styles.searchInput}
                />
              </View>

              <View style={styles.bulkActions}>
                <Button
                  title="Select All"
                  size="sm"
                  variant="outline"
                  onPress={selectAllPostcodes}
                  disabled={filteredPostcodes.length === selectedPostcodes.length}
                />
                <Button
                  title="Clear All"
                  size="sm"
                  variant="outline"
                  onPress={clearAllPostcodes}
                  disabled={selectedPostcodes.length === 0}
                />
              </View>
            </>
          )}

          <View style={styles.postcodesGrid}>
            {filteredPostcodes.map((postcode) => {
              const isSelected = selectedPostcodes.includes(postcode);

              return (
                <Pressable
                  key={postcode}
                  disabled={!isCurrentCityActive}
                  onPress={() => isCurrentCityActive && togglePostcode(postcode)}
                  style={[
                    styles.postcodeChip,
                    isSelected && styles.postcodeChipSelected,
                    !isCurrentCityActive && styles.postcodeChipDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.postcodeText,
                      isSelected && styles.postcodeTextSelected,
                      !isCurrentCityActive && styles.postcodeTextDisabled,
                    ]}
                  >
                    {postcode}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {filteredPostcodes.length === 0 && (
            <Text style={styles.emptyText}>No postcodes found for "{searchTerm}".</Text>
          )}
        </View>

        {selectedPostcodes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Coverage Summary</Text>
            <Text style={styles.summaryText}>Selected City: {selectedCity}</Text>
            <Text style={styles.summaryText}>Postcodes Covered: {selectedPostcodes.length}</Text>
            <Text style={styles.summaryText}>
              City Coverage: {Math.round((selectedPostcodes.length / Math.max(availablePostcodes.length, 1)) * 100)}%
            </Text>
          </View>
        )}

        <View style={styles.footerPad}>
          <Button
            title={saving ? 'Saving...' : 'Save Areas Covered'}
            onPress={handleSave}
            disabled={saving || selectedPostcodes.length === 0 || !isCurrentCityActive}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1 },
    content: { padding: theme.spacing.md, gap: theme.spacing.md },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
    loadingText: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary },
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
      gap: theme.spacing.sm,
    },
    cardTitle: { ...theme.typography.h4, color: theme.colors.textPrimary },
    cityList: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
    cityChip: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    cityChipSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    cityChipDisabled: { opacity: 0.45 },
    cityChipText: { ...theme.typography.bodySmall, color: theme.colors.textPrimary },
    cityChipTextSelected: { color: theme.colors.primary, fontWeight: '700' },
    cityChipTextDisabled: { color: theme.colors.textTertiary },
    cityChipCount: { ...theme.typography.caption, color: theme.colors.textTertiary },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    counterText: { ...theme.typography.caption, color: theme.colors.textSecondary },
    noticeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.warningLight,
    },
    noticeText: { ...theme.typography.bodySmall, color: theme.colors.warning },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceSecondary,
    },
    searchInput: {
      flex: 1,
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      paddingVertical: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    bulkActions: { flexDirection: 'row', gap: theme.spacing.sm },
    postcodesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
    postcodeChip: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
    },
    postcodeChipSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    postcodeChipDisabled: { opacity: 0.5 },
    postcodeText: { ...theme.typography.buttonMedium, color: theme.colors.textPrimary },
    postcodeTextSelected: { color: theme.colors.textInverse },
    postcodeTextDisabled: { color: theme.colors.textTertiary },
    emptyText: { ...theme.typography.bodySmall, color: theme.colors.textTertiary, textAlign: 'center' },
    summaryText: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary },
    footerPad: { paddingBottom: theme.spacing.xl },
  });

export default InstructorAreasScreen;
