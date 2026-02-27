/**
 * GDS Driving School — AdminPaymentsScreen
 * ==========================================
 * Revenue summary + transactions list with Stripe integration.
 */

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import {
  StatsCard,
  SearchBar,
  FilterChips,
  StatusBadge,
  EmptyState,
  SectionHeader,
  useToast,
} from '../../components/admin';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
];

const AdminPaymentsScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { showToast } = useToast();

  const transactions = useSelector((state: RootState) => state.admin.transactions);
  const instructors = useSelector((state: RootState) => state.admin.instructors);
  const dashboardStats = useSelector((state: RootState) => state.admin.dashboardStats);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => {
    const totalPaid = transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPending = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalPaid, totalPending, count: transactions.length };
  }, [transactions]);

  const stripeStats = useMemo(() => {
    const approved = instructors.filter(i => i.approvalStatus === 'approved');
    const connected = approved.filter(i => i.stripeConnectionStatus === 'connected').length;
    const pending = approved.filter(i => i.stripeConnectionStatus === 'pending').length;
    return { connected, pending, total: approved.length };
  }, [instructors]);

  const filtered = useMemo(() => {
    let list = transactions;
    if (filter !== 'all') {
      list = list.filter(t => t.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        t =>
          t.instructorName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.method.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filter, search]);

  const handleExport = () => {
    showToast('info', 'CSV export coming soon');
  };

  const handlePayNow = (instructorName: string) => {
    showToast('success', `Stripe payout initiated for ${instructorName}`);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Revenue Summary */}
      <SectionHeader title="Revenue Summary" />
      <View style={styles.statsRow}>
        <StatsCard
          title="Monthly Revenue"
          value={dashboardStats.monthlyRevenue}
          icon="trending-up-outline"
          accentColor={theme.colors.highlight}
          tintColor={theme.colors.highlightLight}
          prefix={'\u00A3'}
        />
        <StatsCard
          title="Total Paid"
          value={stats.totalPaid}
          icon="checkmark-circle-outline"
          accentColor={theme.colors.success}
          tintColor={theme.colors.successLight}
          prefix={'\u00A3'}
        />
        <StatsCard
          title="Total Pending"
          value={stats.totalPending}
          icon="time-outline"
          accentColor={theme.colors.warning}
          tintColor={theme.colors.warningLight}
          prefix={'\u00A3'}
        />
      </View>

      {/* Stripe Connection Status */}
      <SectionHeader title="Stripe Status" />
      <View style={styles.stripeCard}>
        <View style={styles.stripeRow}>
          <Ionicons name="logo-usd" size={24} color={theme.colors.primary} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Text style={styles.stripeTitle}>Stripe Connect</Text>
            <Text style={styles.stripeSub}>
              {stripeStats.connected}/{stripeStats.total} instructors connected
            </Text>
          </View>
          <View style={[styles.stripeBadge, { backgroundColor: theme.colors.successLight }]}>
            <Text style={[styles.stripeBadgeText, { color: theme.colors.success }]}>
              Live
            </Text>
          </View>
        </View>
        <View style={styles.stripeMetrics}>
          <View style={styles.stripeMetric}>
            <Text style={[styles.stripeMetricVal, { color: theme.colors.success }]}>
              {stripeStats.connected}
            </Text>
            <Text style={styles.stripeMetricLabel}>Connected</Text>
          </View>
          <View style={styles.stripeMetric}>
            <Text style={[styles.stripeMetricVal, { color: theme.colors.warning }]}>
              {stripeStats.pending}
            </Text>
            <Text style={styles.stripeMetricLabel}>Pending</Text>
          </View>
          <View style={styles.stripeMetric}>
            <Text style={[styles.stripeMetricVal, { color: theme.colors.error }]}>
              {stripeStats.total - stripeStats.connected - stripeStats.pending}
            </Text>
            <Text style={styles.stripeMetricLabel}>Not Connected</Text>
          </View>
        </View>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarTop}>
          <SectionHeader title="Transactions" />
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Ionicons name="download-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.exportText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
        <SearchBar placeholder="Search transactions..." onSearch={setSearch} />
        <FilterChips options={FILTERS} activeValue={filter} onChange={setFilter} />
      </View>

      <Text style={styles.resultsText}>
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </Text>

      {filtered.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No transactions found"
          subtitle="Try adjusting your search or filter."
        />
      ) : (
        <View style={styles.cardList}>
          {filtered.map(txn => {
            const instructor = instructors.find(i => i.id === txn.instructorId);
            const isPending = txn.status === 'pending';
            const stripeReady = instructor?.stripeConnectionStatus === 'connected';

            return (
              <View key={txn.id} style={styles.txnCard}>
                <View style={styles.txnCardTop}>
                  <View style={styles.txnIcon}>
                    <Ionicons
                      name={isPending ? 'time-outline' : 'checkmark-circle-outline'}
                      size={20}
                      color={isPending ? theme.colors.warning : theme.colors.success}
                    />
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnName} numberOfLines={1}>
                      {txn.instructorName}
                    </Text>
                    <Text style={styles.txnDesc} numberOfLines={1}>
                      {txn.description}
                    </Text>
                  </View>
                  <View style={styles.txnAmount}>
                    <Text style={styles.txnAmountText}>
                      {'\u00A3'}{txn.amount}
                    </Text>
                    <StatusBadge status={txn.status} />
                  </View>
                </View>

                <View style={styles.txnMeta}>
                  <View style={styles.txnMetaItem}>
                    <Ionicons name="calendar-outline" size={12} color={theme.colors.textTertiary} />
                    <Text style={styles.txnMetaText}>{txn.date}</Text>
                  </View>
                  <View style={styles.txnMetaItem}>
                    <Ionicons name="card-outline" size={12} color={theme.colors.textTertiary} />
                    <Text style={styles.txnMetaText}>{txn.method}</Text>
                  </View>
                  {instructor && (
                    <View style={styles.txnMetaItem}>
                      <Ionicons
                        name="logo-usd"
                        size={12}
                        color={
                          instructor.stripeConnectionStatus === 'connected'
                            ? theme.colors.success
                            : theme.colors.warning
                        }
                      />
                      <Text style={styles.txnMetaText}>
                        Stripe {instructor.stripeConnectionStatus === 'connected' ? 'Connected' : 'Pending'}
                      </Text>
                    </View>
                  )}
                </View>

                {isPending && stripeReady && (
                  <TouchableOpacity
                    style={styles.payNowBtn}
                    onPress={() => handlePayNow(txn.instructorName)}>
                    <Ionicons name="flash-outline" size={16} color="#fff" />
                    <Text style={styles.payNowText}>Pay Now via Stripe</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.md, paddingBottom: theme.spacing['4xl'] },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    stripeCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    stripeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stripeTitle: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    stripeSub: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    stripeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    stripeBadgeText: {
      ...theme.typography.caption,
      fontWeight: '700',
    },
    stripeMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    stripeMetric: { alignItems: 'center' },
    stripeMetricVal: {
      ...theme.typography.h3,
      fontWeight: '700',
    },
    stripeMetricLabel: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    toolbar: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    toolbarTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    exportBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    exportText: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' },
    resultsText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.sm,
    },
    cardList: { gap: theme.spacing.sm },
    txnCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    txnCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    txnIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txnInfo: { flex: 1 },
    txnName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    txnDesc: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    txnAmount: { alignItems: 'flex-end', gap: 4 },
    txnAmountText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    txnMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    txnMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    txnMetaText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    payNowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    payNowText: {
      ...theme.typography.buttonSmall,
      color: '#fff',
      fontWeight: '600',
    },
  });

export default AdminPaymentsScreen;
