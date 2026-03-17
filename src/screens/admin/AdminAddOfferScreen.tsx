/**
 * GDS Driving School -- Admin Add / Edit Offer Screen
 * =====================================================
 * Full-featured form for creating and editing exclusive offers (ads).
 * Supports category selection, city/postcode targeting, visibility
 * toggles, date ranges, and client billing information.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../theme';
import type { RootState } from '../../store';
import type { Ad } from '../../types/ad';
import { CITY_POSTCODES } from '../../constants/cityPostcodes';
import { createAd, upsertAd } from '../../services/offersService';
import AppTopHeader from '../../components/AppTopHeader';

// ─── Constants ──────────────────────────────────────────────────────────────

const PRESET_CATEGORIES = [
  'general',
  'automotive',
  'dining',
  'takeaway',
  'insurance',
  'education',
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  general: 'pricetag-outline',
  automotive: 'car-outline',
  dining: 'restaurant-outline',
  takeaway: 'fast-food-outline',
  insurance: 'shield-checkmark-outline',
  education: 'school-outline',
};

const ALL_CITIES = Object.keys(CITY_POSTCODES) as (keyof typeof CITY_POSTCODES)[];

// ─── Component ──────────────────────────────────────────────────────────────

const AdminAddOfferScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editId = route.params?.editId as string | undefined;

  const existingAds = useSelector((state: RootState) => state.offers.ads);
  const profile = useSelector((state: RootState) => state.auth.profile);

  const editingAd = useMemo(() => {
    if (!editId) return undefined;
    return existingAds?.find((a: Ad) => a.id === editId);
  }, [editId, existingAds]);

  const isEditing = !!editingAd;

  // ─── Form State ─────────────────────────────────────────────────────────

  // Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [terms, setTerms] = useState('');

  // Category
  const [category, setCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  // Visibility
  const [showToStudents, setShowToStudents] = useState(true);
  const [showToInstructors, setShowToInstructors] = useState(true);

  // Dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Area targeting
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPostcodes, setSelectedPostcodes] = useState<string[]>([]);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [postcodeModalVisible, setPostcodeModalVisible] = useState(false);

  // Client info
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [revenue, setRevenue] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [amountOutstanding, setAmountOutstanding] = useState('');

  // Saving state
  const [saving, setSaving] = useState(false);

  // ─── Populate form when editing ─────────────────────────────────────────

  useEffect(() => {
    if (!editingAd) return;

    setTitle(editingAd.title || '');
    setDescription(editingAd.description || '');
    setFullDescription(editingAd.fullDescription || '');
    setImageUrl(editingAd.image_url || '');
    setOfferCode(editingAd.offerCode || '');
    setTerms(editingAd.terms || '');

    // Category
    const cat = editingAd.category || 'general';
    if ((PRESET_CATEGORIES as readonly string[]).includes(cat)) {
      setCategory(cat);
      setUseCustomCategory(false);
    } else {
      setUseCustomCategory(true);
      setCustomCategory(cat);
    }

    setShowToStudents(editingAd.showToStudents !== false);
    setShowToInstructors(editingAd.showToInstructors !== false);
    setStartDate(editingAd.startDate || '');
    setEndDate(editingAd.endDate || '');
    setSelectedCities(editingAd.cities || []);
    setSelectedPostcodes(editingAd.postcodes || []);

    // Client info
    setClientName(editingAd.clientName || '');
    setClientEmail(editingAd.clientEmail || '');
    setClientPhone(editingAd.clientPhone || '');
    setClientAddress(editingAd.clientAddress || '');
    setRevenue(editingAd.revenue != null ? String(editingAd.revenue) : '');
    setAmountPaid(editingAd.amountPaid != null ? String(editingAd.amountPaid) : '');
    setAmountOutstanding(
      editingAd.amountOutstanding != null ? String(editingAd.amountOutstanding) : '',
    );
  }, [editingAd]);

  // ─── Derived: postcodes available for selected cities ───────────────────

  const availablePostcodes = useMemo(() => {
    const codes: string[] = [];
    for (const city of selectedCities) {
      const cityPostcodes = CITY_POSTCODES[city as keyof typeof CITY_POSTCODES];
      if (cityPostcodes) {
        codes.push(...cityPostcodes);
      }
    }
    return codes;
  }, [selectedCities]);

  // When cities change, prune postcodes that are no longer valid
  useEffect(() => {
    setSelectedPostcodes((prev) => prev.filter((pc) => availablePostcodes.includes(pc)));
  }, [availablePostcodes]);

  // ─── City toggling ──────────────────────────────────────────────────────

  const toggleCity = useCallback((city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  }, []);

  // ─── Postcode toggling ──────────────────────────────────────────────────

  const togglePostcode = useCallback((postcode: string) => {
    setSelectedPostcodes((prev) =>
      prev.includes(postcode) ? prev.filter((p) => p !== postcode) : [...prev, postcode],
    );
  }, []);

  const toggleAllPostcodesForCity = useCallback(
    (city: string) => {
      const cityPostcodes = CITY_POSTCODES[city as keyof typeof CITY_POSTCODES] || [];
      const allSelected = cityPostcodes.every((pc) => selectedPostcodes.includes(pc));

      if (allSelected) {
        // Remove all postcodes for this city
        setSelectedPostcodes((prev) => prev.filter((pc) => !cityPostcodes.includes(pc)));
      } else {
        // Add all missing postcodes for this city
        setSelectedPostcodes((prev) => {
          const newSet = new Set([...prev, ...cityPostcodes]);
          return Array.from(newSet);
        });
      }
    },
    [selectedPostcodes],
  );

  // ─── Validation ─────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!title.trim()) return 'Title is required.';
    if (!description.trim()) return 'Description is required.';
    if (!imageUrl.trim()) return 'Image URL is required.';
    if (useCustomCategory && !customCategory.trim()) return 'Please enter a custom category name.';
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate))
      return 'Start date must be in YYYY-MM-DD format.';
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate))
      return 'End date must be in YYYY-MM-DD format.';
    if (startDate && endDate && startDate > endDate)
      return 'End date must be on or after start date.';
    if (revenue && isNaN(Number(revenue))) return 'Revenue must be a valid number.';
    if (amountPaid && isNaN(Number(amountPaid))) return 'Amount Paid must be a valid number.';
    if (amountOutstanding && isNaN(Number(amountOutstanding)))
      return 'Amount Outstanding must be a valid number.';
    return null;
  };

  // ─── Save ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    const resolvedCategory = useCustomCategory ? customCategory.trim() : category;
    const id = isEditing ? editingAd!.id : Date.now().toString();

    const ad: Ad = {
      id,
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl.trim(),
      active: true,
      category: resolvedCategory,
      offerCode: offerCode.trim() || undefined,
      fullDescription: fullDescription.trim() || undefined,
      terms: terms.trim() || undefined,
      postcodes: selectedPostcodes.length > 0 ? selectedPostcodes : [],
      showToStudents,
      showToInstructors,
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
      cities: selectedCities.length > 0 ? selectedCities : undefined,
      clientName: clientName.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      revenue: revenue ? Number(revenue) : undefined,
      amountPaid: amountPaid ? Number(amountPaid) : undefined,
      amountOutstanding: amountOutstanding ? Number(amountOutstanding) : undefined,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await upsertAd(ad);
      } else {
        await createAd(ad);
      }
      Alert.alert('Success', isEditing ? 'Offer updated successfully.' : 'Offer created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save the offer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Styles (theme-aware) ───────────────────────────────────────────────

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        scrollContent: {
          padding: 16,
          paddingBottom: 40,
        },
        sectionContainer: {
          marginBottom: 24,
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 14,
        },
        sectionIcon: {
          marginRight: 8,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text,
        },
        label: {
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.textSecondary,
          marginBottom: 6,
          marginTop: 10,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 12,
          padding: 14,
          fontSize: 15,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
        },
        inputMultiline: {
          minHeight: 80,
          textAlignVertical: 'top',
        },
        // Category chips
        categoryScrollContainer: {
          marginTop: 8,
        },
        categoryChipRow: {
          flexDirection: 'row',
          flexWrap: 'nowrap',
        },
        categoryChip: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          marginRight: 8,
        },
        categoryChipActive: {
          backgroundColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary,
        },
        categoryChipText: {
          fontSize: 13,
          fontWeight: '500',
          color: theme.colors.textSecondary,
          marginLeft: 6,
          textTransform: 'capitalize',
        },
        categoryChipTextActive: {
          color: theme.colors.primaryDark,
          fontWeight: '600',
        },
        customCategoryToggle: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
        },
        customCategoryLabel: {
          fontSize: 14,
          color: theme.colors.textSecondary,
          marginLeft: 8,
        },
        // Toggles
        toggleRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 4,
        },
        toggleLabel: {
          fontSize: 15,
          fontWeight: '500',
          color: theme.colors.text,
        },
        // Area targeting
        selectButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 12,
          padding: 14,
          backgroundColor: theme.colors.surface,
          marginTop: 6,
        },
        selectButtonText: {
          fontSize: 14,
          color: theme.colors.text,
          flex: 1,
        },
        chipWrap: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 8,
        },
        tagChip: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primaryLight,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 14,
          marginRight: 6,
          marginBottom: 6,
        },
        tagChipText: {
          fontSize: 12,
          color: theme.colors.primaryDark,
          fontWeight: '500',
        },
        tagChipClose: {
          marginLeft: 4,
        },
        // Modal
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        },
        modalContent: {
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '80%',
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        },
        modalHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text,
        },
        modalDone: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.primary,
        },
        modalItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        },
        modalItemCheckbox: {
          width: 22,
          height: 22,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: theme.colors.border,
          marginRight: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        modalItemCheckboxChecked: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        modalItemText: {
          fontSize: 15,
          color: theme.colors.text,
          flex: 1,
        },
        selectAllRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        selectAllText: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.primary,
        },
        // Postcode city group
        cityGroupHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        cityGroupTitle: {
          fontSize: 15,
          fontWeight: '600',
          color: theme.colors.text,
        },
        selectAllCityButton: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 10,
          backgroundColor: theme.colors.primaryLight,
        },
        selectAllCityText: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.primaryDark,
        },
        postcodeRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: 16,
          paddingVertical: 8,
        },
        postcodeChip: {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          marginRight: 6,
          marginBottom: 6,
        },
        postcodeChipActive: {
          backgroundColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary,
        },
        postcodeChipText: {
          fontSize: 12,
          color: theme.colors.textSecondary,
        },
        postcodeChipTextActive: {
          color: theme.colors.primaryDark,
          fontWeight: '600',
        },
        // Save button
        saveButton: {
          backgroundColor: theme.colors.primary,
          paddingVertical: 16,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        },
        saveButtonDisabled: {
          opacity: 0.6,
        },
        saveButtonText: {
          fontSize: 17,
          fontWeight: '700',
          color: '#FFFFFF',
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.border,
          marginVertical: 8,
        },
      }),
    [theme],
  );

  // ─── Render helpers ─────────────────────────────────────────────────────

  const renderSectionHeader = (icon: string, label: string) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={22} color={theme.colors.primary} style={styles.sectionIcon} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );

  const renderCategoryChips = () => (
    <View style={styles.categoryScrollContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryChipRow}>
          {PRESET_CATEGORIES.map((cat) => {
            const isActive = !useCustomCategory && category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => {
                  setCategory(cat);
                  setUseCustomCategory(false);
                }}
                activeOpacity={0.7}
              >
                <Icon
                  name={CATEGORY_ICONS[cat] || 'pricetag-outline'}
                  size={16}
                  color={isActive ? theme.colors.primaryDark : theme.colors.textSecondary}
                />
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.customCategoryToggle}>
        <Switch
          value={useCustomCategory}
          onValueChange={setUseCustomCategory}
          trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
          thumbColor={useCustomCategory ? theme.colors.primary : theme.colors.surface}
        />
        <Text style={styles.customCategoryLabel}>Use custom category</Text>
      </View>

      {useCustomCategory && (
        <>
          <Text style={styles.label}>Custom Category</Text>
          <TextInput
            style={styles.input}
            value={customCategory}
            onChangeText={setCustomCategory}
            placeholder="Enter custom category"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </>
      )}
    </View>
  );

  // ─── City Modal ─────────────────────────────────────────────────────────

  const renderCityModal = () => (
    <Modal visible={cityModalVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Cities</Text>
            <TouchableOpacity onPress={() => setCityModalVisible(false)}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={ALL_CITIES}
            keyExtractor={(item) => item}
            renderItem={({ item: city }) => {
              const isSelected = selectedCities.includes(city);
              return (
                <TouchableOpacity style={styles.modalItem} onPress={() => toggleCity(city)}>
                  <View
                    style={[
                      styles.modalItemCheckbox,
                      isSelected && styles.modalItemCheckboxChecked,
                    ]}
                  >
                    {isSelected && <Icon name="checkmark" size={14} color="#FFF" />}
                  </View>
                  <Text style={styles.modalItemText}>{city}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );

  // ─── Postcode Modal ─────────────────────────────────────────────────────

  const renderPostcodeModal = () => {
    // Group available postcodes by city
    const cityGroups = selectedCities.map((city) => ({
      city,
      postcodes: CITY_POSTCODES[city as keyof typeof CITY_POSTCODES] || [],
    }));

    return (
      <Modal visible={postcodeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Postcodes</Text>
              <TouchableOpacity onPress={() => setPostcodeModalVisible(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {cityGroups.map(({ city, postcodes }) => {
                const allSelected = postcodes.every((pc) => selectedPostcodes.includes(pc));
                return (
                  <View key={city}>
                    <View style={styles.cityGroupHeader}>
                      <Text style={styles.cityGroupTitle}>{city}</Text>
                      <TouchableOpacity
                        style={styles.selectAllCityButton}
                        onPress={() => toggleAllPostcodesForCity(city)}
                      >
                        <Text style={styles.selectAllCityText}>
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.postcodeRow}>
                      {postcodes.map((pc) => {
                        const isActive = selectedPostcodes.includes(pc);
                        return (
                          <TouchableOpacity
                            key={pc}
                            style={[styles.postcodeChip, isActive && styles.postcodeChipActive]}
                            onPress={() => togglePostcode(pc)}
                          >
                            <Text
                              style={[
                                styles.postcodeChipText,
                                isActive && styles.postcodeChipTextActive,
                              ]}
                            >
                              {pc}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
              {cityGroups.length === 0 && (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.textSecondary }}>
                    Please select at least one city first.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ─── Main Render ────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <AppTopHeader
        title={isEditing ? 'Edit Offer' : 'Create Offer'}
        subtitle="Admin Console"
        leftAction="back"
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* ════════════════════════════════════════════════════════════════════
            Section 1 — Basic Information
            ════════════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          {renderSectionHeader('information-circle-outline', 'Basic Information')}

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter offer title"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Short description"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />

          <Text style={styles.label}>Full Description</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={fullDescription}
            onChangeText={setFullDescription}
            placeholder="Detailed description of the offer"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />

          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            keyboardType="url"
          />

          <Text style={styles.label}>Offer Code</Text>
          <TextInput
            style={styles.input}
            value={offerCode}
            onChangeText={setOfferCode}
            placeholder="e.g. SAVE20"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Terms & Conditions</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={terms}
            onChangeText={setTerms}
            placeholder="Terms and conditions for this offer"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            Section 2 — Category
            ════════════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          {renderSectionHeader('pricetags-outline', 'Category')}
          {renderCategoryChips()}
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            Section 3 — Visibility
            ════════════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          {renderSectionHeader('eye-outline', 'Visibility Settings')}

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show to Students</Text>
            <Switch
              value={showToStudents}
              onValueChange={setShowToStudents}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={showToStudents ? theme.colors.primary : theme.colors.surface}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show to Instructors</Text>
            <Switch
              value={showToInstructors}
              onValueChange={setShowToInstructors}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={showToInstructors ? theme.colors.primary : theme.colors.surface}
            />
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            Section 4 — Date Settings
            ════════════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          {renderSectionHeader('calendar-outline', 'Date Settings')}

          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={10}
          />

          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={10}
          />
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            Section 5 — Area Targeting
            ════════════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          {renderSectionHeader('location-outline', 'Area Targeting')}

          <Text style={styles.label}>Cities</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setCityModalVisible(true)}
          >
            <Text style={styles.selectButtonText}>
              {selectedCities.length > 0
                ? `${selectedCities.length} ${selectedCities.length === 1 ? 'city' : 'cities'} selected`
                : 'Select cities...'}
            </Text>
            <Icon name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {selectedCities.length > 0 && (
            <View style={styles.chipWrap}>
              {selectedCities.map((city) => (
                <View key={city} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{city}</Text>
                  <TouchableOpacity
                    style={styles.tagChipClose}
                    onPress={() => toggleCity(city)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close-circle" size={14} color={theme.colors.primaryDark} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.label}>Postcodes</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setPostcodeModalVisible(true)}
          >
            <Text style={styles.selectButtonText}>
              {selectedPostcodes.length > 0
                ? `${selectedPostcodes.length} ${selectedPostcodes.length === 1 ? 'postcode' : 'postcodes'} selected`
                : 'Select postcodes...'}
            </Text>
            <Icon name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {selectedPostcodes.length > 0 && (
            <View style={styles.chipWrap}>
              {selectedPostcodes.slice(0, 20).map((pc) => (
                <View key={pc} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{pc}</Text>
                  <TouchableOpacity
                    style={styles.tagChipClose}
                    onPress={() => togglePostcode(pc)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close-circle" size={14} color={theme.colors.primaryDark} />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedPostcodes.length > 20 && (
                <View style={styles.tagChip}>
                  <Text style={styles.tagChipText}>
                    +{selectedPostcodes.length - 20} more
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            Section 6 — Client Information
            ════════════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          {renderSectionHeader('business-outline', 'Client Information')}

          <Text style={styles.label}>Client Name</Text>
          <TextInput
            style={styles.input}
            value={clientName}
            onChangeText={setClientName}
            placeholder="Client or business name"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.label}>Client Email</Text>
          <TextInput
            style={styles.input}
            value={clientEmail}
            onChangeText={setClientEmail}
            placeholder="client@example.com"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Client Phone</Text>
          <TextInput
            style={styles.input}
            value={clientPhone}
            onChangeText={setClientPhone}
            placeholder="+44 7XXX XXXXXX"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Client Address</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={clientAddress}
            onChangeText={setClientAddress}
            placeholder="Full address"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />

          <Text style={styles.label}>Revenue</Text>
          <TextInput
            style={styles.input}
            value={revenue}
            onChangeText={setRevenue}
            placeholder="0.00"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Amount Paid</Text>
          <TextInput
            style={styles.input}
            value={amountPaid}
            onChangeText={setAmountPaid}
            placeholder="0.00"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Amount Outstanding</Text>
          <TextInput
            style={styles.input}
            value={amountOutstanding}
            onChangeText={setAmountOutstanding}
            placeholder="0.00"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* ── Save Button ── */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update Offer' : 'Save Offer'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      {renderCityModal()}
      {renderPostcodeModal()}
    </View>
  );
};

export default AdminAddOfferScreen;
