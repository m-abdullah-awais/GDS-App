/**
 * InstructorEarningsScreen
 * ================================
 * Earnings overview with summary and transaction history.
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import {
  earningsSummary,
  transactions,
  type Transaction,
} from '../../modules/instructor/mockData';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Earnings'>;

type FilterTab = 'all' | 'completed' | 'pending';

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
];

const InstructorEarningsScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const summaryColors = ['#2F6BFF', '#0EA5E9', '#7141F4', '#F97316', '#1FBF5B', '#EF4444'];

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    return transactions.filter((t) => t.status === activeFilter);
  }, [activeFilter]);

  const getCounts = (key: FilterTab) => {
    if (key === 'all') return transactions.length;
    return transactions.filter((t) => t.status === key).length;
  };

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return { bg: theme.colors.successLight, text: theme.colors.success, label: 'Completed', icon: '✓' };
      case 'pending':
        return { bg: theme.colors.warningLight, text: theme.colors.warning, label: 'Pending', icon: '⏳' };
      default:
        return { bg: theme.colors.neutral200, text: theme.colors.textTertiary, label: status, icon: '' };
    }
  };

  const renderSummary = () => (
    <View style={styles.summarySection}>
      <Text style={styles.sectionTitle}>Earnings Overview</Text>
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: summaryColors[0] }]}>
          <Text style={styles.summaryCardLabelColored}>Total Earnings</Text>
          <Text style={[styles.summaryCardValueColored, styles.totalValueColored]}>
            £{earningsSummary.totalEarnings.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: summaryColors[1] }]}>
          <Text style={styles.summaryCardLabelColored}>This Month</Text>
          <Text style={styles.summaryCardValueColored}>
            £{earningsSummary.thisMonth.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: summaryColors[2] }]}>
          <Text style={styles.summaryCardLabelColored}>Last Month</Text>
          <Text style={styles.summaryCardValueColored}>
            £{earningsSummary.lastMonth.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: summaryColors[3] }]}>
          <Text style={styles.summaryCardLabelColored}>Pending</Text>
          <Text style={styles.summaryCardValueColored}>
            £{earningsSummary.pendingPayout.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: summaryColors[4] }]}>
          <Text style={styles.summaryCardLabelColored}>Total Lessons</Text>
          <Text style={styles.summaryCardValueColored}>
            {earningsSummary.totalLessons}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: summaryColors[5] }]}>
          <Text style={styles.summaryCardLabelColored}>Commission</Text>
          <Text style={styles.summaryCardValueColored}>
            £{earningsSummary.commissionPaid.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterSection}>
      <Text style={[styles.sectionTitle, styles.transactionsTitle]}>
        Transaction History
      </Text>
      <View style={styles.tabBar}>
        <FlatList
          data={FILTER_TABS}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
          renderItem={({ item: tab }) => {
            const isActive = tab.key === activeFilter;
            const count = getCounts(tab.key);
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveFilter(tab.key)}>
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
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionLeft}>
            <Text style={styles.transactionStudent}>{item.studentName}</Text>
            <Text style={styles.transactionPackage}>{item.packageName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusIcon, { color: statusStyle.text }]}>{statusStyle.icon}</Text>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>
        <View style={styles.transactionFooter}>
          <View style={styles.transactionMeta}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>
          <Text style={styles.transactionAmount}>£{item.amount}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer showHeader title="Earnings" onBackPress={() => navigation.goBack()}>
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {renderSummary()}
            {renderFilters()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={56} color={theme.colors.textTertiary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'No transaction history yet.'
                : `No ${activeFilter} transactions found.`}
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    listContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
    },

    // ── Summary ─────────────────────────────────────────
    summarySection: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    summaryCard: {
      flex: 1,
      minWidth: '45%',
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
      ...theme.shadows.md,
    },
    summaryCardLabelColored: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.88)',
      marginBottom: theme.spacing.xxs,
    },
    summaryCardValueColored: {
      ...theme.typography.h3,
      color: theme.colors.textInverse,
    },
    totalValueColored: {
      ...theme.typography.h1,
      color: theme.colors.textInverse,
    },
    transactionsTitle: {
      marginBottom: theme.spacing.xs,
    },

    // ── Pill Filter Tabs ────────────────────────────────
    filterSection: {
      marginTop: theme.spacing.sm,
    },
    tabBar: {
      marginBottom: theme.spacing.md,
    },
    tabBarContent: {
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

    // ── Transaction Card (matches student card style) ───
    transactionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.md,
    },
    transactionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    transactionLeft: {
      flex: 1,
    },
    transactionStudent: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    transactionPackage: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
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
    transactionFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    transactionMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    transactionDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    transactionAmount: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
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

export default InstructorEarningsScreen;
