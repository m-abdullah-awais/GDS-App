/**
 * GDS Driving School — StudentDetailContent
 * ============================================
 * Rich, visually polished student profile content for DetailDrawer.
 * Shows profile image, contact info, academic stats, registration info,
 * and lesson history with on-demand image fetching.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { AdminStudent } from '../../store/admin/types';
import { getUserById } from '../../services/userService';
import StatusBadge from './StatusBadge';

interface StudentDetailContentProps {
  student: AdminStudent;
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
  customValue,
}: {
  icon: string;
  label: string;
  value?: string;
  valueColor?: string;
  theme: AppTheme;
  customValue?: React.ReactNode;
}) => (
  <View style={infoRowStyles(theme).row}>
    <View style={infoRowStyles(theme).iconWrap}>
      <Ionicons name={icon} size={16} color={theme.colors.primary} />
    </View>
    <Text style={infoRowStyles(theme).label}>{label}</Text>
    {customValue ?? (
      <Text
        style={[
          infoRowStyles(theme).value,
          valueColor ? { color: valueColor } : undefined,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {value}
      </Text>
    )}
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

/* ─── Lesson Card ──────────────────────────────────────────────────────────── */

const LessonCard = ({
  type,
  date,
  time,
  duration,
  instructor,
  status,
  theme,
}: {
  type: string;
  date: string;
  time: string;
  duration: string;
  instructor: string;
  status: string;
  theme: AppTheme;
}) => (
  <View style={{
    backgroundColor: theme.colors.surfaceSecondary ?? theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: status === 'completed' ? theme.colors.successLight
            : status === 'upcoming' ? theme.colors.primaryLight
            : theme.colors.error + '14',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons
            name={status === 'completed' ? 'checkmark-circle-outline' : status === 'upcoming' ? 'time-outline' : 'close-circle-outline'}
            size={18}
            color={status === 'completed' ? theme.colors.success : status === 'upcoming' ? theme.colors.primary : theme.colors.error}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '600' }}>
            {type}
          </Text>
          <Text style={{ ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 2 }}>
            {date} at {time} · {duration}
          </Text>
        </View>
      </View>
      <StatusBadge status={status} />
    </View>
    {instructor ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingLeft: 44 }}>
        <Ionicons name="person-outline" size={12} color={theme.colors.textTertiary} />
        <Text style={{ ...theme.typography.caption, color: theme.colors.textTertiary }}>
          {instructor}
        </Text>
      </View>
    ) : null}
  </View>
);

/* ─── Main Component ───────────────────────────────────────────────────────── */

const StudentDetailContent: React.FC<StudentDetailContentProps> = ({
  student,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch full profile on-demand (image URLs are stripped from Redux state)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingMedia(true);
    getUserById(student.id)
      .then(user => {
        if (cancelled || !user) return;
        setProfileImageUrl(user.profile_picture_url || user.profileImage || null);
      })
      .catch(() => {/* silently fail — fallback to initials */})
      .finally(() => { if (!cancelled) setLoadingMedia(false); });
    return () => { cancelled = true; };
  }, [student.id]);

  const hasProfileImage = !!profileImageUrl;

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
              {student.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(w => w[0]?.toUpperCase())
                .join('')}
            </Text>
          </View>
        )}
        <Text style={styles.nameText}>{student.name}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={student.approvalStatus} />
          {student.accountStatus !== 'inactive' && (
            <StatusBadge status={student.accountStatus} />
          )}
        </View>
      </View>

      {/* ── Quick Stats ─────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <StatPill
          icon="book-outline"
          value={String(student.lessonsCompleted)}
          label="Completed"
          color={theme.colors.success}
          bgColor={theme.colors.successLight}
          theme={theme}
        />
        <StatPill
          icon="calendar-outline"
          value={String(student.upcomingLessons)}
          label="Upcoming"
          color={theme.colors.primary}
          bgColor={theme.colors.primaryLight}
          theme={theme}
        />
        <StatPill
          icon="star-outline"
          value={`${student.rating}/5`}
          label="Rating"
          color="#F59E0B"
          bgColor={theme.colors.warningLight}
          theme={theme}
        />
      </View>

      {/* ── Contact ─────────────────────────────────────────────────────── */}
      <SectionTitle icon="person-outline" title="Contact" theme={theme} />
      <InfoRow icon="mail-outline" label="Email" value={student.email} theme={theme} />
      <InfoRow icon="call-outline" label="Phone" value={student.phone} theme={theme} />
      <InfoRow icon="location-outline" label="City" value={student.city} theme={theme} />

      {/* ── Academic ────────────────────────────────────────────────────── */}
      <SectionTitle icon="school-outline" title="Academic" theme={theme} />
      <InfoRow
        icon="book-outline"
        label="Lessons Completed"
        value={String(student.lessonsCompleted)}
        valueColor={theme.colors.success}
        theme={theme}
      />
      <InfoRow
        icon="calendar-outline"
        label="Upcoming Lessons"
        value={String(student.upcomingLessons)}
        valueColor={student.upcomingLessons > 0 ? theme.colors.primary : undefined}
        theme={theme}
      />
      <InfoRow
        icon="star-outline"
        label="Rating"
        theme={theme}
        customValue={<StarRating rating={student.rating} theme={theme} />}
      />
      <InfoRow
        icon="people-outline"
        label="Instructor"
        value={student.instructorAssigned || 'Not assigned'}
        valueColor={student.instructorAssigned ? undefined : theme.colors.textTertiary}
        theme={theme}
      />

      {/* ── Registration ────────────────────────────────────────────────── */}
      <SectionTitle icon="document-text-outline" title="Registration" theme={theme} />
      <InfoRow icon="calendar-outline" label="Registered" value={student.registrationDate || 'N/A'} theme={theme} />
      <InfoRow
        icon="shield-checkmark-outline"
        label="Account Status"
        theme={theme}
        customValue={<StatusBadge status={student.accountStatus} />}
      />

      {/* ── Lesson History ──────────────────────────────────────────────── */}
      {student.lessons.length > 0 && (
        <>
          <SectionTitle icon="time-outline" title="Lesson History" theme={theme} />
          {student.lessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              type={lesson.type}
              date={lesson.date}
              time={lesson.time}
              duration={lesson.duration}
              instructor={lesson.instructor}
              status={lesson.status}
              theme={theme}
            />
          ))}
        </>
      )}

      {student.lessons.length === 0 && (
        <>
          <SectionTitle icon="time-outline" title="Lesson History" theme={theme} />
          <View style={styles.emptyLessonsCard}>
            <Ionicons name="car-outline" size={28} color={theme.colors.textTertiary} />
            <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textTertiary, marginTop: 8 }}>
              No lessons recorded yet
            </Text>
          </View>
        </>
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
    emptyLessonsCard: {
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

export default StudentDetailContent;
