/**
 * GDS Driving School — StudentMyRequestsScreen
 * ===============================================
 *
 * Shows all instructor requests the student has sent,
 * with status badges (pending / accepted / rejected).
 * Accepted requests provide a "View Packages" action.
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import {
  studentRequests,
  type StudentRequest,
  type RequestStatus,
} from '../../modules/student/mockData';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

type FilterTab = 'all' | RequestStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Declined' },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 52,
  theme,
}: {
  initials: string;
  size?: number;
  theme: AppTheme;
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text
      style={[
        theme.typography.buttonSmall,
        { color: theme.colors.textInverse, fontSize: size * 0.36 },
      ]}>
      {initials}
    </Text>
  </View>
);

// ─── Status helpers ───────────────────────────────────────────────────────────

const getStatusStyle = (status: RequestStatus, theme: AppTheme) => {
  switch (status) {
    case 'accepted':
      return {
        bg: theme.colors.successLight,
        text: theme.colors.success,
        label: 'Accepted',
        icon: '✓',
      };
    case 'pending':
      return {
        bg: theme.colors.warningLight,
        text: theme.colors.warning,
        label: 'Pending',
        icon: '⏳',
      };
    case 'rejected':
      return {
        bg: theme.colors.errorLight,
        text: theme.colors.error,
        label: 'Declined',
        icon: '✗',
      };
  }
};

// ─── Request Card ─────────────────────────────────────────────────────────────

const RequestCard = ({
  request,
  theme,
  onViewPackages,
}: {
  request: StudentRequest;
  theme: AppTheme;
  onViewPackages: (instructorId: string) => void;
}) => {
  const s = cardStyles(theme);
  const badge = getStatusStyle(request.status, theme);

  return (
    <View style={s.card}>
      {/* Header row */}
      <View style={s.headerRow}>
        <Avatar initials={request.instructorAvatar} size={52} theme={theme} />
        <View style={s.headerInfo}>
          <Text style={s.instructorName}>{request.instructorName}</Text>
          <Text style={s.sentDate}>Sent {request.sentDate}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[s.statusIcon, { color: badge.text }]}>{badge.icon}</Text>
          <Text style={[s.statusText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Student message */}
      {request.studentMessage && (
        <View style={s.messageSection}>
          <Text style={s.messageLabel}>Your Message</Text>
          <Text style={s.messageText} numberOfLines={3}>
            {request.studentMessage}
          </Text>
        </View>
      )}

      {/* Instructor response */}
      {request.instructorMessage && (
        <View style={s.responseSection}>
          <Text style={s.responseLabel}>Instructor Response</Text>
          <Text style={s.responseText} numberOfLines={3}>
            {request.instructorMessage}
          </Text>
          {request.responseDate && (
            <Text style={s.responseDate}>Responded {request.responseDate}</Text>
          )}
        </View>
      )}

      {/* Actions */}
      {request.status === 'accepted' && (
        <View style={s.actionRow}>
          <Button
            title="View Packages"
            variant="primary"
            size="md"
            fullWidth
            onPress={() => onViewPackages(request.instructorId)}
          />
        </View>
      )}

      {request.status === 'pending' && (
        <View style={s.pendingRow}>
          <Text style={s.pendingIcon}>📨</Text>
          <Text style={s.pendingText}>
            Awaiting instructor response…
          </Text>
        </View>
      )}

      {request.status === 'rejected' && (
        <View style={s.actionRow}>
          <Button
            title="Send New Request"
            variant="outline"
            size="md"
            fullWidth
            onPress={() => {}}
          />
        </View>
      )}
    </View>
  );
};

const cardStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    instructorName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    sentDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.full,
      gap: 4,
    },
    statusIcon: {
      fontSize: 12,
      fontWeight: '700',
    },
    statusText: {
      ...theme.typography.caption,
      fontWeight: '700',
    },
    messageSection: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    messageLabel: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xxs,
    },
    messageText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    responseSection: {
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    responseLabel: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xxs,
    },
    responseText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      lineHeight: 22,
    },
    responseDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    actionRow: {
      marginTop: theme.spacing.md,
    },
    pendingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.warningLight,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    pendingIcon: {
      fontSize: 16,
    },
    pendingText: {
      ...theme.typography.bodySmall,
      color: theme.colors.warning,
      fontWeight: '600',
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const StudentMyRequestsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') return studentRequests;
    return studentRequests.filter(r => r.status === activeTab);
  }, [activeTab]);

  const getCounts = (key: FilterTab) => {
    if (key === 'all') return studentRequests.length;
    return studentRequests.filter(r => r.status === key).length;
  };

  return (
    <ScreenContainer showHeader title="My Requests">
      {/* ── Filter Tabs ──────────────────────────────────── */}
      <View style={s.tabBar}>
        <FlatList
          data={FILTER_TABS}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabBarContent}
          renderItem={({ item: tab }) => {
            const isActive = tab.key === activeTab;
            const count = getCounts(tab.key);
            return (
              <Pressable
                key={tab.key}
                style={[s.tab, isActive && s.tabActive]}
                onPress={() => setActiveTab(tab.key)}>
                <Text style={[s.tabText, isActive && s.tabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[s.tabBadge, isActive && s.tabBadgeActive]}>
                    <Text style={[s.tabBadgeText, isActive && s.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>

      {/* ── Requests List ────────────────────────────────── */}
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            theme={theme}
            onViewPackages={(instructorId) =>
              navigation.navigate('PackageListing', { instructorId })
            }
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTitle}>No Requests</Text>
            <Text style={s.emptySubtitle}>
              {activeTab === 'all'
                ? 'You haven\'t sent any instructor requests yet.\nBrowse instructors to get started!'
                : `No ${activeTab} requests found.`}
            </Text>
            {activeTab === 'all' && (
              <View style={s.emptyCta}>
                <Button
                  title="Find Instructors"
                  variant="primary"
                  size="md"
                  onPress={() => navigation.navigate('InstructorDiscovery')}
                />
              </View>
            )}
          </View>
        }
      />
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Tabs
    tabBar: {
      paddingVertical: theme.spacing.sm,
    },
    tabBarContent: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surfaceSecondary,
      gap: 6,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    tabTextActive: {
      color: theme.colors.textInverse,
    },
    tabBadge: {
      backgroundColor: theme.colors.neutral300,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    tabBadgeActive: {
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    tabBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '700',
      fontSize: 11,
    },
    tabBadgeTextActive: {
      color: theme.colors.textInverse,
    },

    // List
    listContent: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing['3xl'],
    },

    // Empty
    emptyState: {
      alignItems: 'center',
      paddingTop: theme.spacing['5xl'],
      paddingHorizontal: theme.spacing.xl,
    },
    emptyIcon: {
      fontSize: 56,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    emptyCta: {
      marginTop: theme.spacing.lg,
    },
  });

export default StudentMyRequestsScreen;