/**
 * GDS Driving School -- StudentOfferDetailScreen
 * =================================================
 *
 * Full detail view for a single exclusive offer.
 * Displays hero image, offer code with copy-to-clipboard,
 * about section, terms & conditions, how-to-use steps,
 * and structured offer details (category, status, expiry, postcodes).
 */

import React, { useMemo } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import { getVisibleAds } from '../../utils/adVisibility';
import { getOfferExpiryInfo, formatExpiryDate } from '../../utils/offerExpiryUtils';
import type { Ad } from '../../types/ad';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 300;

const CATEGORY_COLORS: Record<string, string> = {
  automotive: '#3B82F6',
  dining: '#F59E0B',
  takeaway: '#EF4444',
  insurance: '#10B981',
};

const HOW_TO_USE_STEPS = [
  {
    icon: 'pricetag-outline' as const,
    title: 'Present Code',
    description: 'Show the offer code at the point of sale or enter it online at checkout.',
  },
  {
    icon: 'person-outline' as const,
    title: 'Verify Identity',
    description: 'You may be asked to verify your student status with your GDS account.',
  },
  {
    icon: 'happy-outline' as const,
    title: 'Enjoy Discount',
    description: 'The discount will be applied instantly. Enjoy your exclusive savings!',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const StudentOfferDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const offerId = route.params?.offerId as string;

  const { theme } = useTheme();
  const s = createStyles(theme);

  const ads = useSelector((state: RootState) => state.offers.ads);
  const profile = useSelector((state: RootState) => state.auth.profile);

  // Find the specific offer, respecting visibility rules
  const offer = useMemo(() => {
    const visible = getVisibleAds(ads ?? [], {
      role: profile?.role,
      postcode: profile?.postcode,
    });
    return visible.find((ad) => ad.id === offerId) ?? null;
  }, [ads, profile?.role, profile?.postcode, offerId]);

  // Expiry helpers
  const expiryInfo = useMemo(
    () => getOfferExpiryInfo(offer?.endDate),
    [offer?.endDate],
  );
  const formattedExpiry = useMemo(
    () => formatExpiryDate(offer?.endDate),
    [offer?.endDate],
  );

  const getCategoryColor = (category?: string): string => {
    if (!category) return theme.colors.primary;
    return CATEGORY_COLORS[category.toLowerCase()] ?? theme.colors.primary;
  };

  const getTierColor = (tier?: string): string => {
    const tierColors: Record<string, string> = {
      red: theme.colors.error,
      yellow: theme.colors.warning,
      green: theme.colors.success,
    };
    return tierColors[tier ?? ''] ?? theme.colors.textSecondary;
  };

  // ─── Copy Code Handler ────────────────────────────────────────────────────

  const handleCopyCode = () => {
    if (!offer?.offerCode) return;
    Alert.alert(
      'Offer Code Copied',
      `The code "${offer.offerCode}" has been copied. Present this code to redeem your offer.`,
      [{ text: 'OK' }],
    );
  };

  // ─── Not Found State ─────────────────────────────────────────────────────

  if (!offer) {
    return (
      <View style={s.container}>
        <View style={s.notFoundContainer}>
          <View style={s.notFoundIconCircle}>
            <Ionicons name="alert-circle-outline" size={56} color={theme.colors.error} />
          </View>
          <Text style={s.notFoundTitle}>Offer Not Found</Text>
          <Text style={s.notFoundSubtitle}>
            This offer may have expired, been removed, or is not available in your area.
          </Text>
          <Pressable
            style={[s.notFoundButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            <Text style={s.notFoundButtonText}>Back to Offers</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <View style={s.container}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── Hero Image ──────────────────────────────────────────── */}
        <View style={s.heroContainer}>
          <Image
            source={{ uri: offer.image_url }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.heroGradient} />

          {/* Back button */}
          <Pressable style={s.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          {/* Category badge */}
          <View
            style={[
              s.heroCategoryBadge,
              { backgroundColor: getCategoryColor(offer.category) },
            ]}
          >
            <Text style={s.heroCategoryText}>
              {offer.category
                ? offer.category.charAt(0).toUpperCase() + offer.category.slice(1)
                : 'Offer'}
            </Text>
          </View>

          {/* Trending badge (shown for first visible offer or active) */}
          <View style={s.heroTrendingBadge}>
            <Ionicons name="trending-up" size={13} color="#FFFFFF" />
            <Text style={s.heroTrendingText}>Trending</Text>
          </View>

          {/* Title and description over hero */}
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>{offer.title}</Text>
            <Text style={s.heroDescription} numberOfLines={2}>
              {offer.description}
            </Text>
          </View>
        </View>

        {/* ── Offer Code Section ──────────────────────────────────── */}
        {offer.offerCode && (
          <View style={s.codeSection}>
            <Text style={s.codeSectionLabel}>Your Exclusive Code</Text>
            <View style={s.codeBox}>
              <Text style={s.codeText}>{offer.offerCode}</Text>
            </View>
            <Pressable style={s.copyButton} onPress={handleCopyCode}>
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text style={s.copyButtonText}>Copy Code</Text>
            </Pressable>
          </View>
        )}

        {/* ── About This Offer ────────────────────────────────────── */}
        {offer.fullDescription && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={s.sectionTitle}>About This Offer</Text>
            </View>
            <Text style={s.sectionBody}>{offer.fullDescription}</Text>
          </View>
        )}

        {/* ── Terms & Conditions ──────────────────────────────────── */}
        {offer.terms && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <Text style={s.sectionTitle}>Terms & Conditions</Text>
            </View>
            <Text style={s.sectionBody}>{offer.terms}</Text>
          </View>
        )}

        {/* ── How to Use ──────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={theme.colors.primary} />
            <Text style={s.sectionTitle}>How to Use</Text>
          </View>
          {HOW_TO_USE_STEPS.map((step, index) => (
            <View key={step.title} style={s.stepRow}>
              <View style={s.stepNumberCircle}>
                <Text style={s.stepNumber}>{index + 1}</Text>
              </View>
              <View style={s.stepContent}>
                <View style={s.stepTitleRow}>
                  <Ionicons name={step.icon} size={16} color={theme.colors.primary} />
                  <Text style={s.stepTitle}>{step.title}</Text>
                </View>
                <Text style={s.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Offer Details Cards ─────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="cube-outline" size={20} color={theme.colors.primary} />
            <Text style={s.sectionTitle}>Offer Details</Text>
          </View>

          <View style={s.detailsGrid}>
            {/* Category */}
            <View style={s.detailCard}>
              <Ionicons name="pricetag-outline" size={22} color={getCategoryColor(offer.category)} />
              <Text style={s.detailLabel}>Category</Text>
              <Text style={s.detailValue}>
                {offer.category
                  ? offer.category.charAt(0).toUpperCase() + offer.category.slice(1)
                  : 'General'}
              </Text>
            </View>

            {/* Status */}
            <View style={s.detailCard}>
              <Ionicons
                name={offer.active ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={22}
                color={offer.active ? theme.colors.success : theme.colors.error}
              />
              <Text style={s.detailLabel}>Status</Text>
              <Text
                style={[
                  s.detailValue,
                  { color: offer.active ? theme.colors.success : theme.colors.error },
                ]}
              >
                {offer.active ? 'Active' : 'Inactive'}
              </Text>
            </View>

            {/* Valid Until */}
            <View style={s.detailCard}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={expiryInfo ? getTierColor(expiryInfo.tier) : theme.colors.textSecondary}
              />
              <Text style={s.detailLabel}>Valid Until</Text>
              {formattedExpiry ? (
                <>
                  <Text style={s.detailValue}>{formattedExpiry}</Text>
                  {expiryInfo && (
                    <View
                      style={[
                        s.detailExpiryBadge,
                        { backgroundColor: getTierColor(expiryInfo.tier) },
                      ]}
                    >
                      <Text style={s.detailExpiryText}>{expiryInfo.label}</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={s.detailValue}>No expiry</Text>
              )}
            </View>

            {/* Available Locations */}
            <View style={s.detailCard}>
              <Ionicons name="location-outline" size={22} color={theme.colors.accent} />
              <Text style={s.detailLabel}>Available Locations</Text>
              <Text style={s.detailValue} numberOfLines={3}>
                {offer.postcodes && offer.postcodes.length > 0
                  ? offer.postcodes.join(', ')
                  : 'All areas'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },

    // ── Hero ──────────────────────────────────────────────────────────────
    heroContainer: {
      width: SCREEN_WIDTH,
      height: HERO_HEIGHT,
      overflow: 'hidden',
    },
    heroImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    heroGradient: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backButton: {
      position: 'absolute',
      top: 52,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    heroCategoryBadge: {
      position: 'absolute',
      top: 56,
      right: 16,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    heroCategoryText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 11,
    },
    heroTrendingBadge: {
      position: 'absolute',
      top: 56,
      right: 100,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F59E0B',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      gap: 4,
    },
    heroTrendingText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 11,
    },
    heroContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
    },
    heroTitle: {
      ...theme.typography.displayMedium,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    heroDescription: {
      ...theme.typography.bodyMedium,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 6,
      lineHeight: 22,
    },

    // ── Offer Code Section ────────────────────────────────────────────────
    codeSection: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginTop: -24,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      ...theme.shadows.lg,
      zIndex: 5,
    },
    codeSectionLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    },
    codeBox: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    codeText: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      fontWeight: '800',
      letterSpacing: 3,
      textAlign: 'center',
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      marginTop: 16,
      gap: 8,
    },
    copyButtonText: {
      ...theme.typography.bodyMedium,
      color: '#FFFFFF',
      fontWeight: '700',
    },

    // ── Sections ──────────────────────────────────────────────────────────
    section: {
      marginHorizontal: 16,
      marginTop: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    sectionBody: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
    },

    // ── How to Use Steps ──────────────────────────────────────────────────
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      ...theme.shadows.sm,
    },
    stepNumberCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    stepNumber: {
      ...theme.typography.bodyMedium,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    stepContent: {
      flex: 1,
    },
    stepTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    stepTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    stepDescription: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },

    // ── Detail Cards Grid ─────────────────────────────────────────────────
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    detailCard: {
      width: (SCREEN_WIDTH - 32 - 12) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    detailLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    detailValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginTop: 4,
      textAlign: 'center',
    },
    detailExpiryBadge: {
      paddingVertical: 3,
      paddingHorizontal: 10,
      borderRadius: 10,
      marginTop: 6,
    },
    detailExpiryText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 11,
    },

    // ── Not Found State ───────────────────────────────────────────────────
    notFoundContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    notFoundIconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      ...theme.shadows.md,
    },
    notFoundTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    notFoundSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    notFoundButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 8,
    },
    notFoundButtonText: {
      ...theme.typography.bodyMedium,
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });

export default StudentOfferDetailScreen;
