/**
 * InstructorOffersScreen
 * =======================
 * Displays exclusive offers visible to the instructor with search and
 * category filtering.  Cards show image, gradient overlay, category badge,
 * offer code, expiry info, and a CTA button.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import { getVisibleAds } from '../../utils/adVisibility';
import { getOfferExpiryInfo } from '../../utils/offerExpiryUtils';
import type { Ad } from '../../types/ad';

// ─── Category helpers ────────────────────────────────────────────────────────

const CATEGORIES = ['all', 'automotive', 'dining', 'takeaway', 'insurance'] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
  automotive: '#2F6BFF',
  dining: '#F59E0B',
  takeaway: '#EF4444',
  insurance: '#22C55E',
};

const getCategoryColor = (cat?: string): string =>
  CATEGORY_COLORS[cat?.toLowerCase() ?? ''] ?? '#8658FF';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Expiry tier colour ──────────────────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#22C55E',
};

// ─── Component ───────────────────────────────────────────────────────────────

const InstructorOffersScreen = () => {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  // ── Redux state ──────────────────────────────────────────────────────────
  const ads = useSelector((state: RootState) => (state as any).offers?.ads ?? []) as Ad[];
  const profile = useSelector((state: RootState) => state.auth.profile) as any;

  // ── Local state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  // ── Filtered offers ──────────────────────────────────────────────────────
  const filteredOffers = useMemo(() => {
    const visible = getVisibleAds(ads, {
      role: 'instructor',
      postcode: profile?.postcode,
    });

    let filtered = visible;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (ad) => ad.category?.toLowerCase() === activeCategory,
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (ad) =>
          ad.title.toLowerCase().includes(q) ||
          ad.description.toLowerCase().includes(q) ||
          (ad.offerCode && ad.offerCode.toLowerCase().includes(q)),
      );
    }

    return filtered;
  }, [ads, profile?.postcode, activeCategory, search]);

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderCategoryChip = useCallback(
    (cat: Category) => {
      const active = activeCategory === cat;
      return (
        <Pressable
          key={cat}
          onPress={() => setActiveCategory(cat)}
          style={[
            s.chip,
            active ? s.chipActive : s.chipInactive,
          ]}
        >
          <Text style={[s.chipText, active ? s.chipTextActive : s.chipTextInactive]}>
            {capitalize(cat)}
          </Text>
        </Pressable>
      );
    },
    [activeCategory, s],
  );

  const renderOfferCard = useCallback(
    ({ item, index }: { item: Ad; index: number }) => {
      const expiry = getOfferExpiryInfo(item.endDate);
      const catColor = getCategoryColor(item.category);
      const isTrending = index === 0;

      return (
        <Pressable
          style={s.card}
          onPress={() =>
            navigation.navigate('InstructorOfferDetail', { offerId: item.id })
          }
        >
          {/* Background image */}
          <Image
            source={{ uri: item.image_url }}
            style={s.cardImage}
            resizeMode="cover"
          />

          {/* Gradient overlay */}
          <View style={s.cardOverlay} />

          {/* Top badges */}
          <View style={s.cardTopRow}>
            {item.category ? (
              <View style={[s.categoryBadge, { backgroundColor: catColor }]}>
                <Text style={s.categoryBadgeText}>{capitalize(item.category)}</Text>
              </View>
            ) : (
              <View />
            )}
            {isTrending && (
              <View style={s.trendingBadge}>
                <Ionicons name="trending-up" size={12} color="#FFF" />
                <Text style={s.trendingBadgeText}>Trending</Text>
              </View>
            )}
          </View>

          {/* Bottom content */}
          <View style={s.cardBottom}>
            <Text style={s.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={s.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={s.cardFooter}>
              {/* Offer code */}
              {item.offerCode ? (
                <View style={s.offerCodeBadge}>
                  <Ionicons name="pricetag" size={12} color="#FFF" />
                  <Text style={s.offerCodeText}>{item.offerCode}</Text>
                </View>
              ) : (
                <View />
              )}

              {/* Expiry */}
              {expiry && (
                <View
                  style={[
                    s.expiryBadge,
                    { backgroundColor: TIER_COLOR[expiry.tier] ?? '#8658FF' },
                  ]}
                >
                  <Ionicons name="time-outline" size={11} color="#FFF" />
                  <Text style={s.expiryText}>{expiry.label}</Text>
                </View>
              )}
            </View>

            {/* CTA */}
            <Pressable
              style={s.ctaButton}
              onPress={() =>
                navigation.navigate('InstructorOfferDetail', { offerId: item.id })
              }
            >
              <Text style={s.ctaButtonText}>Get This Offer</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </Pressable>
          </View>
        </Pressable>
      );
    },
    [s, navigation],
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={s.emptyContainer}>
        <Ionicons name="gift-outline" size={64} color={theme.colors.textTertiary} />
        <Text style={s.emptyTitle}>No Offers Available</Text>
        <Text style={s.emptySubtitle}>
          There are no exclusive offers matching your criteria right now. Check back
          soon!
        </Text>
      </View>
    ),
    [s, theme],
  );

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <View style={s.root}>
      <FlatList
        data={filteredOffers}
        keyExtractor={(item) => item.id}
        renderItem={renderOfferCard}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <>
            {/* ── Header ─────────────────────────────────────────────── */}
            <View style={s.header}>
              <Ionicons name="gift" size={28} color="#FFF" />
              <Text style={s.headerTitle}>Exclusive Offers</Text>
              <Text style={s.headerSubtitle}>
                View special offers and exclusive deals
              </Text>
            </View>

            {/* ── Search ─────────────────────────────────────────────── */}
            <View style={s.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.colors.textTertiary}
                style={s.searchIcon}
              />
              <TextInput
                style={s.searchInput}
                placeholder="Search offers..."
                placeholderTextColor={theme.colors.placeholder}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} style={s.clearButton}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
                </Pressable>
              )}
            </View>

            {/* ── Categories ─────────────────────────────────────────── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chipRow}
            >
              {CATEGORIES.map(renderCategoryChip)}
            </ScrollView>
          </>
        }
        ListFooterComponent={
          /* ── Instructor Benefits Section ──────────────────────────── */
          <View style={s.benefitsSection}>
            <View style={s.benefitsHeader}>
              <Ionicons name="star" size={22} color="#FFF" />
              <Text style={s.benefitsTitle}>Instructor Benefits</Text>
            </View>
            <Text style={s.benefitsSubtitle}>
              As a driving instructor, you have access to exclusive deals and savings.
            </Text>

            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statValue}>{filteredOffers.length}</Text>
                <Text style={s.statLabel}>Active Offers</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statValue}>15%</Text>
                <Text style={s.statLabel}>Max Discount</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statValue}>{'\u00A3'}3500+</Text>
                <Text style={s.statLabel}>Potential Savings</Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      paddingBottom: 32,
    },

    // ── Header ────────────────────────────────────────────────────────────
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 56,
      paddingBottom: 28,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: '#FFFFFF',
      marginTop: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },

    // ── Search ────────────────────────────────────────────────────────────
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 14,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 48,
      fontSize: 15,
      color: theme.colors.textPrimary,
    },
    clearButton: {
      padding: 4,
    },

    // ── Category chips ────────────────────────────────────────────────────
    chipRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
    },
    chipInactive: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
    },
    chipTextActive: {
      color: '#FFFFFF',
    },
    chipTextInactive: {
      color: theme.colors.textSecondary,
    },

    // ── Offer Card ────────────────────────────────────────────────────────
    card: {
      height: 280,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
    },
    cardImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    cardOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 14,
    },
    categoryBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    categoryBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    trendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F59E0B',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    trendingBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    cardBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 14,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    cardDescription: {
      fontSize: 13,
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
    offerCodeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    offerCodeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    expiryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    expiryText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      borderRadius: 12,
      marginTop: 10,
      gap: 6,
    },
    ctaButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // ── Empty state ───────────────────────────────────────────────────────
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },

    // ── Benefits section ──────────────────────────────────────────────────
    benefitsSection: {
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 20,
      padding: 20,
      backgroundColor: '#7141F4',
    },
    benefitsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    benefitsTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    benefitsSubtitle: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 6,
      lineHeight: 18,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 18,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.75)',
      marginTop: 4,
    },
  });

export default InstructorOffersScreen;
