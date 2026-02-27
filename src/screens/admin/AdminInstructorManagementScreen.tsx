/**
 * GDS Driving School — AdminInstructorManagementScreen
 * =====================================================
 * Manage approved instructors: suspend / activate, transfer payments.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import type { AdminInstructor } from '../../store/admin/types';
import {
  suspendInstructor,
  activateInstructor,
  transferPayment,
} from '../../store/admin/actions';
import {
  SearchBar,
  FilterChips,
  StatsCard,
  StatusBadge,
  Avatar,
  ConfirmModal,
  DetailDrawer,
  EmptyState,
  SectionHeader,
  useToast,
} from '../../components/admin';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

const AdminInstructorManagementScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const instructors = useSelector((state: RootState) =>
    state.admin.instructors.filter(i => i.approvalStatus === 'approved'),
  );

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<AdminInstructor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'suspend' | 'activate' | 'payment' | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Summary stats
  const stats = useMemo(() => {
    const active = instructors.filter(i => i.accountStatus === 'active').length;
    const suspended = instructors.filter(i => i.accountStatus === 'suspended').length;
    const totalEarnings = instructors.reduce((sum, i) => sum + i.earningsTotal, 0);
    const totalPending = instructors.reduce((sum, i) => sum + i.pendingPayment, 0);
    return { active, suspended, totalEarnings, totalPending };
  }, [instructors]);

  const filtered = useMemo(() => {
    let list = instructors;
    if (filter !== 'all') {
      list = list.filter(i => i.accountStatus === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q),
      );
    }
    return list;
  }, [instructors, filter, search]);

  const openAction = useCallback(
    (inst: AdminInstructor, action: 'suspend' | 'activate' | 'payment') => {
      setSelected(inst);
      setConfirmType(action);
    },
    [],
  );

  const executeAction = useCallback(() => {
    if (!selected || !confirmType) return;
    setConfirmLoading(true);
    setTimeout(() => {
      switch (confirmType) {
        case 'suspend':
          dispatch(suspendInstructor(selected.id));
          showToast('warning', `${selected.name} has been suspended`);
          break;
        case 'activate':
          dispatch(activateInstructor(selected.id));
          showToast('success', `${selected.name} has been activated`);
          break;
        case 'payment':
          dispatch(transferPayment(selected.id, selected.pendingPayment));
          showToast('success', `\u00A3${selected.pendingPayment} transferred to ${selected.name}`);
          break;
      }
      setConfirmLoading(false);
      setConfirmType(null);
      setSelected(null);
    }, 600);
  }, [selected, confirmType, dispatch, showToast]);

  const confirmConfig = useMemo(() => {
    switch (confirmType) {
      case 'suspend':
        return {
          title: 'Suspend Instructor',
          message: `Are you sure you want to suspend ${selected?.name}?`,
          icon: 'pause-circle-outline' as const,
          variant: 'destructive' as const,
          label: 'Suspend',
        };
      case 'activate':
        return {
          title: 'Activate Instructor',
          message: `Are you sure you want to activate ${selected?.name}?`,
          icon: 'play-circle-outline' as const,
          variant: 'success' as const,
          label: 'Activate',
        };
      case 'payment':
        return {
          title: 'Stripe Payout',
          message: `Transfer \u00A3${selected?.pendingPayment ?? 0} to ${selected?.name} via Stripe?\nStripe: ${selected?.stripeConnectionStatus === 'connected' ? 'Connected' : 'Not Connected'}`,
          icon: 'wallet-outline' as const,
          variant: 'success' as const,
          label: 'Pay Now',
        };
      default:
        return {
          title: '',
          message: '',
          icon: 'alert-outline' as const,
          variant: 'primary' as const,
          label: '',
        };
    }
  }, [confirmType, selected]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <StatsCard
            title="Active"
            value={stats.active}
            icon="checkmark-circle-outline"
            accentColor="#1FBF5B"
            tintColor="#1FBF5B"
          />
          <StatsCard
            title="Suspended"
            value={stats.suspended}
            icon="pause-circle-outline"
            accentColor="#EF4444"
            tintColor="#EF4444"
          />
          <StatsCard
            title="Earnings"
            value={stats.totalEarnings}
            icon="cash-outline"
            accentColor="#0EA5E9"
            tintColor="#0EA5E9"
            prefix={'£'}
          />
          <StatsCard
            title="Pending"
            value={stats.totalPending}
            icon="wallet-outline"
            accentColor="#D946EF"
            tintColor="#D946EF"
            prefix={'£'}
          />
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <SearchBar placeholder="Search instructors..." onSearch={setSearch} />
          <FilterChips options={FILTERS} activeValue={filter} onChange={setFilter} />
        </View>

        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filtered.length} instructor{filtered.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            icon="car-outline"
            title="No instructors found"
            subtitle="Try adjusting your search or filter criteria."
          />
        ) : (
          <View style={styles.listContent}>
            {filtered.map(inst => (
              <TouchableOpacity
                key={inst.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                  setSelected(inst);
                  setDrawerOpen(true);
                }}>
                <View style={styles.cardTop}>
                  <Avatar initials={inst.avatar} size={40} theme={theme} />
                  <View style={styles.cardInfoCol}>
                    <Text style={styles.cardName}>{inst.name}</Text>
                    <Text style={styles.cardSub}>
                      {inst.city} | {inst.experience}
                    </Text>
                  </View>
                  <StatusBadge status={inst.accountStatus} />
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{inst.completedLessons}</Text>
                    <Text style={styles.metricLabel}>Lessons</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{inst.rating}</Text>
                    <Text style={styles.metricLabel}>Rating</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{'\u00A3'}{inst.earningsTotal}</Text>
                    <Text style={styles.metricLabel}>Total</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={[styles.metricValue, inst.pendingPayment > 0 && { color: theme.colors.error }]}>
                      {'\u00A3'}{inst.pendingPayment}
                    </Text>
                    <Text style={styles.metricLabel}>Pending</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  {inst.accountStatus === 'active' ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.colors.warningLight }]}
                      onPress={() => openAction(inst, 'suspend')}>
                      <Ionicons name="pause-outline" size={14} color={theme.colors.warning} />
                      <Text style={[styles.actionLabel, { color: theme.colors.warning }]}>Suspend</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.colors.successLight }]}
                      onPress={() => openAction(inst, 'activate')}>
                      <Ionicons name="play-outline" size={14} color={theme.colors.success} />
                      <Text style={[styles.actionLabel, { color: theme.colors.success }]}>Activate</Text>
                    </TouchableOpacity>
                  )}

                  {inst.pendingPayment > 0 && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.payBtn]}
                      onPress={() => openAction(inst, 'payment')}>
                      <Ionicons name="wallet-outline" size={14} color="#fff" />
                      <Text style={styles.payBtnText}>
                        Pay {'\u00A3'}{inst.pendingPayment}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Confirm */}
      <ConfirmModal
        visible={confirmType !== null}
        title={confirmConfig.title}
        message={confirmConfig.message}
        icon={confirmConfig.icon}
        variant={confirmConfig.variant}
        confirmLabel={confirmConfig.label}
        loading={confirmLoading}
        onConfirm={executeAction}
        onCancel={() => {
          setConfirmType(null);
          setSelected(null);
        }}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        visible={drawerOpen && confirmType === null}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        title="Instructor Profile">
        {selected && (
          <View style={styles.drawerBody}>
            <View style={styles.drawerAvatar}>
              <Avatar initials={selected.avatar} size={64} theme={theme} />
              <Text style={styles.drawerName}>{selected.name}</Text>
              <StatusBadge status={selected.accountStatus} />
            </View>

            <SectionHeader title="Contact" />
            <DetailRow label="Email" value={selected.email} theme={theme} />
            <DetailRow label="Phone" value={selected.phone} theme={theme} />
            <DetailRow label="City" value={selected.city} theme={theme} />

            <SectionHeader title="Professional" />
            <DetailRow label="Experience" value={selected.experience} theme={theme} />
            <DetailRow label="License" value={selected.licenseNumber} theme={theme} />
            <DetailRow label="Lessons" value={String(selected.completedLessons)} theme={theme} />
            <DetailRow label="Rating" value={`${selected.rating}/5`} theme={theme} />

            <SectionHeader title="Financial" />
            <DetailRow label="Earnings" value={`\u00A3${selected.earningsTotal}`} theme={theme} />
            <DetailRow label="Pending" value={`\u00A3${selected.pendingPayment}`} theme={theme} />
            <DetailRow label="Stripe" value={selected.stripeConnectionStatus.replace('_', ' ')} theme={theme} />
            <DetailRow label="Stripe ID" value={selected.stripeAccountId || 'N/A'} theme={theme} />

            <SectionHeader title="Documents" />
            {selected.documentsUploaded.map(doc => (
              <View key={doc.id} style={styles.docRow}>
                <Ionicons name="document-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.docText}>{doc.name}</Text>
                <StatusBadge status={doc.status} />
              </View>
            ))}
          </View>
        )}
      </DetailDrawer>
    </View>
  );
};

