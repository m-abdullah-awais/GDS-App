/**
 * InstructorEarningsScreen
 * ================================
 * Earnings overview with summary and transaction history.
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

const InstructorEarningsScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const summaryColors = ['#2F6BFF', '#0EA5E9', '#7141F4', '#F97316', '#1FBF5B', '#EF4444'];

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    return transactions.filter((t) => t.status === activeFilter);
  }, [activeFilter]);

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.textTertiary;
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
    <View style={styles.filterRow}>
      {(['all', 'completed', 'pending'] as FilterTab[]).map((tab) => {
        const isActive = activeFilter === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => setActiveFilter(tab)}
            style={[styles.filterChip, isActive && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                isActive && styles.filterChipTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionStudent}>{item.studentName}</Text>
        <Text style={styles.transactionPackage}>{item.packageName}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>£{item.amount}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '18' },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

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
            <Text style={[styles.sectionTitle, styles.transactionsTitle]}>
              Transaction History
            </Text>
            {renderFilters()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No transactions found</Text>
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
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    summaryCardLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xxs,
    },
    summaryCardValue: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
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
    totalValue: {
      ...theme.typography.h1,
      color: theme.colors.primary,
    },
    totalValueColored: {
      ...theme.typography.h1,
      color: theme.colors.textInverse,
    },
    transactionsTitle: {
      marginTop: theme.spacing.sm,
    },
    filterRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    filterChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    filterChipTextActive: {
      color: theme.colors.textInverse,
    },
    transactionCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    transactionLeft: {
      flex: 1,
    },
    transactionStudent: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    transactionPackage: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    transactionDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    transactionRight: {
      alignItems: 'flex-end',
      gap: theme.spacing.xxs,
    },
    transactionAmount: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
    },
    statusBadgeText: {
      ...theme.typography.caption,
      fontWeight: '600',
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
      ...theme.typography.h3,
      color: theme.colors.textTertiary,
    },
  });

export default InstructorEarningsScreen;
