/**
 * GDS Driving School — InstructorCard Component
 * ================================================
 * Card displaying instructor info with conditional CTA
 * based on the student's request status.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { StudentInstructor, InstructorRequestStatus } from '../../store/student/types';
import Avatar from '../Avatar';

interface InstructorCardProps {
  instructor: StudentInstructor;
  requestStatus: InstructorRequestStatus | 'none';
  onSendRequest?: () => void;
  onViewProfile?: () => void;
  onViewPackages?: () => void;
  activePackagesCount?: number;
  loading?: boolean;
}

const InstructorCard: React.FC<InstructorCardProps> = ({
  instructor,
  requestStatus,
  onSendRequest,
  onViewProfile,
  onViewPackages,
  activePackagesCount = 0,
  loading = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={14} color={theme.colors.warning} />,
      );
    }
    if (hasHalf) {
      stars.push(
        <Ionicons key="star-half" name="star-half" size={14} color={theme.colors.warning} />,
      );
    }
    return stars;
  };

  const renderCTA = () => {
    switch (requestStatus) {
      case 'none':
        return (
          <Pressable
            style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
            onPress={onSendRequest}
            disabled={loading}>
            <Ionicons name="paper-plane-outline" size={16} color={theme.colors.textInverse} />
            <Text style={[styles.ctaText, { color: theme.colors.textInverse }]}>
              Send Request
            </Text>
          </Pressable>
        );
      case 'pending':
        return (
          <View style={[styles.ctaButton, styles.ctaDisabled]}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textTertiary} />
            <Text style={[styles.ctaText, { color: theme.colors.textTertiary }]}>
              Request Sent
            </Text>
          </View>
        );
      case 'accepted':
        return (
          <Pressable
            style={[styles.ctaButton, { backgroundColor: theme.colors.success }]}
            onPress={onViewPackages}>
            <Ionicons name="bag-outline" size={16} color={theme.colors.textInverse} />
            <Text style={[styles.ctaText, { color: theme.colors.textInverse }]}>
              View Packages
            </Text>
          </Pressable>
        );
      case 'rejected':
        return (
          <Pressable
            style={[styles.ctaButton, styles.ctaOutline]}
            onPress={onSendRequest}
            disabled={loading}>
            <Ionicons name="refresh-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.ctaText, { color: theme.colors.primary }]}>
              Send New Request
            </Text>
          </Pressable>
        );
    }
  };

  const getStatusConfig = () => {
    switch (requestStatus) {
      case 'pending':
        return { color: theme.colors.warning, label: 'Pending', icon: 'time-outline' };
      case 'accepted':
        return { color: theme.colors.success, label: 'Accepted', icon: 'checkmark-circle-outline' };
      case 'rejected':
        return { color: theme.colors.error, label: 'Declined', icon: 'close-circle-outline' };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Pressable
      style={styles.card}
      onPress={onViewProfile}
      android_ripple={{ color: theme.colors.ripple }}>
      <View style={styles.header}>
        <Avatar initials={instructor.avatar} name={instructor.name} size={52} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {instructor.name}
            </Text>
            {statusConfig && (
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '18' }]}>
                <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.ratingRow}>
            {renderStars(instructor.rating)}
            <Text style={styles.ratingText}>
              {instructor.rating} ({instructor.reviewCount})
            </Text>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={13} color={theme.colors.textTertiary} />
              <Text style={styles.metaText}>{instructor.experience}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={theme.colors.textTertiary} />
              <Text style={styles.metaText}>{instructor.city}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {instructor.bio}
      </Text>

      {requestStatus === 'accepted' && activePackagesCount > 0 && (
        <View style={styles.packagesInfo}>
          <Ionicons name="cube-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.packagesText}>
            {activePackagesCount} active {activePackagesCount === 1 ? 'package' : 'packages'}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {renderCTA()}
      </View>
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    headerInfo: {
      flex: 1,
      gap: 3,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.xs,
    },
    name: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
      gap: 3,
    },
    statusText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    ratingText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    bio: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      lineHeight: 18,
    },
    packagesInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
    },
    packagesText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    footer: {
      marginTop: theme.spacing.sm,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.borderRadius.md,
      gap: 6,
    },
    ctaDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ctaOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    ctaText: {
      ...theme.typography.buttonMedium,
    },
  });

export default InstructorCard;