const DetailRow = ({ label, value, theme }: { label: string; value: string; theme: AppTheme }) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  }}>
    <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textSecondary }}>{label}</Text>
    <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '600' }}>{value}</Text>
  </View>
);

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: theme.spacing['4xl'] },
    summaryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      paddingBottom: 0,
    },
    toolbar: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    resultsRow: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs },
    resultsText: { ...theme.typography.caption, color: theme.colors.textTertiary },
    listContent: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    cardInfoCol: { flex: 1 },
    cardName: { ...theme.typography.bodyLarge, color: theme.colors.textPrimary, fontWeight: '600' },
    cardSub: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 2 },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    metric: { alignItems: 'center' },
    metricValue: { ...theme.typography.bodySmall, fontWeight: '700', color: theme.colors.textPrimary },
    metricLabel: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 2 },
    cardActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    actionLabel: { ...theme.typography.buttonSmall, fontWeight: '600' },
    payBtn: {
      backgroundColor: theme.colors.success,
    },
    payBtnText: {
      ...theme.typography.buttonSmall,
      color: '#fff',
      fontWeight: '600',
    },
    drawerBody: { paddingBottom: theme.spacing['2xl'] },
    drawerAvatar: { alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    drawerName: { ...theme.typography.h3, color: theme.colors.textPrimary },
    docRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    docText: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, flex: 1 },
  });

export default AdminInstructorManagementScreen;