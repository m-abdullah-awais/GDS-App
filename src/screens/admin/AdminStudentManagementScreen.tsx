/**
 * GDS Driving School — AdminStudentManagementScreen
 * ===================================================
 * Full student roster with suspend / activate / delete actions.
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
import type { AdminStudent } from '../../store/admin/types';
import {
  suspendStudent,
  activateStudent,
  deleteStudent,
} from '../../store/admin/actions';
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
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
];

const AdminStudentManagementScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const students = useSelector((state: RootState) =>
    state.admin.students.filter(s => s.approvalStatus === 'approved'),
  );

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
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q),
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
    setTimeout(() => {
      switch (confirmType) {
        case 'suspend':
          dispatch(suspendStudent(selected.id));
          showToast('warning', `${selected.name} has been suspended`);
          break;
        case 'activate':
          dispatch(activateStudent(selected.id));
          showToast('success', `${selected.name} has been activated`);
          break;
        case 'delete':
          dispatch(deleteStudent(selected.id));
          showToast('error', `${selected.name} has been deleted`);
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

      {filtered.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No students found"
          subtitle="Try adjusting your search or filter criteria."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {filtered.map(student => (
            <TouchableOpacity
              key={student.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => {
                setSelected(student);
                setDrawerOpen(true);
              }}>
              <View style={styles.cardTop}>
                <Avatar initials={student.avatar} size={40} theme={theme} />
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
          ))}
        </ScrollView>
      )}

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
        {selected && (
          <View style={styles.drawerContent}>
            <View style={styles.drawerAvatar}>
              <Avatar initials={selected.avatar} size={64} theme={theme} />
              <Text style={styles.drawerName}>{selected.name}</Text>
              <StatusBadge status={selected.accountStatus} />
            </View>

            <SectionHeader title="Contact" />
            <DetailRow label="Email" value={selected.email} theme={theme} />
            <DetailRow label="Phone" value={selected.phone} theme={theme} />
            <DetailRow label="City" value={selected.city} theme={theme} />

            <SectionHeader title="Academic" />
            <DetailRow label="Lessons" value={String(selected.lessonsCompleted)} theme={theme} />
            <DetailRow label="Upcoming" value={String(selected.upcomingLessons)} theme={theme} />
            <DetailRow label="Rating" value={`${selected.rating}/5`} theme={theme} />
            <DetailRow label="Instructor" value={selected.instructorAssigned || 'N/A'} theme={theme} />

            {selected.lessons.length > 0 && (
              <>
                <SectionHeader title="Lesson History" />
                {selected.lessons.map(lesson => (
                  <View key={lesson.id} style={styles.lessonRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lessonTitle}>{lesson.type}</Text>
                      <Text style={styles.lessonSub}>
                        {lesson.date} at {lesson.time} ({lesson.duration})
                      </Text>
                    </View>
                    <StatusBadge status={lesson.status} />
                  </View>
                ))}
              </>
            )}
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
    drawerContent: { paddingBottom: theme.spacing['2xl'] },
    drawerAvatar: { alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    drawerName: { ...theme.typography.h3, color: theme.colors.textPrimary },
    lessonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    lessonTitle: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '600' },
    lessonSub: { ...theme.typography.caption, color: theme.colors.textTertiary },
  });

export default AdminStudentManagementScreen;