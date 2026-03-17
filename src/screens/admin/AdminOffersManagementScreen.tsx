import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { RootState } from '../../store';
import { Ad } from '../../types/ad';
import {
  deleteAdById,
  setAdActiveStatus,
  replaceAllAds,
  EXCLUSIVE_OFFERS,
} from '../../services/offersService';
import { getOfferExpiryInfo, formatExpiryDate } from '../../utils/offerExpiryUtils';
import { getVisibleAds } from '../../utils/adVisibility';
import { CITY_POSTCODES } from '../../constants/cityPostcodes';

type RoleType = 'student' | 'instructor';

interface RevenueSummary {
  clientName: string;
  totalRevenue: number;
  amountPaid: number;
  amountOutstanding: number;
  offerCount: number;
}

const AdminOffersManagementScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const ads: Ad[] = useSelector((state: RootState) => state.offers.ads) || [];
  const profile = useSelector((state: RootState) => state.auth.profile);

  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [resetting, setResetting] = useState(false);

  // Preview section state
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const cities = useMemo(() => Object.keys(CITY_POSTCODES), []);
  const [selectedCity, setSelectedCity] = useState(cities[0] || '');
  const [selectedPostcode, setSelectedPostcode] = useState('');
  const [previewRole, setPreviewRole] = useState<RoleType>('student');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [postcodeModalVisible, setPostcodeModalVisible] = useState(false);

  // Revenue section state
  const [revenueExpanded, setRevenueExpanded] = useState(false);

  // Postcodes for selected city
  const postcodes = useMemo(() => {
    if (!selectedCity || !CITY_POSTCODES[selectedCity]) return [];
    return CITY_POSTCODES[selectedCity];
  }, [selectedCity]);

  // Set default postcode when city changes
  React.useEffect(() => {
    if (postcodes.length > 0 && !postcodes.includes(selectedPostcode)) {
      setSelectedPostcode(postcodes[0]);
    }
  }, [postcodes, selectedPostcode]);

  // Filtered ads based on search
  const filteredAds = useMemo(() => {
    if (!searchQuery.trim()) return ads;
    const query = searchQuery.toLowerCase().trim();
    return ads.filter(
      (ad: Ad) =>
        (ad.title && ad.title.toLowerCase().includes(query)) ||
        (ad.description && ad.description.toLowerCase().includes(query)) ||
        (ad.clientName && ad.clientName.toLowerCase().includes(query))
    );
  }, [ads, searchQuery]);

  // Visible ads count for preview
  const visibleAdsCount = useMemo(() => {
    if (!selectedPostcode) return 0;
    const visible = getVisibleAds(ads, selectedPostcode, previewRole);
    return Array.isArray(visible) ? visible.length : 0;
  }, [ads, selectedPostcode, previewRole]);

  // Revenue summary grouped by client
  const revenueSummaries = useMemo((): RevenueSummary[] => {
    const clientMap: Record<string, RevenueSummary> = {};
    ads.forEach((ad: Ad) => {
      const name = ad.clientName || 'Unknown Client';
      if (!clientMap[name]) {
        clientMap[name] = {
          clientName: name,
          totalRevenue: 0,
          amountPaid: 0,
          amountOutstanding: 0,
          offerCount: 0,
        };
      }
      clientMap[name].totalRevenue += ad.revenue || 0;
      clientMap[name].amountPaid += ad.amountPaid || 0;
      clientMap[name].amountOutstanding += ad.amountOutstanding || 0;
      clientMap[name].offerCount += 1;
    });
    return Object.values(clientMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [ads]);

  // Toggle active status
  const handleToggleActive = useCallback(
    async (ad: Ad) => {
      const adId = ad.id;
      setLoadingStates((prev) => ({ ...prev, [adId]: true }));
      try {
        await setAdActiveStatus(adId, !ad.isActive);
      } catch (error) {
        Alert.alert('Error', 'Failed to update offer status. Please try again.');
      } finally {
        setLoadingStates((prev) => ({ ...prev, [adId]: false }));
      }
    },
    []
  );

  // Delete offer
  const handleDelete = useCallback((ad: Ad) => {
    Alert.alert(
      'Delete Offer',
      `Are you sure you want to delete "${ad.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const adId = ad.id;
            setLoadingStates((prev) => ({ ...prev, [adId]: true }));
            try {
              await deleteAdById(adId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete offer. Please try again.');
            } finally {
              setLoadingStates((prev) => ({ ...prev, [adId]: false }));
            }
          },
        },
      ]
    );
  }, []);

  // Reset to defaults
  const handleResetToDefaults = useCallback(() => {
    Alert.alert(
      'Reset to Defaults',
      'This will replace ALL current offers with the default exclusive offers. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await replaceAllAds(EXCLUSIVE_OFFERS);
              Alert.alert('Success', 'Offers have been reset to defaults.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset offers. Please try again.');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  }, []);

  // Navigate to add offer
  const handleAddOffer = useCallback(() => {
    navigation.navigate('AdminAddOffer');
  }, [navigation]);

  // Navigate to edit offer
  const handleEditOffer = useCallback(
    (ad: Ad) => {
      navigation.navigate('AdminAddOffer', { editId: ad.id });
    },
    [navigation]
  );

  // Get expiry badge style
  const getExpiryBadgeStyle = (ad: Ad) => {
    const expiryInfo = getOfferExpiryInfo(ad);
    if (!expiryInfo || !expiryInfo.daysRemaining && expiryInfo.daysRemaining !== 0) {
      return { backgroundColor: theme.colors.success + '20', textColor: theme.colors.success };
    }
    const days = expiryInfo.daysRemaining;
    if (days < 7) {
      return { backgroundColor: theme.colors.error + '20', textColor: theme.colors.error };
    }
    if (days < 30) {
      return { backgroundColor: theme.colors.warning + '20', textColor: theme.colors.warning };
    }
    return { backgroundColor: theme.colors.success + '20', textColor: theme.colors.success };
  };

  // Picker modal component
  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    items: string[],
    selectedItem: string,
    onSelect: (item: string) => void
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {items.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.modalItem,
                  { borderBottomColor: theme.colors.border },
                  selectedItem === item && { backgroundColor: theme.colors.primaryLight + '20' },
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    { color: theme.colors.text },
                    selectedItem === item && { color: theme.colors.primary, fontWeight: '700' },
                  ]}
                >
                  {item}
                </Text>
                {selectedItem === item && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render preview section
  const renderPreviewSection = () => (
    <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setPreviewExpanded(!previewExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="eye-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Visibility Preview
          </Text>
        </View>
        <Ionicons
          name={previewExpanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
      {previewExpanded && (
        <View style={styles.sectionBody}>
          {/* City Picker */}
          <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary }]}>City</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
            onPress={() => setCityModalVisible(true)}
          >
            <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
              {selectedCity || 'Select a city'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Postcode Picker */}
          <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
            Postcode
          </Text>
          <TouchableOpacity
            style={[styles.pickerButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
            onPress={() => setPostcodeModalVisible(true)}
            disabled={postcodes.length === 0}
          >
            <Text
              style={[
                styles.pickerButtonText,
                { color: postcodes.length === 0 ? theme.colors.textSecondary : theme.colors.text },
              ]}
            >
              {selectedPostcode || 'Select a postcode'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Role Toggle */}
          <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
            Role
          </Text>
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[
                styles.roleToggleButton,
                styles.roleToggleLeft,
                {
                  backgroundColor:
                    previewRole === 'student' ? theme.colors.primary : theme.colors.background,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setPreviewRole('student')}
            >
              <Ionicons
                name="school-outline"
                size={16}
                color={previewRole === 'student' ? '#FFFFFF' : theme.colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.roleToggleText,
                  { color: previewRole === 'student' ? '#FFFFFF' : theme.colors.primary },
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleToggleButton,
                styles.roleToggleRight,
                {
                  backgroundColor:
                    previewRole === 'instructor' ? theme.colors.primary : theme.colors.background,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setPreviewRole('instructor')}
            >
              <Ionicons
                name="car-outline"
                size={16}
                color={previewRole === 'instructor' ? '#FFFFFF' : theme.colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.roleToggleText,
                  { color: previewRole === 'instructor' ? '#FFFFFF' : theme.colors.primary },
                ]}
              >
                Instructor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Visible Count */}
          <View
            style={[
              styles.visibleCountContainer,
              { backgroundColor: theme.colors.primaryLight + '15' },
            ]}
          >
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.visibleCountText, { color: theme.colors.text }]}>
              <Text style={{ fontWeight: '700', color: theme.colors.primary }}>
                {visibleAdsCount}
              </Text>{' '}
              {visibleAdsCount === 1 ? 'offer' : 'offers'} visible for{' '}
              <Text style={{ fontWeight: '600' }}>{previewRole}</Text> in{' '}
              <Text style={{ fontWeight: '600' }}>
                {selectedPostcode || 'no postcode selected'}
              </Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  // Render revenue section
  const renderRevenueSection = () => (
    <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setRevenueExpanded(!revenueExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="cash-outline" size={22} color={theme.colors.success} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Revenue Summary</Text>
        </View>
        <Ionicons
          name={revenueExpanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
      {revenueExpanded && (
        <View style={styles.sectionBody}>
          {revenueSummaries.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No revenue data available.
            </Text>
          ) : (
            revenueSummaries.map((summary) => (
              <View
                key={summary.clientName}
                style={[styles.revenueCard, { borderColor: theme.colors.border }]}
              >
                <View style={styles.revenueCardHeader}>
                  <Text style={[styles.revenueClientName, { color: theme.colors.text }]}>
                    {summary.clientName}
                  </Text>
                  <View
                    style={[
                      styles.offerCountBadge,
                      { backgroundColor: theme.colors.primaryLight + '20' },
                    ]}
                  >
                    <Text style={[styles.offerCountBadgeText, { color: theme.colors.primary }]}>
                      {summary.offerCount} {summary.offerCount === 1 ? 'offer' : 'offers'}
                    </Text>
                  </View>
                </View>
                <View style={styles.revenueRow}>
                  <View style={styles.revenueItem}>
                    <Text style={[styles.revenueLabel, { color: theme.colors.textSecondary }]}>
                      Total Revenue
                    </Text>
                    <Text style={[styles.revenueValue, { color: theme.colors.success }]}>
                      £{summary.totalRevenue.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.revenueItem}>
                    <Text style={[styles.revenueLabel, { color: theme.colors.textSecondary }]}>
                      Paid
                    </Text>
                    <Text style={[styles.revenueValue, { color: theme.colors.primary }]}>
                      £{summary.amountPaid.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.revenueItem}>
                    <Text style={[styles.revenueLabel, { color: theme.colors.textSecondary }]}>
                      Outstanding
                    </Text>
                    <Text
                      style={[
                        styles.revenueValue,
                        {
                          color:
                            summary.amountOutstanding > 0
                              ? theme.colors.error
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      £{summary.amountOutstanding.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );

  // Render individual offer card
  const renderOfferCard = ({ item: ad }: { item: Ad }) => {
    const isLoading = loadingStates[ad.id] || false;
    const expiryInfo = getOfferExpiryInfo(ad);
    const expiryBadge = getExpiryBadgeStyle(ad);

    return (
      <View style={[styles.offerCard, { backgroundColor: theme.colors.surface }]}>
        {isLoading && (
          <View style={styles.cardLoadingOverlay}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}

        <View style={styles.offerCardTop}>
          {/* Thumbnail */}
          {ad.imageUrl ? (
            <Image source={{ uri: ad.imageUrl }} style={styles.offerThumbnail} />
          ) : (
            <View
              style={[
                styles.offerThumbnailPlaceholder,
                { backgroundColor: theme.colors.primaryLight + '20' },
              ]}
            >
              <Ionicons name="image-outline" size={28} color={theme.colors.primaryLight} />
            </View>
          )}

          {/* Info */}
          <View style={styles.offerInfo}>
            <Text style={[styles.offerTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {ad.title || 'Untitled Offer'}
            </Text>

            <View style={styles.offerBadgesRow}>
              {/* Category Badge */}
              {ad.category && (
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: theme.colors.accent + '20' },
                  ]}
                >
                  <Text style={[styles.categoryBadgeText, { color: theme.colors.accent }]}>
                    {ad.category}
                  </Text>
                </View>
              )}

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: ad.isActive
                      ? theme.colors.success + '20'
                      : theme.colors.error + '20',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: ad.isActive ? theme.colors.success : theme.colors.error },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: ad.isActive ? theme.colors.success : theme.colors.error },
                  ]}
                >
                  {ad.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            {/* Offer Code */}
            {ad.offerCode && (
              <View style={styles.offerCodeRow}>
                <Ionicons name="pricetag-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.offerCodeText, { color: theme.colors.textSecondary }]}>
                  {ad.offerCode}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Row */}
        <View style={[styles.offerDetailsRow, { borderTopColor: theme.colors.border }]}>
          {/* Expiry Badge */}
          {expiryInfo && (
            <View
              style={[styles.expiryBadge, { backgroundColor: expiryBadge.backgroundColor }]}
            >
              <Ionicons name="time-outline" size={14} color={expiryBadge.textColor} />
              <Text style={[styles.expiryBadgeText, { color: expiryBadge.textColor }]}>
                {formatExpiryDate(ad)}
              </Text>
            </View>
          )}

          {/* Client Name */}
          {ad.clientName && (
            <View style={styles.clientRow}>
              <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
              <Text
                style={[styles.clientNameText, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
              >
                {ad.clientName}
              </Text>
            </View>
          )}

          {/* Revenue */}
          {(ad.revenue !== undefined && ad.revenue !== null) && (
            <View style={styles.revenueInfoRow}>
              <Ionicons name="cash-outline" size={14} color={theme.colors.success} />
              <Text style={[styles.revenueInfoText, { color: theme.colors.success }]}>
                £{(ad.revenue || 0).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Actions Row */}
        <View style={[styles.offerActionsRow, { borderTopColor: theme.colors.border }]}>
          {/* Toggle Active */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: ad.isActive
                  ? theme.colors.warning + '15'
                  : theme.colors.success + '15',
              },
            ]}
            onPress={() => handleToggleActive(ad)}
            disabled={isLoading}
          >
            <Ionicons
              name={ad.isActive ? 'pause-circle-outline' : 'play-circle-outline'}
              size={18}
              color={ad.isActive ? theme.colors.warning : theme.colors.success}
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: ad.isActive ? theme.colors.warning : theme.colors.success },
              ]}
            >
              {ad.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>

          {/* Edit */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]}
            onPress={() => handleEditOffer(ad)}
            disabled={isLoading}
          >
            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Edit</Text>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]}
            onPress={() => handleDelete(ad)}
            disabled={isLoading}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render list header (preview, revenue, search, action buttons)
  const renderListHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.screenHeader}>
        <Text style={[styles.screenTitle, { color: theme.colors.text }]}>Offers Management</Text>
        <Text style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}>
          {ads.length} {ads.length === 1 ? 'offer' : 'offers'} total
        </Text>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.topActionsRow}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddOffer}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Add Offer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { borderColor: theme.colors.error, backgroundColor: theme.colors.error + '10' },
          ]}
          onPress={handleResetToDefaults}
          disabled={resetting}
        >
          {resetting ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={18} color={theme.colors.error} />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.error }]}>
                Reset to Defaults
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Preview Section */}
      {renderPreviewSection()}

      {/* Revenue Section */}
      {renderRevenueSection()}

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search by title, description, or client..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      {searchQuery.trim().length > 0 && (
        <Text style={[styles.resultsCount, { color: theme.colors.textSecondary }]}>
          {filteredAds.length} {filteredAds.length === 1 ? 'result' : 'results'} found
        </Text>
      )}
    </View>
  );

  // Render empty state
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="megaphone-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {searchQuery.trim() ? 'No Offers Found' : 'No Offers Yet'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {searchQuery.trim()
          ? 'Try adjusting your search terms.'
          : 'Tap "Add Offer" to create your first exclusive offer.'}
      </Text>
    </View>
  );

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredAds}
        renderItem={renderOfferCard}
        keyExtractor={(item: Ad) => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* City Picker Modal */}
      {renderPickerModal(
        cityModalVisible,
        () => setCityModalVisible(false),
        'Select City',
        cities,
        selectedCity,
        (city: string) => {
          setSelectedCity(city);
          setSelectedPostcode('');
        }
      )}

      {/* Postcode Picker Modal */}
      {renderPickerModal(
        postcodeModalVisible,
        () => setPostcodeModalVisible(false),
        'Select Postcode',
        postcodes,
        selectedPostcode,
        setSelectedPostcode
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContentContainer: {
      padding: 16,
      paddingBottom: 32,
    },
    screenHeader: {
      marginBottom: 16,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    screenSubtitle: {
      fontSize: 15,
      marginTop: 4,
    },
    topActionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    primaryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    secondaryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      gap: 6,
    },
    secondaryButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    // Section Card (Preview / Revenue)
    sectionCard: {
      borderRadius: 16,
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    sectionHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
    },
    sectionBody: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    // Picker
    pickerLabel: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pickerButtonText: {
      fontSize: 15,
    },
    // Role Toggle
    roleToggleContainer: {
      flexDirection: 'row',
      marginTop: 4,
    },
    roleToggleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderWidth: 1,
    },
    roleToggleLeft: {
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      borderRightWidth: 0,
    },
    roleToggleRight: {
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
    },
    roleToggleText: {
      fontSize: 14,
      fontWeight: '600',
    },
    visibleCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 10,
      marginTop: 14,
    },
    visibleCountText: {
      fontSize: 14,
      flex: 1,
    },
    // Revenue
    revenueCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    revenueCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    revenueClientName: {
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
    },
    offerCountBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    offerCountBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    revenueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    revenueItem: {
      alignItems: 'center',
      flex: 1,
    },
    revenueLabel: {
      fontSize: 11,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      marginBottom: 4,
    },
    revenueValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 14,
      paddingVertical: 12,
    },
    // Search
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 12 : 4,
      marginBottom: 8,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 0,
    },
    resultsCount: {
      fontSize: 13,
      marginBottom: 8,
      marginLeft: 4,
    },
    // Offer Card
    offerCard: {
      borderRadius: 16,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    cardLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.6)',
      zIndex: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    },
    offerCardTop: {
      flexDirection: 'row',
      padding: 14,
      gap: 12,
    },
    offerThumbnail: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: '#f0f0f0',
    },
    offerThumbnailPlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    offerInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    offerTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
    },
    offerBadgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 6,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    categoryBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      gap: 4,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    offerCodeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    offerCodeText: {
      fontSize: 13,
      fontWeight: '500',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    // Details Row
    offerDetailsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: 1,
      gap: 12,
    },
    expiryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    expiryBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    clientRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    clientNameText: {
      fontSize: 13,
      flex: 1,
    },
    revenueInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    revenueInfoText: {
      fontSize: 13,
      fontWeight: '700',
    },
    // Actions Row
    offerActionsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      padding: 10,
      gap: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 10,
      gap: 4,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    // Empty State
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      maxHeight: '60%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    modalList: {
      paddingBottom: 20,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalItemText: {
      fontSize: 16,
    },
  });

export default AdminOffersManagementScreen;
