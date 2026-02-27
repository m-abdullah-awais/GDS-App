/**
 * GDS Driving School — AdminPackageApprovalScreen
 * =================================================
 * Manage instructor-created packages: approve, reject, edit commission, delete.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import type { AdminPackage } from '../../store/admin/types';
import {
  approvePackage,
  rejectPackage,
  updatePackageCommission,
  deletePackage,
} from '../../store/admin/actions';
import {
  SearchBar,
  FilterChips,
  StatsCard,
  StatusBadge,
  ConfirmModal,
  DetailDrawer,
  EmptyState,
  SectionHeader,
  useToast,
} from '../../components/admin';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const AdminPackageApprovalScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const packages = useSelector((state: RootState) => state.admin.packages);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<AdminPackage | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editCommission, setEditCommission] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const pending = packages.filter(p => p.status === 'pending').length;
    const approved = packages.filter(p => p.status === 'approved').length;
    const rejected = packages.filter(p => p.status === 'rejected').length;
    const avgCommission =
      packages.length > 0
        ? Math.round(
            packages.reduce((sum, p) => sum + p.commissionPercentage, 0) / packages.length,
          )
        : 0;
    return { pending, approved, rejected, avgCommission };
  }, [packages]);

  const filtered = useMemo(() => {
    let list = packages;
    if (filter !== 'all') {
      list = list.filter(p => p.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.instructorName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [packages, filter, search]);

  const openAction = useCallback(
    (pkg: AdminPackage, action: 'approve' | 'reject' | 'delete') => {
      setSelected(pkg);
      setConfirmType(action);
    },
    [],
  );

  const executeAction = useCallback(() => {
    if (!selected || !confirmType) return;
    setConfirmLoading(true);
    setTimeout(() => {
      switch (confirmType) {
        case 'approve':
          dispatch(approvePackage(selected.id));
          showToast('success', `"${selected.title}" has been approved`);
          break;
        case 'reject':
          dispatch(rejectPackage(selected.id));
          showToast('warning', `"${selected.title}" has been rejected`);
          break;
        case 'delete':
          dispatch(deletePackage(selected.id));
          showToast('error', `"${selected.title}" has been deleted`);
          break;
      }
      setConfirmLoading(false);
      setConfirmType(null);
      setSelected(null);
      setDrawerOpen(false);
    }, 600);
  }, [selected, confirmType, dispatch, showToast]);

  const handleCommissionSave = useCallback(
    (pkg: AdminPackage) => {
      const val = parseFloat(editCommission);
      if (isNaN(val) || val < 0 || val > 100) {
        showToast('error', 'Commission must be between 0 and 100');
        return;
      }
      dispatch(updatePackageCommission(pkg.id, val));
      showToast('success', `Commission updated to ${val}% for "${pkg.title}"`);
      setEditingId(null);
      setEditCommission('');
    },
    [editCommission, dispatch, showToast],
  );

  const confirmConfig = useMemo(() => {
    switch (confirmType) {
      case 'approve':
        return {
          title: 'Approve Package',
          message: `Approve "${selected?.title}" by ${selected?.instructorName}?`,
          icon: 'checkmark-circle-outline' as const,
          variant: 'success' as const,
          label: 'Approve',
        };
      case 'reject':
        return {
          title: 'Reject Package',
          message: `Reject "${selected?.title}" by ${selected?.instructorName}?`,
          icon: 'close-circle-outline' as const,
          variant: 'destructive' as const,
          label: 'Reject',
        };
      case 'delete':
        return {
          title: 'Delete Package',
          message: `Permanently delete "${selected?.title}"? This cannot be undone.`,
          icon: 'trash-outline' as const,
          variant: 'destructive' as const,
          label: 'Delete',
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
        {/* Summary */}
        <View style={styles.summaryRow}>
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon="time-outline"
            accentColor="#F97316"
            tintColor="#F97316"
          />
          <StatsCard
            title="Approved"
            value={stats.approved}
            icon="checkmark-circle-outline"
            accentColor="#1FBF5B"
            tintColor="#1FBF5B"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon="close-circle-outline"
            accentColor="#EF4444"
            tintColor="#EF4444"
          />
          <StatsCard
            title="Avg Commission"
            value={stats.avgCommission}
            icon="calculator-outline"
            accentColor="#2F6BFF"
            tintColor="#2F6BFF"
            suffix="%"
          />
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <SearchBar placeholder="Search packages..." onSearch={setSearch} />
          <FilterChips options={FILTERS} activeValue={filter} onChange={setFilter} />
        </View>

        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filtered.length} package{filtered.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            icon="cube-outline"
            title="No packages found"
            subtitle="Try adjusting your search or filter criteria."
          />
        ) : (
          <View style={styles.listContent}>
            {filtered.map(pkg => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                  setSelected(pkg);
                  setDrawerOpen(true);
                }}>
                <View style={styles.cardTop}>
                  <View style={[styles.pkgIcon, { backgroundColor: theme.colors.primaryLight }]}>
                    <Ionicons name="cube-outline" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.cardInfoCol}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {pkg.title}
                    </Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {pkg.instructorName}
                    </Text>
                  </View>
                  <StatusBadge status={pkg.status} />
                </View>

                <Text style={styles.cardDesc} numberOfLines={2}>
                  {pkg.description}
                </Text>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{pkg.lessonCount}</Text>
                    <Text style={styles.metricLabel}>Lessons</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{'\u00A3'}{pkg.price}</Text>
                    <Text style={styles.metricLabel}>Price</Text>
                  </View>
                  <View style={styles.metric}>
                    {editingId === pkg.id ? (
                      <View style={styles.commissionEdit}>
                        <TextInput
                          style={styles.commissionInput}
                          value={editCommission}
                          onChangeText={setEditCommission}
                          keyboardType="numeric"
                          autoFocus
                          maxLength={5}
                        />
                        <TouchableOpacity
                          style={styles.commissionSaveBtn}
                          onPress={() => handleCommissionSave(pkg)}>
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingId(null);
                            setEditCommission('');
                          }}>
                          <Ionicons name="close" size={16} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.commissionTap}
                        onPress={() => {
                          setEditingId(pkg.id);
                          setEditCommission(String(pkg.commissionPercentage));
                        }}>
                        <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                          {pkg.commissionPercentage}%
                        </Text>
                        <Ionicons name="pencil-outline" size={10} color={theme.colors.primary} />
                      </TouchableOpacity>
                    )}
                    <Text style={styles.metricLabel}>Commission</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{pkg.createdAt}</Text>
                    <Text style={styles.metricLabel}>Created</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  {pkg.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.successLight }]}
                        onPress={() => openAction(pkg, 'approve')}>
                        <Ionicons name="checkmark-outline" size={14} color={theme.colors.success} />
                        <Text style={[styles.actionLabel, { color: theme.colors.success }]}>
                          Approve
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.errorLight }]}
                        onPress={() => openAction(pkg, 'reject')}>
                        <Ionicons name="close-outline" size={14} color={theme.colors.error} />
                        <Text style={[styles.actionLabel, { color: theme.colors.error }]}>
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
                    onPress={() => openAction(pkg, 'delete')}>
                    <Ionicons name="trash-outline" size={14} color={theme.colors.error} />
                    <Text style={[styles.actionLabel, { color: theme.colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Confirm Modal */}
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
        title="Package Details">
        {selected && (
          <View style={styles.drawerBody}>
            <View style={styles.drawerHeader}>
              <View style={[styles.drawerIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="cube" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.drawerTitle}>{selected.title}</Text>
              <StatusBadge status={selected.status} />
            </View>

            <SectionHeader title="Details" />
            <DetailRow label="Description" value={selected.description} theme={theme} />
            <DetailRow label="Instructor" value={selected.instructorName} theme={theme} />
            <DetailRow label="Lessons" value={String(selected.lessonCount)} theme={theme} />
            <DetailRow label="Price" value={`\u00A3${selected.price}`} theme={theme} />
            <DetailRow label="Commission" value={`${selected.commissionPercentage}%`} theme={theme} />
            <DetailRow label="Created" value={selected.createdAt} theme={theme} />
            <DetailRow
              label="Per-lesson Price"
              value={`\u00A3${(selected.price / selected.lessonCount).toFixed(2)}`}
              theme={theme}
            />
            <DetailRow
              label="Platform Earnings"
              value={`\u00A3${((selected.price * selected.commissionPercentage) / 100).toFixed(2)}`}
              theme={theme}
            />

            {selected.status === 'pending' && (
              <View style={styles.drawerActions}>
                <TouchableOpacity
                  style={[styles.drawerBtn, { backgroundColor: theme.colors.success }]}
                  onPress={() => openAction(selected, 'approve')}>
                  <Ionicons name="checkmark-outline" size={18} color="#fff" />
                  <Text style={styles.drawerBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.drawerBtn, { backgroundColor: theme.colors.error }]}
                  onPress={() => openAction(selected, 'reject')}>
                  <Ionicons name="close-outline" size={18} color="#fff" />
                  <Text style={styles.drawerBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </DetailDrawer>
    </View>
  );
};

/* ── Sub-components ─────────────────────────────────────────────── */

const DetailRow = ({ label, value, theme }: { label: string; value: string; theme: AppTheme }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    }}>
    <Text
      style={{
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        flex: 1,
      }}>
      {label}
    </Text>
    <Text
      style={{
        ...theme.typography.bodySmall,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        flex: 1.5,
        textAlign: 'right',
      }}
      numberOfLines={3}>
      {value}
    </Text>
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
    resultsRow: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    resultsText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    pkgIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfoCol: { flex: 1 },
    cardName: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    cardSub: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    cardDesc: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    metric: { alignItems: 'center' },
    metricValue: {
      ...theme.typography.bodySmall,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    metricLabel: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    commissionEdit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    commissionInput: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
      minWidth: 40,
      textAlign: 'center',
    },
    commissionSaveBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      padding: 4,
    },
    commissionTap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
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
    actionLabel: {
      ...theme.typography.buttonSmall,
      fontWeight: '600',
    },
    drawerBody: { paddingBottom: theme.spacing['2xl'] },
    drawerHeader: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    drawerIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    drawerTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    drawerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },
    drawerBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    drawerBtnText: {
      ...theme.typography.buttonMedium,
      color: '#fff',
      fontWeight: '600',
    },
  });

export default AdminPackageApprovalScreen;
