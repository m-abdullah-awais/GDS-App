/**
 * GDS Driving School — InstructorDetailContent
 * ===============================================
 * Rich, visually polished instructor profile content for DetailDrawer.
 * Shows profile image, contact info, professional stats, financials,
 * and tappable document previews with full-screen image viewer.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { AdminInstructor } from '../../store/admin/types';
import { getUserById } from '../../services/userService';
import StatusBadge from './StatusBadge';

interface InstructorDetailContentProps {
  instructor: AdminInstructor;
}

/* ─── Star Rating ──────────────────────────────────────────────────────────── */

const StarRating = ({ rating, theme }: { rating: number; theme: AppTheme }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(star => (
      <Ionicons
        key={star}
        name={rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline'}
        size={14}
        color={rating >= star - 0.5 ? '#F59E0B' : theme.colors.textTertiary}
      />
    ))}
    <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginLeft: 4 }}>
      {rating}/5
    </Text>
  </View>
);

/* ─── Info Row with Icon ───────────────────────────────────────────────────── */

const InfoRow = ({
  icon,
  label,
  value,
  valueColor,
  theme,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
  theme: AppTheme;
}) => (
  <View style={infoRowStyles(theme).row}>
    <View style={infoRowStyles(theme).iconWrap}>
      <Ionicons name={icon} size={16} color={theme.colors.primary} />
    </View>
    <Text style={infoRowStyles(theme).label}>{label}</Text>
    <Text
      style={[
        infoRowStyles(theme).value,
        valueColor ? { color: valueColor } : undefined,
      ]}
      numberOfLines={1}
      ellipsizeMode="tail">
      {value}
    </Text>
  </View>
);

const infoRowStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      gap: 10,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    value: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      maxWidth: '45%',
      textAlign: 'right',
    },
  });

/* ─── Stat Pill ────────────────────────────────────────────────────────────── */

const StatPill = ({
  icon,
  value,
  label,
  color,
  bgColor,
  theme,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
  bgColor: string;
  theme: AppTheme;
}) => (
  <View style={{
    flex: 1,
    alignItems: 'center',
    backgroundColor: bgColor,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 4,
  }}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={{ ...theme.typography.bodySmall, fontWeight: '700', color }}>{value}</Text>
    <Text style={{ ...theme.typography.caption, color: theme.colors.textTertiary, fontSize: 10 }}>{label}</Text>
  </View>
);

/* ─── Section Title ────────────────────────────────────────────────────────── */

const SectionTitle = ({ icon, title, theme }: { icon: string; title: string; theme: AppTheme }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  }}>
    <Ionicons name={icon} size={18} color={theme.colors.primary} />
    <Text style={{ ...theme.typography.h3, color: theme.colors.textPrimary, fontSize: 16 }}>
      {title}
    </Text>
  </View>
);

/* ─── Document Card ────────────────────────────────────────────────────────── */

const DocumentCard = ({
  name,
  status,
  url,
  onPress,
  theme,
}: {
  name: string;
  status: string;
  url?: string;
  onPress?: () => void;
  theme: AppTheme;
}) => (
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSecondary ?? theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: 12,
      marginBottom: 8,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    }}
    activeOpacity={url ? 0.7 : 1}
    onPress={onPress}
    disabled={!url}>
    {/* Thumbnail */}
    {url ? (
      <Image
        source={{ uri: url }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          backgroundColor: theme.colors.surface,
        }}
        resizeMode="cover"
      />
    ) : (
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
      </View>
    )}
    <View style={{ flex: 1 }}>
      <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '600' }}>
        {name}
      </Text>
      {url && (
        <Text style={{ ...theme.typography.caption, color: theme.colors.primary, marginTop: 2 }}>
          Tap to preview
        </Text>
      )}
    </View>
    <StatusBadge status={status} />
  </TouchableOpacity>
);

/* ─── Full-Screen Image Preview Modal ──────────────────────────────────────── */

