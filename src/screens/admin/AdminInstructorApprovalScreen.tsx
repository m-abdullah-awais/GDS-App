/**
 * GDS Driving School — AdminInstructorApprovalScreen
 * ====================================================
 * Approve / reject instructor registrations with document review.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
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
import { approveInstructorThunk, rejectInstructorThunk } from '../../store/admin/thunks';
import {
  SearchBar,
  FilterChips,
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
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const AdminInstructorApprovalScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const instructors = useSelector((state: RootState) => state.admin.instructors);

  // Defer heavy render until navigation animation completes
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => setReady(true));
    });
    return () => task.cancel();
  }, []);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<AdminInstructor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = instructors;
    if (filter !== 'all') {
      list = list.filter(i => i.approvalStatus === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        i =>
          (i.name || '').toLowerCase().includes(q) ||
          (i.email || '').toLowerCase().includes(q) ||
          (i.city || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [instructors, filter, search]);

  const handleAction = useCallback(
    (inst: AdminInstructor, action: 'approve' | 'reject') => {
      setSelected(inst);
      setConfirmAction(action);
    },
    [],
  );

  const executeAction = useCallback(() => {
    if (!selected || !confirmAction) return;
    setConfirmLoading(true);
    const thunk = confirmAction === 'approve'
      ? approveInstructorThunk(selected.id)
      : rejectInstructorThunk(selected.id);
    dispatch(thunk as any)
      .then(() => {
        if (confirmAction === 'approve') {
          showToast('success', `${selected.name} has been approved`);
        } else {
          showToast('error', `${selected.name} has been rejected`);
        }
      })
      .catch(() => showToast('error', 'Operation failed. Please try again.'))
      .finally(() => {
        setConfirmLoading(false);
        setConfirmAction(null);
        setSelected(null);
      });
  }, [selected, confirmAction, dispatch, showToast]);

  const openDrawer = useCallback((inst: AdminInstructor) => {
    setSelected(inst);
    setDrawerOpen(true);
  }, []);

  if (!ready) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
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

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="No instructors found"
            subtitle="Try adjusting your search or filter criteria."
          />
        }
        renderItem={({ item: inst }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => openDrawer(inst)}>
            <View style={styles.cardHeader}>
              <Avatar initials={inst.avatar} size={40} theme={theme} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{inst.name}</Text>
                <Text style={styles.cardSub}>{inst.email}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaItem}>
                    <Ionicons name="location-outline" size={12} color={theme.colors.textTertiary} />{' '}
                    {inst.city}
                  </Text>
                  <Text style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.textTertiary} />{' '}
                    {inst.experience}
                  </Text>
                </View>
              </View>
              <StatusBadge status={inst.approvalStatus} />
            </View>

            {/* Documents summary */}
            <View style={styles.docsRow}>
              <Ionicons name="document-text-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.docsText}>
                {inst.documentsUploaded.length} documents uploaded
              </Text>
              {inst.documentsUploaded.every(d => d.status === 'verified') ? (
                <View style={[styles.docsBadge, { backgroundColor: theme.colors.successLight }]}>
                  <Text style={[styles.docsBadgeText, { color: theme.colors.success }]}>All verified</Text>
                </View>
              ) : (
                <View style={[styles.docsBadge, { backgroundColor: theme.colors.warningLight }]}>
                  <Text style={[styles.docsBadgeText, { color: theme.colors.warning }]}>Needs review</Text>
                </View>
              )}
            </View>

            {inst.approvalStatus === 'pending' && (
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleAction(inst, 'approve')}>
                  <Ionicons name="checkmark-outline" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleAction(inst, 'reject')}>
                  <Ionicons name="close-outline" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmAction !== null}
        title={confirmAction === 'approve' ? 'Approve Instructor' : 'Reject Instructor'}
        message={`Are you sure you want to ${confirmAction} ${selected?.name ?? 'this instructor'}?`}
        icon={confirmAction === 'approve' ? 'checkmark-circle-outline' : 'close-circle-outline'}
        variant={confirmAction === 'approve' ? 'success' : 'destructive'}
        confirmLabel={confirmAction === 'approve' ? 'Approve' : 'Reject'}
        loading={confirmLoading}
        onConfirm={executeAction}
        onCancel={() => {
          setConfirmAction(null);
          setSelected(null);
        }}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        visible={drawerOpen && confirmAction === null}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        title="Instructor Details">
        {selected && (
          <View style={styles.drawerContent}>
            <View style={styles.drawerAvatar}>
              <Avatar initials={selected.avatar} size={64} theme={theme} />
              <Text style={styles.drawerName}>{selected.name}</Text>
              <StatusBadge status={selected.approvalStatus} />
            </View>

            <SectionHeader title="Contact" />
            <DetailRow label="Email" value={selected.email} theme={theme} />
            <DetailRow label="Phone" value={selected.phone} theme={theme} />
            <DetailRow label="City" value={selected.city} theme={theme} />

            <SectionHeader title="Professional" />
            <DetailRow label="Experience" value={selected.experience} theme={theme} />
            <DetailRow label="License" value={selected.licenseNumber} theme={theme} />
            <DetailRow label="Completed Lessons" value={String(selected.completedLessons)} theme={theme} />
            <DetailRow label="Rating" value={`${selected.rating}/5`} theme={theme} />

            <SectionHeader title="Financial" />
            <DetailRow label="Total Earnings" value={`\u00A3${selected.earningsTotal}`} theme={theme} />
            <DetailRow label="Pending Payment" value={`\u00A3${selected.pendingPayment}`} theme={theme} />
            <DetailRow label="Stripe Account" value={selected.stripeAccountId || 'Not connected'} theme={theme} />
            <DetailRow
              label="Stripe Status"
              value={selected.stripeConnectionStatus.replace('_', ' ')}
              theme={theme}
            />

            <SectionHeader title="Documents" />
            {selected.documentsUploaded.map(doc => (
              <View key={doc.id} style={styles.docItem}>
                <Ionicons name="document-outline" size={16} color={theme.colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docDate}>{doc.uploadedDate}</Text>
                </View>
                <StatusBadge status={doc.status} />
              </View>
            ))}
          </View>
        )}
      </DetailDrawer>
    </View>
  );
};

const DetailRow = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: AppTheme;
}) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    }}>
    <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textSecondary }}>
      {label}
    </Text>
    <Text
      style={{
        ...theme.typography.bodySmall,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        maxWidth: '55%',
        textAlign: 'right',
      }}>
      {value}
    </Text>
  </View>
);

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing['4xl'],
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    cardInfo: {
      flex: 1,
    },
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
    metaRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: 4,
    },
    metaItem: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    docsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    docsText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    docsBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
    },
    docsBadgeText: {
      ...theme.typography.caption,
      fontWeight: '600',
      fontSize: 10,
    },
    cardActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    approveBtn: {
      backgroundColor: theme.colors.success,
    },
    rejectBtn: {
      backgroundColor: theme.colors.error,
    },
    actionBtnText: {
      ...theme.typography.buttonSmall,
      color: '#fff',
      fontWeight: '600',
    },
    drawerContent: {
      paddingBottom: theme.spacing['2xl'],
    },
    drawerAvatar: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    drawerName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    docItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    docName: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    docDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
  });

export default AdminInstructorApprovalScreen;
