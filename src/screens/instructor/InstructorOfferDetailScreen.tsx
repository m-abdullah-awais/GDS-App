/**
 * InstructorOfferDetailScreen
 * ============================
 * Full-detail view for a single exclusive offer visible to instructors.
 * Shows hero image, offer code with copy action, redemption steps,
 * information card, and related offers.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import { getVisibleAds } from '../../utils/adVisibility';
import { getOfferExpiryInfo, formatExpiryDate } from '../../utils/offerExpiryUtils';
import type { Ad } from '../../types/ad';

// ─── Category helpers ────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  automotive: '#2F6BFF',
  dining: '#F59E0B',
  takeaway: '#EF4444',
  insurance: '#22C55E',
};

const getCategoryColor = (cat?: string): string =>
  CATEGORY_COLORS[cat?.toLowerCase() ?? ''] ?? '#8658FF';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const TIER_COLOR: Record<string, string> = {
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#22C55E',
};

// ─── Redemption steps ────────────────────────────────────────────────────────

const REDEEM_STEPS = [
  { icon: 'copy-outline', title: 'Copy Code', desc: 'Copy the offer code shown above.' },
  { icon: 'storefront-outline', title: 'Visit Partner', desc: 'Go to the partner website or store.' },
  { icon: 'checkmark-circle-outline', title: 'Apply Discount', desc: 'Enter the code at checkout to apply.' },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

const InstructorOfferDetailScreen = () => {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const offerId = route.params?.offerId as string;

  // ── Redux state ──────────────────────────────────────────────────────────
  const ads = useSelector((state: RootState) => (state as any).offers?.ads ?? []) as Ad[];
  const profile = useSelector((state: RootState) => state.auth.profile) as any;

  // ── Derived data ─────────────────────────────────────────────────────────
  const visibleAds = useMemo(
    () =>
      getVisibleAds(ads, {
        role: 'instructor',
        postcode: profile?.postcode,
      }),
    [ads, profile?.postcode],
  );

  const offer = useMemo(
    () => visibleAds.find((ad) => ad.id === offerId) ?? ads.find((ad) => ad.id === offerId),
    [visibleAds, ads, offerId],
  );

  const relatedOffers = useMemo(() => {
    if (!offer) return [];
    return visibleAds
      .filter(
        (ad) =>
          ad.id !== offer.id &&
          ad.category?.toLowerCase() === offer.category?.toLowerCase(),
      )
      .slice(0, 2);
  }, [visibleAds, offer]);

  // ── Copy-code state ──────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyCode = useCallback(() => {
    if (!offer?.offerCode) return;
    Alert.alert('Code Copied', 'Offer code: ' + offer.offerCode);
    setCopied(true);
  }, [offer?.offerCode]);

  // ── Expiry info ──────────────────────────────────────────────────────────
  const expiry = offer ? getOfferExpiryInfo(offer.endDate) : null;
  const formattedExpiry = offer ? formatExpiryDate(offer.endDate) : null;
  const catColor = getCategoryColor(offer?.category);

  // ── Not-found state ──────────────────────────────────────────────────────
  if (!offer) {
    return (
      <View style={s.root}>
        <View style={s.notFoundContainer}>
          <Pressable style={s.backButtonFloating} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </Pressable>
          <Ionicons name="alert-circle-outline" size={72} color={theme.colors.textTertiary} />
          <Text style={s.notFoundTitle}>Offer Not Found</Text>
          <Text style={s.notFoundSubtitle}>
            This offer may have expired or is no longer available.
          </Text>
          <Pressable style={s.notFoundButton} onPress={() => navigation.goBack()}>
            <Text style={s.notFoundButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* ── Hero Image ───────────────────────────────────────────── */}
        <View style={s.heroContainer}>
          <Image
            source={{ uri: offer.image_url }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.heroOverlay} />

          {/* Back button */}
          <Pressable
            style={s.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </Pressable>

          {/* Top badges */}
          <View style={s.heroBadgeRow}>
            {offer.category ? (
              <View style={[s.categoryBadge, { backgroundColor: catColor }]}>
                <Text style={s.categoryBadgeText}>{capitalize(offer.category)}</Text>
              </View>
            ) : (
              <View />
            )}
            {visibleAds.length > 0 && visibleAds[0].id === offer.id && (
              <View style={s.trendingBadge}>
                <Ionicons name="trending-up" size={12} color="#FFF" />
                <Text style={s.trendingBadgeText}>Trending</Text>
              </View>
            )}
          </View>

          {/* Hero bottom content */}
          <View style={s.heroBottom}>
            <Text style={s.heroTitle}>{offer.title}</Text>
            <Text style={s.heroDescription} numberOfLines={2}>
              {offer.description}
            </Text>
          </View>
        </View>

        {/* ── Offer Code Section ───────────────────────────────────── */}
        {offer.offerCode ? (
          <View style={s.codeSection}>
            <Text style={s.codeSectionLabel}>Your Offer Code</Text>
            <View style={s.codeBox}>
              <Text style={s.codeText}>{offer.offerCode}</Text>
            </View>
            <Pressable
              style={[s.copyButton, copied && s.copyButtonCopied]}
              onPress={handleCopyCode}
            >
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={18}
                color="#FFF"
              />
              <Text style={s.copyButtonText}>
                {copied ? 'Copied!' : 'Copy Code'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── Offer Details ────────────────────────────────────────── */}
        {(offer.fullDescription || offer.terms) && (
          <View style={s.detailsSection}>
            {offer.fullDescription ? (
              <>
                <Text style={s.sectionTitle}>Offer Details</Text>
                <Text style={s.detailsText}>{offer.fullDescription}</Text>
              </>
            ) : null}
            {offer.terms ? (
              <>
                <Text style={[s.sectionTitle, offer.fullDescription ? { marginTop: 18 } : undefined]}>
                  Terms & Conditions
                </Text>
                <Text style={s.detailsText}>{offer.terms}</Text>
              </>
            ) : null}
          </View>
        )}

        {/* ── How to Redeem ────────────────────────────────────────── */}
        <View style={s.redeemSection}>
          <Text style={s.sectionTitle}>How to Redeem</Text>
          {REDEEM_STEPS.map((step, idx) => (
            <View key={idx} style={s.redeemStep}>
              <View style={s.redeemStepNumber}>
                <Text style={s.redeemStepNumberText}>{idx + 1}</Text>
              </View>
              <View style={s.redeemStepContent}>
                <View style={s.redeemStepRow}>
                  <Ionicons name={step.icon as any} size={18} color={theme.colors.primary} />
                  <Text style={s.redeemStepTitle}>{step.title}</Text>
                </View>
                <Text style={s.redeemStepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Offer Information Card ───────────────────────────────── */}
        <View style={s.infoCard}>
          <Text style={s.sectionTitle}>Offer Information</Text>

          {offer.category ? (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Category</Text>
              <View style={[s.infoBadge, { backgroundColor: catColor }]}>
                <Text style={s.infoBadgeText}>{capitalize(offer.category)}</Text>
              </View>
            </View>
          ) : null}

          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Status</Text>
            <View style={[s.infoBadge, { backgroundColor: offer.active ? '#22C55E' : '#EF4444' }]}>
              <Text style={s.infoBadgeText}>{offer.active ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>

          {formattedExpiry ? (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Valid Until</Text>
              <View style={s.infoExpiryRow}>
                <Text style={s.infoValue}>{formattedExpiry}</Text>
                {expiry && (
                  <View
                    style={[
                      s.expiryBadgeSmall,
                      { backgroundColor: TIER_COLOR[expiry.tier] ?? '#8658FF' },
                    ]}
                  >
                    <Text style={s.expiryBadgeSmallText}>{expiry.label}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : null}

          {offer.postcodes && offer.postcodes.length > 0 ? (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Postcodes</Text>
              <Text style={s.infoValue}>{offer.postcodes.join(', ')}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Related Offers ───────────────────────────────────────── */}
        {relatedOffers.length > 0 && (
          <View style={s.relatedSection}>
            <Text style={s.sectionTitle}>Related Offers</Text>
            {relatedOffers.map((related) => {
              const relExpiry = getOfferExpiryInfo(related.endDate);
              const relCatColor = getCategoryColor(related.category);
              return (
                <Pressable
                  key={related.id}
                  style={s.relatedCard}
                  onPress={() =>
                    navigation.push('InstructorOfferDetail', { offerId: related.id })
                  }
                >
                  <Image
                    source={{ uri: related.image_url }}
                    style={s.relatedImage}
                    resizeMode="cover"
                  />
                  <View style={s.relatedContent}>
                    {related.category ? (
                      <View style={[s.relatedCategoryBadge, { backgroundColor: relCatColor }]}>
                        <Text style={s.relatedCategoryText}>
                          {capitalize(related.category)}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={s.relatedTitle} numberOfLines={1}>
                      {related.title}
                    </Text>
                    <Text style={s.relatedDescription} numberOfLines={2}>
                      {related.description}
                    </Text>
                    {relExpiry && (
                      <View
                        style={[
                          s.expiryBadgeSmall,
                          { backgroundColor: TIER_COLOR[relExpiry.tier] ?? '#8658FF', marginTop: 6 },
                        ]}
                      >
                        <Ionicons name="time-outline" size={10} color="#FFF" />
                        <Text style={s.expiryBadgeSmallText}>{relExpiry.label}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textTertiary}
                    style={s.relatedChevron}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    scrollContent: {
      paddingBottom: 40,
    },

    // ── Hero ──────────────────────────────────────────────────────────────
    heroContainer: {
      height: 300,
      position: 'relative',
    },
    heroImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backButton: {
      position: 'absolute',
      top: 48,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBadgeRow: {
      position: 'absolute',
      top: 48,
      right: 16,
      flexDirection: 'row',
      gap: 8,
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
    heroBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    heroDescription: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 6,
      lineHeight: 20,
    },

    // ── Code Section ──────────────────────────────────────────────────────
    codeSection: {
      marginHorizontal: 16,
      marginTop: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    codeSectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    codeBox: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    codeText: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 2,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 14,
      gap: 6,
    },
    copyButtonCopied: {
      backgroundColor: '#22C55E',
    },
    copyButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // ── Details Section ───────────────────────────────────────────────────
    detailsSection: {
      marginHorizontal: 16,
      marginTop: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 10,
    },
    detailsText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },

    // ── How to Redeem ─────────────────────────────────────────────────────
    redeemSection: {
      marginHorizontal: 16,
      marginTop: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    redeemStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    redeemStepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    redeemStepNumberText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    redeemStepContent: {
      flex: 1,
    },
    redeemStepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    redeemStepTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    redeemStepDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 18,
    },

    // ── Offer Information Card ────────────────────────────────────────────
    infoCard: {
      marginHorizontal: 16,
      marginTop: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    infoBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    infoBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    infoExpiryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    expiryBadgeSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      gap: 3,
    },
    expiryBadgeSmallText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // ── Related Offers ────────────────────────────────────────────────────
    relatedSection: {
      marginHorizontal: 16,
      marginTop: 20,
    },
    relatedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    relatedImage: {
      width: 90,
      height: 90,
    },
    relatedContent: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    relatedCategoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      marginBottom: 4,
    },
    relatedCategoryText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    relatedTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    relatedDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
    relatedChevron: {
      marginRight: 12,
    },

    // ── Not Found ─────────────────────────────────────────────────────────
    notFoundContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    backButtonFloating: {
      position: 'absolute',
      top: 48,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    notFoundTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 16,
    },
    notFoundSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
    notFoundButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 24,
    },
    notFoundButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

export default InstructorOfferDetailScreen;
