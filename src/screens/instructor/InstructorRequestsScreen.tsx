/**
 * InstructorRequestsScreen
 * =========================
 * Incoming and outgoing student requests.
 * Pill-style filter tabs + premium card styling (matches student side).
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import {
  studentRequests as initialRequests,
  type StudentRequest,
  type StudentRequestDirection,
} from '../../modules/instructor/mockData';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Requests'>;

type TabKey = 'incoming' | 'outgoing';

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

const getStatusStyle = (status: string, theme: AppTheme) => {
  switch (status) {
    case 'accepted':
      return { bg: theme.colors.successLight, text: theme.colors.success, label: 'Accepted', icon: '✓' };
    case 'pending':
      return { bg: theme.colors.warningLight, text: theme.colors.warning, label: 'Pending', icon: '⏳' };
    case 'rejected':
      return { bg: theme.colors.errorLight, text: theme.colors.error, label: 'Rejected', icon: '✗' };
    default:
      return { bg: theme.colors.neutral200, text: theme.colors.textSecondary, label: status, icon: '' };
  }
};

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'incoming', label: 'Incoming' },
  { key: 'outgoing', label: 'Sent' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const InstructorRequestsScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<TabKey>('incoming');
  const [requests, setRequests] = useState<StudentRequest[]>([...initialRequests]);

  const filteredRequests = useMemo(
    () => requests.filter((r) => r.direction === activeTab),
    [requests, activeTab],
  );

  const getCounts = (key: TabKey) =>
    requests.filter((r) => r.direction === key).length;

  const handleAccept = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'accepted', responseDate: new Date().toISOString().split('T')[0] }
          : r,
      ),
    );
  };

  const handleReject = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'rejected', responseDate: new Date().toISOString().split('T')[0] }
          : r,
      ),
    );
  };

  const renderRequest = ({ item }: { item: StudentRequest }) => {
    const badge = getStatusStyle(item.status, theme);
    return (
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Avatar initials={item.studentAvatar} size={52} theme={theme} />
          <View style={styles.headerInfo}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.sentDate}>Postcode: {item.postcode}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusIcon, { color: badge.text }]}>{badge.icon}</Text>
            <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        </View>

        {/* Meta info */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={styles.metaText}>Sent: {item.sentDate}</Text>
          </View>
          {item.responseDate && (
            <View style={styles.metaRow}>
              <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={styles.metaText}>Responded: {item.responseDate}</Text>
            </View>
          )}
        </View>

        {/* Actions — pending incoming */}
        {item.status === 'pending' && item.direction === 'incoming' && (
          <View style={styles.actionRow}>
            <Button
              title="Accept"
              onPress={() => handleAccept(item.id)}
              variant="primary"
              size="sm"
              style={styles.actionButton}
            />
            <Button
              title="Reject"
              onPress={() => handleReject(item.id)}
              variant="destructive"
              size="sm"
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Pending outgoing indicator */}
        {item.status === 'pending' && item.direction === 'outgoing' && (
          <View style={styles.pendingRow}>
            <Ionicons name="mail-outline" size={16} color={theme.colors.warning} />
            <Text style={styles.pendingText}>Awaiting response…</Text>
          </View>
        )}

        {/* Accepted indicator */}
        {item.status === 'accepted' && (
          <View style={styles.acceptedRow}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.acceptedText}>Request accepted</Text>
          </View>
        )}

        {/* Rejected indicator */}
        {item.status === 'rejected' && (
          <View style={styles.rejectedRow}>
            <Ionicons name="close-circle" size={16} color={theme.colors.error} />
            <Text style={styles.rejectedText}>Request declined</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer showHeader title="Student Requests" onBackPress={() => navigation.goBack()}>
      {/* ── Pill Filter Tabs ─────────────────────────────── */}
      <View style={styles.tabBar}>
        <FlatList
          data={TABS}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
          renderItem={({ item: tab }) => {
            const isActive = tab.key === activeTab;
            const count = getCounts(tab.key);
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
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
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="mail-outline" size={56} color={theme.colors.textTertiary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Requests</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'incoming'
                ? 'No incoming student requests at the moment.'
                : 'You haven\'t sent any requests yet.'}
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // ── Pill Tabs ───────────────────────────────────────
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

    // ── List ────────────────────────────────────────────
    listContent: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing['3xl'],
    },

    // ── Card (matches student side) ─────────────────────
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
    studentName: {
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

    // ── Meta Section ────────────────────────────────────
    metaSection: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    metaText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },

    // ── Actions ─────────────────────────────────────────
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
    },

    // ── Status Indicators ───────────────────────────────
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
    pendingText: {
      ...theme.typography.bodySmall,
      color: theme.colors.warning,
      fontWeight: '600',
    },
    acceptedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.successLight,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    acceptedText: {
      ...theme.typography.bodySmall,
      color: theme.colors.success,
      fontWeight: '600',
    },
    rejectedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.errorLight,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    rejectedText: {
      ...theme.typography.bodySmall,
      color: theme.colors.error,
      fontWeight: '600',
    },

    // ── Empty State ─────────────────────────────────────
    emptyState: {
      alignItems: 'center',
      paddingTop: theme.spacing['5xl'],
      paddingHorizontal: theme.spacing.xl,
    },
    emptyIcon: {
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
  });

export default InstructorRequestsScreen;