const ImagePreviewModal = ({
  visible,
  imageUrl,
  title,
  onClose,
  theme,
}: {
  visible: boolean;
  imageUrl: string;
  title: string;
  onClose: () => void;
  theme: AppTheme;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    statusBarTranslucent>
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Header */}
      <View style={{
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
      }}>
        <Text style={{ ...theme.typography.bodyLarge, color: '#fff', fontWeight: '600' }}>
          {title}
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </View>
      {/* Image */}
      <Image
        source={{ uri: imageUrl }}
        style={{ width: '90%', height: '65%', borderRadius: 12 }}
        resizeMode="contain"
      />
    </View>
  </Modal>
);

/* ─── Main Component ───────────────────────────────────────────────────────── */

const InstructorDetailContent: React.FC<InstructorDetailContentProps> = ({
  instructor,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

  // Fetch full profile on-demand (image URLs are stripped from Redux state
  // by stripHeavyFields to keep the store lightweight)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);
  const [insuranceUrl, setInsuranceUrl] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingMedia(true);
    getUserById(instructor.id)
      .then(user => {
        if (cancelled || !user) return;
        setProfileImageUrl(user.profile_picture_url || user.profileImage || null);
        setBadgeUrl(user.badge_url || null);
        setInsuranceUrl(user.insurance_url || null);
      })
      .catch(() => {/* silently fail — fallback to initials */})
      .finally(() => { if (!cancelled) setLoadingMedia(false); });
    return () => { cancelled = true; };
  }, [instructor.id]);

  // Build document list with real URLs
  const documentsWithUrls = useMemo(() =>
    instructor.documentsUploaded.map(doc => ({
      ...doc,
      url: doc.type === 'badge' ? badgeUrl ?? undefined : doc.type === 'insurance' ? insuranceUrl ?? undefined : doc.url,
    })),
    [instructor.documentsUploaded, badgeUrl, insuranceUrl],
  );

  const hasProfileImage = !!profileImageUrl;

  const handleDocPress = useCallback((url: string, name: string) => {
    setPreviewDoc({ url, name });
  }, []);

  const stripeStatusColor = instructor.stripeConnectionStatus === 'connected'
    ? theme.colors.success
    : instructor.stripeConnectionStatus === 'pending'
    ? theme.colors.warning
    : theme.colors.error;

  return (
    <View style={styles.container}>
      {/* ── Profile Header ──────────────────────────────────────────────── */}
      <View style={styles.profileHeader}>
        {loadingMedia ? (
          <View style={styles.profileInitials}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : hasProfileImage ? (
          <Image
            source={{ uri: profileImageUrl! }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileInitials}>
            <Text style={styles.initialsText}>
              {instructor.name
                .split(' ')
                .slice(0, 2)
                .map(w => w[0]?.toUpperCase())
                .join('')}
            </Text>
          </View>
        )}
        <Text style={styles.nameText}>{instructor.name}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={instructor.approvalStatus} />
          {instructor.accountStatus !== 'inactive' && (
            <StatusBadge status={instructor.accountStatus} />
          )}
        </View>
      </View>

      {/* ── Quick Stats ─────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <StatPill
          icon="school-outline"
          value={String(instructor.completedLessons)}
          label="Lessons"
          color={theme.colors.primary}
          bgColor={theme.colors.primaryLight}
          theme={theme}
        />
        <StatPill
          icon="star-outline"
          value={`${instructor.rating}/5`}
          label="Rating"
          color="#F59E0B"
          bgColor={theme.colors.warningLight}
          theme={theme}
        />
        <StatPill
          icon="cash-outline"
          value={`\u00A3${instructor.earningsTotal}`}
          label="Earned"
          color={theme.colors.success}
          bgColor={theme.colors.successLight}
          theme={theme}
        />
        <StatPill
          icon="time-outline"
          value={`\u00A3${instructor.pendingPayment}`}
          label="Pending"
          color={instructor.pendingPayment > 0 ? theme.colors.error : theme.colors.textTertiary}
          bgColor={instructor.pendingPayment > 0 ? theme.colors.error + '14' : theme.colors.surfaceSecondary ?? theme.colors.background}
          theme={theme}
        />
      </View>

      {/* ── Contact ─────────────────────────────────────────────────────── */}
      <SectionTitle icon="person-outline" title="Contact" theme={theme} />
      <InfoRow icon="mail-outline" label="Email" value={instructor.email} theme={theme} />
      <InfoRow icon="call-outline" label="Phone" value={instructor.phone} theme={theme} />
      <InfoRow icon="location-outline" label="City" value={instructor.city} theme={theme} />

      {/* ── Professional ────────────────────────────────────────────────── */}
      <SectionTitle icon="briefcase-outline" title="Professional" theme={theme} />
      <InfoRow icon="trophy-outline" label="Experience" value={instructor.experience} theme={theme} />
      <InfoRow icon="card-outline" label="License" value={instructor.licenseNumber} theme={theme} />
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.divider,
        gap: 10,
      }}>
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: theme.colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="star-outline" size={16} color={theme.colors.primary} />
        </View>
        <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textSecondary, flex: 1 }}>
          Rating
        </Text>
        <StarRating rating={instructor.rating} theme={theme} />
      </View>

      {/* ── Financial ───────────────────────────────────────────────────── */}
      <SectionTitle icon="wallet-outline" title="Financial" theme={theme} />
      <InfoRow
        icon="trending-up-outline"
        label="Total Earnings"
        value={`\u00A3${instructor.earningsTotal}`}
        valueColor={theme.colors.success}
        theme={theme}
      />
      <InfoRow
        icon="hourglass-outline"
        label="Pending Payment"
        value={`\u00A3${instructor.pendingPayment}`}
        valueColor={instructor.pendingPayment > 0 ? theme.colors.error : undefined}
        theme={theme}
      />
      {/* Stripe connection card */}
      <View style={styles.stripeCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[styles.stripeDot, { backgroundColor: stripeStatusColor }]} />
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '600' }}>
            Stripe {instructor.stripeConnectionStatus.replace('_', ' ')}
          </Text>
        </View>
        {instructor.stripeAccountId ? (
          <Text
            style={{ ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 4 }}
            numberOfLines={1}>
            {instructor.stripeAccountId}
          </Text>
        ) : (
          <Text style={{ ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 4 }}>
            No account connected
          </Text>
        )}
      </View>

      {/* ── Documents ───────────────────────────────────────────────────── */}
      <SectionTitle icon="document-text-outline" title="Documents" theme={theme} />
      {documentsWithUrls.length > 0 ? (
        documentsWithUrls.map(doc => (
          <DocumentCard
            key={doc.id}
            name={doc.name}
            status={doc.status}
            url={doc.url}
            onPress={doc.url ? () => handleDocPress(doc.url!, doc.name) : undefined}
            theme={theme}
          />
        ))
      ) : (
        <View style={styles.noDocsCard}>
          <Ionicons name="cloud-upload-outline" size={28} color={theme.colors.textTertiary} />
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textTertiary, marginTop: 8 }}>
            No documents uploaded yet
          </Text>
        </View>
      )}

      {/* ── Image Preview Modal ─────────────────────────────────────────── */}
      {previewDoc && (
        <ImagePreviewModal
          visible={!!previewDoc}
          imageUrl={previewDoc.url}
          title={previewDoc.name}
          onClose={() => setPreviewDoc(null)}
          theme={theme}
        />
      )}
    </View>
  );
};

/* ─── Styles ───────────────────────────────────────────────────────────────── */

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingBottom: theme.spacing['2xl'],
    },
    profileHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
    },
    profileInitials: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: theme.colors.primaryLight,
      borderWidth: 3,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initialsText: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      fontSize: 32,
    },
    nameText: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginTop: 12,
      textAlign: 'center',
    },
    badgeRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 4,
    },
    stripeCard: {
      backgroundColor: theme.colors.surfaceSecondary ?? theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: 12,
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    stripeDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    noDocsCard: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: theme.colors.surfaceSecondary ?? theme.colors.background,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      borderStyle: 'dashed',
    },
  });

export default InstructorDetailContent;
