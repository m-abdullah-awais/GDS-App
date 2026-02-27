/**
 * GDS Driving School — AdminStudentApprovalScreen
 * =================================================
 * List pending / all student registrations with approve/reject actions.
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
import type { AdminStudent, ApprovalStatus } from '../../store/admin/types';
import { approveStudent, rejectStudent } from '../../store/admin/actions';
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

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const AdminStudentApprovalScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const students = useSelector((state: RootState) => state.admin.students);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = students;
    if (filter !== 'all') {
      list = list.filter(s => s.approvalStatus === filter);
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

  const handleApprove = useCallback(
    (student: AdminStudent) => {
      setSelectedStudent(student);
      setConfirmAction('approve');
    },
    [],
  );

  const handleReject = useCallback(
    (student: AdminStudent) => {
      setSelectedStudent(student);
      setConfirmAction('reject');
    },
    [],
  );

  const executeAction = useCallback(() => {
    if (!selectedStudent || !confirmAction) return;
    setConfirmLoading(true);
    setTimeout(() => {
      if (confirmAction === 'approve') {
        dispatch(approveStudent(selectedStudent.id));
        showToast('success', `${selectedStudent.name} has been approved`);
      } else {
        dispatch(rejectStudent(selectedStudent.id));
        showToast('error', `${selectedStudent.name} has been rejected`);
      }
      setConfirmLoading(false);
      setConfirmAction(null);
      setSelectedStudent(null);
    }, 600);
  }, [selectedStudent, confirmAction, dispatch, showToast]);

  const openDrawer = useCallback((student: AdminStudent) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  }, []);

  return (
    <View style={styles.screen}>
      {/* Search & Filters */}
      <View style={styles.toolbar}>
        <SearchBar placeholder="Search students..." onSearch={setSearch} />
        <FilterChips
          options={FILTERS}
          activeValue={filter}
          onChange={setFilter}
        />
      </View>

      {/* Results Count */}
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
              onPress={() => openDrawer(student)}>
              <View style={styles.cardHeader}>
                <Avatar initials={student.avatar} size={40} theme={theme} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{student.name}</Text>
                  <Text style={styles.cardSub}>{student.email}</Text>
                  <Text style={styles.cardSub}>
                    {student.city} | Registered: {student.registrationDate}
                  </Text>
                </View>
                <StatusBadge status={student.approvalStatus} />
              </View>

              {student.approvalStatus === 'pending' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleApprove(student)}>
                    <Ionicons name="checkmark-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleReject(student)}>
                    <Ionicons name="close-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmAction !== null}
        title={confirmAction === 'approve' ? 'Approve Student' : 'Reject Student'}
        message={`Are you sure you want to ${confirmAction} ${selectedStudent?.name ?? 'this student'}?`}
        icon={confirmAction === 'approve' ? 'checkmark-circle-outline' : 'close-circle-outline'}
        variant={confirmAction === 'approve' ? 'success' : 'destructive'}
        confirmLabel={confirmAction === 'approve' ? 'Approve' : 'Reject'}
        loading={confirmLoading}
        onConfirm={executeAction}
        onCancel={() => {
          setConfirmAction(null);
          setSelectedStudent(null);
        }}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        visible={drawerOpen && confirmAction === null}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedStudent(null);
        }}
        title="Student Details">
        {selectedStudent && (
          <View style={styles.drawerContent}>
            <View style={styles.drawerAvatar}>
              <Avatar
                initials={selectedStudent.avatar}
                size={64}
                theme={theme}
              />
              <Text style={styles.drawerName}>{selectedStudent.name}</Text>
              <StatusBadge status={selectedStudent.approvalStatus} />
            </View>

            <SectionHeader title="Contact" />
            <DetailRow label="Email" value={selectedStudent.email} theme={theme} />
            <DetailRow label="Phone" value={selectedStudent.phone} theme={theme} />
            <DetailRow label="City" value={selectedStudent.city} theme={theme} />

            <SectionHeader title="Academic" />
            <DetailRow label="Lessons Completed" value={String(selectedStudent.lessonsCompleted)} theme={theme} />
            <DetailRow label="Upcoming Lessons" value={String(selectedStudent.upcomingLessons)} theme={theme} />
            <DetailRow label="Rating" value={`${selectedStudent.rating}/5`} theme={theme} />
            <DetailRow label="Instructor" value={selectedStudent.instructorAssigned || 'Not assigned'} theme={theme} />

            <SectionHeader title="Registration" />
            <DetailRow label="Date" value={selectedStudent.registrationDate} theme={theme} />
            <DetailRow label="Account Status" value={selectedStudent.accountStatus} theme={theme} />

            {selectedStudent.lessons.length > 0 && (
              <>
                <SectionHeader title="Recent Lessons" />
                {selectedStudent.lessons.slice(0, 3).map(lesson => (
                  <View key={lesson.id} style={styles.lessonRow}>
                    <Text style={styles.lessonText}>
                      {lesson.date} - {lesson.type}
                    </Text>
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
    lessonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    lessonText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
  });

export default AdminStudentApprovalScreen;
