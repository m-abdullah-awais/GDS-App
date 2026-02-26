/**
 * InstructorRequestsScreen
 * =========================
 * Incoming and outgoing student requests.
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

const InstructorRequestsScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<TabKey>('incoming');
  const [requests, setRequests] = useState<StudentRequest[]>([...initialRequests]);

  const filteredRequests = useMemo(
    () => requests.filter((r) => r.direction === activeTab),
    [requests, activeTab],
  );

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: theme.colors.warningLight, text: theme.colors.warning, label: 'Pending' };
      case 'accepted':
        return { bg: theme.colors.successLight, text: theme.colors.success, label: 'Accepted' };
      case 'rejected':
        return { bg: theme.colors.errorLight, text: theme.colors.error, label: 'Rejected' };
      default:
        return { bg: theme.colors.neutral200, text: theme.colors.textSecondary, label: status };
    }
  };

  const renderRequest = ({ item }: { item: StudentRequest }) => {
    const badge = getStatusBadge(item.status);
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{item.studentAvatar}</Text>
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.postcode}>Postcode: {item.postcode}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <View style={styles.requestMeta}>
          <Text style={styles.metaText}>Sent: {item.sentDate}</Text>
          {item.responseDate && (
            <Text style={styles.metaText}>Responded: {item.responseDate}</Text>
          )}
        </View>

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
              variant="outline"
              size="sm"
              style={styles.actionButton}
            />
          </View>
        )}
      </View>
    );
  };

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'incoming', label: 'Incoming' },
    { key: 'outgoing', label: 'Sent' },
  ];

  return (
    <ScreenContainer showHeader title="Student Requests" onBackPress={() => navigation.goBack()}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                {
                  borderBottomColor: isActive
                    ? theme.colors.primary
                    : 'transparent',
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="mail-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No requests found</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 2,
    },
    tabText: {
      ...theme.typography.buttonMedium,
    },
    listContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing['3xl'],
    },
    requestCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    requestHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarCircle: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.primary,
    },
    requestInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    studentName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    postcode: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.full,
    },
    statusBadgeText: {
      ...theme.typography.caption,
    },
    requestMeta: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    metaText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing['4xl'],
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textTertiary,
    },
  });

export default InstructorRequestsScreen;
