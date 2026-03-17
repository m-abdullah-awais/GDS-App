/**
 * GDS Driving School -- StudentOffersScreen
 * ============================================
 *
 * Displays exclusive offers visible to the authenticated student.
 * Supports free-text search and horizontal category chip filtering.
 * Offers are filtered through adVisibility helpers based on the
 * student's role and postcode before any local filtering takes place.
 */

import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import { getVisibleAds } from '../../utils/adVisibility';
import { getOfferExpiryInfo } from '../../utils/offerExpiryUtils';
import type { Ad } from '../../types/ad';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 280;

const CATEGORIES = ['all', 'automotive', 'dining', 'takeaway', 'insurance'] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
  automotive: '#3B82F6',
  dining: '#F59E0B',
  takeaway: '#EF4444',
  insurance: '#10B981',
};

const CATEGORY_ICONS: Record<string, string> = {
  all: 'grid-outline',
  automotive: 'car-outline',
  dining: 'restaurant-outline',
  takeaway: 'fast-food-outline',
  insurance: 'shield-checkmark-outline',
};

// ─── Component ────────────────────────────────────────────────────────────────

const StudentOffersScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  const ads = useSelector((state: RootState) => state.offers.ads);
  const profile = useSelector((state: RootState) => state.auth.profile);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  // 1. Visibility-filtered offers (role + postcode + active + date range)
  const visibleAds = useMemo(
    () =>
      getVisibleAds(ads ?? [], {
        role: profile?.role,
        postcode: profile?.postcode,
      }),
    [ads, profile?.role, profile?.postcode],
  );

  // 2. Local search + category filter
  const filteredAds = useMemo(() => {
    let result = visibleAds;

    if (selectedCategory !== 'all') {
      result = result.filter(
        (ad) => ad.category?.toLowerCase() === selectedCategory,
      );
    }

    if (searchTerm.trim().length > 0) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (ad) =>
          ad.title.toLowerCase().includes(q) ||
          ad.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [visibleAds, selectedCategory, searchTerm]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getExpiryBadge = (ad: Ad) => {
    const info = getOfferExpiryInfo(ad.endDate);
    if (!info) return null;

    const tierColors: Record<string, string> = {
      red: theme.colors.error,
      yellow: theme.colors.warning,
      green: theme.colors.success,
    };

    return (
      <View style={[s.expiryBadge, { backgroundColor: tierColors[info.tier] ?? theme.colors.textSecondary }]}>
        <Ionicons name="time-outline" size={11} color="#FFFFFF" />
        <Text style={s.expiryBadgeText}>{info.label}</Text>
      </View>
    );
  };

  const getCategoryBadgeColor = (category?: string): string => {
    if (!category) return theme.colors.primary;
    return CATEGORY_COLORS[category.toLowerCase()] ?? theme.colors.primary;
  };

  // ─── Render Offer Card ────────────────────────────────────────────────────

  const renderOfferCard = ({ item, index }: { item: Ad; index: number }) => {
    const isTrending = index === 0;

    return (
      <Pressable
        style={s.card}
        onPress={() => navigation.navigate('StudentOfferDetail', { offerId: item.id })}
      >
        {/* Background Image */}
        <Image
          source={{ uri: item.image_url }}
          style={s.cardImage}
          resizeMode="cover"
        />

        {/* Dark gradient overlay */}
        <View style={s.cardGradient} />

        {/* Category badge — top right */}
        <View
          style={[
            s.categoryBadge,
            { backgroundColor: getCategoryBadgeColor(item.category) },
          ]}
        >
          <Text style={s.categoryBadgeText}>
            {item.category
              ? item.category.charAt(0).toUpperCase() + item.category.slice(1)
              : 'Offer'}
          </Text>
        </View>

        {/* Trending badge — top left */}
        {isTrending && (
          <View style={s.trendingBadge}>
            <Ionicons name="trending-up" size={12} color="#FFFFFF" />
            <Text style={s.trendingBadgeText}>Trending</Text>
          </View>
        )}

        {/* Bottom overlay content */}
        <View style={s.cardContent}>
          <Text style={s.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={s.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={s.cardFooter}>
            {/* Offer code pill */}
            {item.offerCode ? (
              <View style={s.offerCodePill}>
                <Ionicons name="pricetag-outline" size={12} color="#FFFFFF" />
                <Text style={s.offerCodeText}>{item.offerCode}</Text>
              </View>
            ) : (
              <View />
            )}

            {/* Expiry badge */}
            {getExpiryBadge(item)}
          </View>

          {/* View Offer button */}
          <Pressable
            style={s.viewOfferButton}
            onPress={() =>
              navigation.navigate('StudentOfferDetail', { offerId: item.id })
            }
          >
            <Text style={s.viewOfferButtonText}>View Offer</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  // ─── Empty State ──────────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View style={s.emptyContainer}>
      <View style={s.emptyIconCircle}>
        <Ionicons name="gift-outline" size={48} color={theme.colors.primary} />
      </View>
      <Text style={s.emptyTitle}>No Offers Found</Text>
      <Text style={s.emptySubtitle}>
        {searchTerm.trim().length > 0 || selectedCategory !== 'all'
          ? 'Try adjusting your search or category filter.'
          : 'There are no exclusive offers available for your area right now. Check back soon!'}
      </Text>
    </View>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <View style={s.container}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerOverlay} />
        <View style={s.headerContent}>
          <Text style={s.headerTitle}>Exclusive Offers</Text>
          <Text style={s.headerSubtitle}>
            Handpicked deals just for GDS students
          </Text>
        </View>
      </View>

      {/* ── Search Bar ──────────────────────────────────────────── */}
      <View style={s.searchContainer}>
        <View style={s.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search offers..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
          />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => setSearchTerm('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Category Filter Chips ───────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipRow}
        style={s.chipScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                s.chip,
                isActive
                  ? { backgroundColor: theme.colors.primary }
                  : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
              ]}
            >
              <Ionicons
                name={CATEGORY_ICONS[cat] ?? 'ellipse-outline'}
                size={15}
                color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
                style={s.chipIcon}
              />
              <Text
                style={[
                  s.chipText,
                  { color: isActive ? '#FFFFFF' : theme.colors.textSecondary },
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Offers List ─────────────────────────────────────────── */}
      <FlatList
        data={filteredAds}
        keyExtractor={(item) => item.id}
        renderItem={renderOfferCard}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    // Header
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 56,
      paddingBottom: 24,
      paddingHorizontal: 20,
      overflow: 'hidden',
    },
    headerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.dark
        ? 'rgba(0,0,0,0.15)'
        : 'rgba(255,255,255,0.06)',
    },
    headerContent: {
      zIndex: 1,
    },
    headerTitle: {
      ...theme.typography.displayMedium,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    headerSubtitle: {
      ...theme.typography.bodyMedium,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },

    // Search
    searchContainer: {
      paddingHorizontal: 16,
      marginTop: -20,
      marginBottom: 8,
      zIndex: 2,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      ...theme.shadows.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      paddingVertical: 0,
    },

    // Category Chips
    chipScroll: {
      flexGrow: 0,
      marginTop: 8,
    },
    chipRow: {
      paddingHorizontal: 16,
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
    },
    chipIcon: {
      marginRight: 5,
    },
    chipText: {
      ...theme.typography.bodySmall,
      fontWeight: '600',
    },

    // Offer Card
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 16,
      alignSelf: 'center',
      ...theme.shadows.lg,
    },
    cardImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    cardGradient: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
      // Simulating a bottom-heavy gradient
      borderRadius: 20,
    },
    categoryBadge: {
      position: 'absolute',
      top: 14,
      right: 14,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    categoryBadgeText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 11,
    },
    trendingBadge: {
      position: 'absolute',
      top: 14,
      left: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F59E0B',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      gap: 4,
    },
    trendingBadgeText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 11,
    },

    // Card content overlay
    cardContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
    },
    cardTitle: {
      ...theme.typography.h3,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    cardDescription: {
      ...theme.typography.bodySmall,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 4,
      lineHeight: 18,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    offerCodePill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 16,
      gap: 5,
    },
    offerCodeText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 12,
      letterSpacing: 1,
    },
    expiryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 10,
      gap: 3,
    },
    expiryBadgeText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 11,
    },
    viewOfferButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 10,
      marginTop: 12,
      gap: 6,
    },
    viewOfferButtonText: {
      ...theme.typography.bodySmall,
      color: '#FFFFFF',
      fontWeight: '700',
    },

    // List
    listContent: {
      paddingTop: 16,
      paddingBottom: 32,
      paddingHorizontal: 16,
    },

    // Empty State
    emptyContainer: {
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: 32,
    },
    emptyIconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

export default StudentOffersScreen;
