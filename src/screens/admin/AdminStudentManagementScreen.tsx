/**
 * GDS Driving School — AdminStudentManagementScreen
 * ===================================================
 * Full student roster with suspend / activate / delete actions.
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
import type { AdminStudent } from '../../store/admin/types';
import {
  suspendStudentThunk,
  activateStudentThunk,
  deleteStudentThunk,
} from '../../store/admin/thunks';
import {
  SearchBar,
  FilterChips,
  StatusBadge,
  UserAvatar,
  ConfirmModal,
  DetailDrawer,
  EmptyState,
  StudentDetailContent,
  useToast,
} from '../../components/admin';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
];

const AdminStudentManagementScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const allStudents = useSelector((state: RootState) => state.admin.students);
  const students = useMemo(
    () => allStudents.filter(s => s.approvalStatus === 'approved'),
    [allStudents],
  );

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
  const [selected, setSelected] = useState<AdminStudent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'suspend' | 'activate' | 'delete' | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = students;
    if (filter !== 'all') {
      list = list.filter(s => s.accountStatus === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        s =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.city || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [students, filter, search]);

  const openAction = useCallback(
    (student: AdminStudent, action: 'suspend' | 'activate' | 'delete') => {
      setSelected(student);
      setConfirmType(action);
    },
    [],
  );

  const executeAction = useCallback(() => {
    if (!selected || !confirmType) return;
    setConfirmLoading(true);
    let thunk: any;
    switch (confirmType) {
      case 'suspend': thunk = suspendStudentThunk(selected.id); break;
      case 'activate': thunk = activateStudentThunk(selected.id); break;
      case 'delete': thunk = deleteStudentThunk(selected.id); break;
    }
    dispatch(thunk as any)
      .then(() => {
        switch (confirmType) {
          case 'suspend': showToast('warning', `${selected.name} has been suspended`); break;
          case 'activate': showToast('success', `${selected.name} has been activated`); break;
          case 'delete': showToast('error', `${selected.name} has been deleted`); break;
        }
      })
      .catch(() => showToast('error', 'Operation failed. Please try again.'))
      .finally(() => {
        setConfirmLoading(false);
        setConfirmType(null);
        setSelected(null);
      });
  }, [selected, confirmType, dispatch, showToast]);

  const confirmConfig = useMemo(() => {
    switch (confirmType) {
      case 'suspend':
        return {
          title: 'Suspend Student',
          icon: 'pause-circle-outline' as const,
          variant: 'destructive' as const,
          label: 'Suspend',
        };
      case 'activate':
        return {
          title: 'Activate Student',
          icon: 'play-circle-outline' as const,
          variant: 'success' as const,
          label: 'Activate',
        };
      case 'delete':
        return {
          title: 'Delete Student',
          icon: 'trash-outline' as const,
          variant: 'destructive' as const,
          label: 'Delete',
        };
      default:
        return { title: '', icon: 'alert-outline' as const, variant: 'primary' as const, label: '' };
    }
  }, [confirmType]);

  if (!ready) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <SearchBar placeholder="Search approved students..." onSearch={setSearch} />
        <FilterChips options={FILTERS} activeValue={filter} onChange={setFilter} />
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
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
            icon="people-outline"
            title="No students found"
            subtitle="Try adjusting your search or filter criteria."
          />
        }
        renderItem={({ item: student }) => (
          <TouchableOpacity
            key={student.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
              setSelected(student);
              setDrawerOpen(true);
            }}>
            <View style={styles.cardTop}>
              <UserAvatar userId={student.id} name={student.name} size={40} theme={theme} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{student.name}</Text>
                <Text style={styles.cardSub}>{student.email}</Text>
                <Text style={styles.cardSub}>{student.city}</Text>
              </View>
              <StatusBadge status={student.accountStatus} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="book-outline" size={14} color={theme.colors.primary} />
                <Text style={styles.statValue}>{student.lessonsCompleted}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.warning} />
                <Text style={styles.statValue}>{student.upcomingLessons}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star-outline" size={14} color={theme.colors.accent} />
                <Text style={styles.statValue}>{student.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>

            <View style={styles.tapHint}>
              <Ionicons name="eye-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={styles.tapHintText}>Tap to view details</Text>
            </View>

            <View style={styles.cardActions}>
              {student.accountStatus === 'active' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.warningLight }]}
                  onPress={() => openAction(student, 'suspend')}>
                  <Ionicons name="pause-outline" size={14} color={theme.colors.warning} />
                  <Text style={[styles.actionBtnLabel, { color: theme.colors.warning }]}>Suspend</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.successLight }]}
                  onPress={() => openAction(student, 'activate')}>
                  <Ionicons name="play-outline" size={14} color={theme.colors.success} />
                  <Text style={[styles.actionBtnLabel, { color: theme.colors.success }]}>Activate</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.colors.errorLight }]}
                onPress={() => openAction(student, 'delete')}>
                <Ionicons name="trash-outline" size={14} color={theme.colors.error} />
                <Text style={[styles.actionBtnLabel, { color: theme.colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmType !== null}
        title={confirmConfig.title}
        message={`Are you sure you want to ${confirmType} ${selected?.name ?? 'this student'}?`}
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
        title="Student Profile">
        {selected && <StudentDetailContent student={selected} />}
      </DetailDrawer>
    </View>
  );
};


const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    toolbar: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    resultsRow: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs },
    resultsText: { ...theme.typography.caption, color: theme.colors.textTertiary },
    listContent: { padding: theme.spacing.md, gap: theme.spacing.sm, paddingBottom: theme.spacing['4xl'] },
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
    cardInfo: { flex: 1 },
    cardName: { ...theme.typography.bodyLarge, color: theme.colors.textPrimary, fontWeight: '600' },
    cardSub: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 2 },
    statsRow: {
      flexDirection: 'row',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
      gap: theme.spacing.lg,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    tapHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 4,
      marginTop: theme.spacing.xs,
    },
    tapHintText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      fontSize: 11,
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
    actionBtnLabel: {
      ...theme.typography.buttonSmall,
      fontWeight: '600',
    },
  });

export default AdminStudentManagementScreen;