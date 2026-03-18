/**
 * InstructorBookingRequestsScreen
 * =================================
 * Manages lesson booking requests (NOT connection requests).
 * Aligned with web's BookStudentLessons.tsx:
 *
 * Tab 1 — Student Requests: Pending booking requests from students → Approve/Decline
 * Tab 2 — Book Student: Send booking requests TO connected students (with date/time picker)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Avatar from '../../components/Avatar';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { db, firebaseAuth } from '../../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from '@react-native-firebase/firestore';
import {
  Collections,
  updateDoc,
  createDoc,
  toDate,
} from '../../utils/mappers';
import { useConfirmation } from '../../components/common';
import * as userService from '../../services/userService';

type TabKey = 'incoming' | 'book';

interface BookingRequest {
  id: string;
  studentId: string;
  studentName: string;
  instructorId: string;
  instructorName: string;
  date: string;
  rawDate: Date | null;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  requestedBy: string;
}

interface ConnectedStudent {
  id: string;
  name: string;
  avatar: string;
  remainingHours: number;
}

// ─── Time Slot Picker ─────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00',
];

const DURATIONS = [
  { label: '1h', value: 1 },
  { label: '1.5h', value: 1.5 },
  { label: '2h', value: 2 },
];

const generateDates = (): { label: string; value: string; date: Date }[] => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: d.toISOString().split('T')[0],
      date: d,
    });
  }
  return dates;
};

// ─── Component ────────────────────────────────────────────────────────────────

const InstructorBookingRequestsScreen = () => {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const { confirm } = useConfirmation();

  const [tab, setTab] = useState<TabKey>('incoming');
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectedStudents, setConnectedStudents] = useState<ConnectedStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Book Student form state
  const [selectedStudent, setSelectedStudent] = useState<ConnectedStudent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const instructorId = firebaseAuth.currentUser?.uid || '';
  const profile = useSelector((st: RootState) => st.auth.profile);
  const instructorName = profile?.full_name || '';

  const dates = useMemo(() => generateDates(), []);

  // ── Fetch pending booking requests (real-time) ──
  // Query by instructorId, filter status/requestedBy client-side.
  // Uses both camelCase and snake_case field variants.
  useEffect(() => {
    if (!instructorId) return;

    const allDocs = new Map<string, any>();
    const listeners: (() => void)[] = [];

    const processSnapshot = () => {
      const reqs: BookingRequest[] = [];
      // Use start of today for date comparison (don't filter out today's bookings)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      if (__DEV__) console.log('[BookingRequests] Processing', allDocs.size, 'docs');

      for (const [docId, data] of allDocs) {
        // Filter: only pending/amendment_pending statuses
        if (!['pending', 'amendment_pending'].includes(data.status)) continue;
        // Filter: only student-initiated requests for the "incoming" tab
        if (data.requestedBy === 'instructor') continue;

        const dateObj = toDate(data.date);
        // Only skip bookings from BEFORE today (keep today's and future)
        if (dateObj && dateObj < startOfToday) continue;

        reqs.push({
          id: docId,
          studentId: data.studentId || data.student_id || '',
          studentName: data.studentName || 'Student',
          instructorId: data.instructorId || data.instructor_id || '',
          instructorName: data.instructorName || '',
          date: dateObj
            ? dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
            : data.date || 'Unknown',
          rawDate: dateObj,
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          duration: typeof data.duration === 'number' ? data.duration : parseFloat(data.duration) || 1,
          status: data.status,
          requestedBy: data.requestedBy || 'student',
        });
      }

      reqs.sort((a, b) => {
        if (a.rawDate && b.rawDate) return a.rawDate.getTime() - b.rawDate.getTime();
        return 0;
      });
      setRequests(reqs);
      setLoading(false);
    };

    // Listener for camelCase instructorId
    listeners.push(
      onSnapshot(
        query(collection(db, Collections.BOOKING_REQUESTS), where('instructorId', '==', instructorId)),
        (snap) => {
          // Reset and rebuild from this snapshot
          for (const doc of snap.docs) allDocs.set(doc.id, doc.data());
          processSnapshot();
        },
        (err) => {
          if (__DEV__) console.warn('[BookingRequests] camelCase listener error:', err);
          setLoading(false);
        },
      ),
    );

    // Listener for snake_case instructor_id (graceful fallback)
    listeners.push(
      onSnapshot(
        query(collection(db, Collections.BOOKING_REQUESTS), where('instructor_id', '==', instructorId)),
        (snap) => {
          for (const doc of snap.docs) allDocs.set(doc.id, doc.data());
          processSnapshot();
        },
        (err) => {
          // Permission denied is OK — just means this variant doesn't exist
          if (__DEV__ && (err as any)?.code !== 'firestore/permission-denied') {
            console.warn('[BookingRequests] snake_case listener error:', err);
          }
        },
      ),
    );

    // Also do a one-time manual fetch as fallback
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, Collections.BOOKING_REQUESTS), where('instructorId', '==', instructorId)),
        );
        for (const doc of snap.docs) allDocs.set(doc.id, doc.data());
        processSnapshot();
      } catch (err) {
        if (__DEV__) console.warn('[BookingRequests] Manual fetch error:', err);
      }
      try {
        const snap = await getDocs(
          query(collection(db, Collections.BOOKING_REQUESTS), where('instructor_id', '==', instructorId)),
        );
        for (const doc of snap.docs) allDocs.set(doc.id, doc.data());
        processSnapshot();
      } catch (_e) {}
    })();

    return () => listeners.forEach(unsub => unsub());
  }, [instructorId]);

  // ── Fetch connected students for "Book Student" tab ──
  useEffect(() => {
    if (tab !== 'book' || !instructorId) return;
    let cancelled = false;
    setStudentsLoading(true);

    (async () => {
      try {
        // Get accepted connection requests (both field variants)
        const [snap1, snap2] = await Promise.all([
          getDocs(query(
            collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS),
            where('instructorId', '==', instructorId),
            where('status', 'in', ['accepted', 'confirmed']),
          )).catch(() => ({ docs: [] as any[] })),
          getDocs(query(
            collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS),
            where('instructor_id', '==', instructorId),
            where('status', 'in', ['accepted', 'confirmed']),
          )).catch(() => ({ docs: [] as any[] })),
        ]);

        const studentIdSet = new Set<string>();
        for (const doc of [...snap1.docs, ...snap2.docs]) {
          const d = doc.data();
          const sid = d.studentId || d.student_id || '';
          if (sid) studentIdSet.add(sid);
        }

        if (studentIdSet.size === 0) {
          if (!cancelled) { setConnectedStudents([]); setStudentsLoading(false); }
          return;
        }

        // Get assignments for remaining hours
        let hoursMap: Record<string, number> = {};
        try {
          const assignSnap = await getDocs(query(
            collection(db, Collections.ASSIGNMENTS),
            where('instructor_id', '==', instructorId),
          ));
          for (const doc of assignSnap.docs) {
            const data = doc.data();
            const sid = data.student_id || data.studentId || '';
            if (sid) hoursMap[sid] = (hoursMap[sid] || 0) + (data.remaining_hours || 0);
          }
        } catch (_e) {}

        // Get student profiles
        const students: ConnectedStudent[] = [];
        for (const sid of studentIdSet) {
          try {
            const user = await userService.getUserById(sid);
            if (user) {
              students.push({
                id: sid,
                name: user.full_name || 'Student',
                avatar: user.profile_picture_url || user.profileImage || '',
                remainingHours: hoursMap[sid] || 0,
              });
            }
          } catch (_e) {}
        }

        if (!cancelled) { setConnectedStudents(students); setStudentsLoading(false); }
      } catch (err) {
        if (__DEV__) console.warn('[BookingRequests] Failed to load students:', err);
        if (!cancelled) setStudentsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tab, instructorId]);

  // ── Approve booking request ──
  const handleApprove = useCallback(async (req: BookingRequest) => {
    setActionLoading(req.id);
    try {
      await updateDoc(Collections.BOOKING_REQUESTS, req.id, {
        status: 'accepted',
        respondedAt: new Date().toISOString(),
      });

      await createDoc(Collections.MESSAGES, {
        sender_id: instructorId,
        sender_name: instructorName,
        sender_role: 'instructor',
        receiver_id: req.studentId,
        receiver_name: req.studentName,
        receiver_role: 'student',
        content: `I have confirmed your lesson on ${req.date} at ${req.startTime}.`,
        read: false,
      });
    } catch (err) {
      if (__DEV__) console.error('[BookingRequests] Approve failed:', err);
    } finally {
      setActionLoading(null);
    }
  }, [instructorId, instructorName]);

  // ── Decline booking request ──
  const handleDecline = useCallback(async (req: BookingRequest) => {
    const shouldDecline = await confirm({
      title: 'Decline Booking',
      message: `Decline ${req.studentName}'s lesson on ${req.date} at ${req.startTime}?`,
      confirmLabel: 'Decline',
      cancelLabel: 'Keep',
      variant: 'destructive',
      icon: 'close-circle-outline',
    });
    if (!shouldDecline) return;

    setActionLoading(req.id);
    try {
      await updateDoc(Collections.BOOKING_REQUESTS, req.id, {
        status: 'declined',
        respondedAt: new Date().toISOString(),
      });

      // Refund hours
      try {
        const assignmentService = require('../../services/assignmentService');
        const assignment = await assignmentService.getAssignment(req.studentId, instructorId);
        if (assignment?.id) {
          const newHours = (assignment.remaining_hours || 0) + req.duration;
          await updateDoc(Collections.ASSIGNMENTS, assignment.id, { remaining_hours: newHours });
        }
      } catch (_e) {}

      await createDoc(Collections.MESSAGES, {
        sender_id: instructorId,
        sender_name: instructorName,
        sender_role: 'instructor',
        receiver_id: req.studentId,
        receiver_name: req.studentName,
        receiver_role: 'student',
        content: `I have declined your lesson request for ${req.date} at ${req.startTime}. Your hours have been refunded.`,
        read: false,
      });
    } catch (err) {
      if (__DEV__) console.error('[BookingRequests] Decline failed:', err);
    } finally {
      setActionLoading(null);
    }
  }, [confirm, instructorId, instructorName]);

  // ── Send booking to student (with date/time) ──
  const handleSendBooking = useCallback(async () => {
    if (!selectedStudent || !selectedDate || !selectedTime) return;

    setBookingInProgress(true);
    try {
      const dateObj = new Date(selectedDate);
      const dayOfWeek = dateObj.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // Calculate week offset
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      const weekOffset = Math.floor((dateObj.getTime() - startOfWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));

      // Calculate end time
      const [h, m] = selectedTime.split(':').map(Number);
      const endMinutes = h * 60 + m + selectedDuration * 60;
      const endH = Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      const dateLabel = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

      await createDoc(Collections.BOOKING_REQUESTS, {
        instructorId,
        instructor_id: instructorId,
        studentId: selectedStudent.id,
        student_id: selectedStudent.id,
        studentName: selectedStudent.name,
        instructorName,
        date: selectedDate,
        startTime: selectedTime,
        endTime,
        duration: selectedDuration,
        status: 'pending',
        requestedBy: 'instructor',
        week: weekOffset,
        day: dayIndex,
      });

      await createDoc(Collections.MESSAGES, {
        sender_id: instructorId,
        sender_name: instructorName,
        sender_role: 'instructor',
        receiver_id: selectedStudent.id,
        receiver_name: selectedStudent.name,
        receiver_role: 'student',
        content: `I have booked a lesson for you on ${dateLabel} at ${selectedTime} (${selectedDuration}h). Please go to 'My Lessons' to confirm this booking.`,
        read: false,
      });

      // Reset form
      setSelectedStudent(null);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedDuration(1);

      await confirm({
        title: 'Request Sent',
        message: `Booking request sent to ${selectedStudent.name} for ${dateLabel} at ${selectedTime}. They will be notified.`,
        confirmLabel: 'OK',
        cancelLabel: '',
        icon: 'checkmark-circle-outline',
      });
    } catch (err) {
      if (__DEV__) console.error('[BookingRequests] Book student failed:', err);
    } finally {
      setBookingInProgress(false);
    }
  }, [selectedStudent, selectedDate, selectedTime, selectedDuration, instructorId, instructorName, confirm]);

  // ── Render ──
  return (
    <ScreenContainer showHeader title="Booking Requests">
      {/* Tab pills */}
      <View style={s.tabRow}>
        <Pressable style={[s.tab, tab === 'incoming' && s.tabActive]} onPress={() => setTab('incoming')}>
          <Ionicons name="mail-outline" size={16} color={tab === 'incoming' ? theme.colors.textInverse : theme.colors.textSecondary} />
          <Text style={[s.tabText, tab === 'incoming' && s.tabTextActive]}>
            Student Requests{requests.length > 0 ? ` (${requests.length})` : ''}
          </Text>
        </Pressable>
        <Pressable style={[s.tab, tab === 'book' && s.tabActive]} onPress={() => setTab('book')}>
          <Ionicons name="add-circle-outline" size={16} color={tab === 'book' ? theme.colors.textInverse : theme.colors.textSecondary} />
          <Text style={[s.tabText, tab === 'book' && s.tabTextActive]}>Book Student</Text>
        </Pressable>
      </View>

      {/* ── Tab: Incoming ── */}
      {tab === 'incoming' && (
        loading ? (
          <View style={s.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
        ) : requests.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={s.emptyTitle}>No Pending Requests</Text>
            <Text style={s.emptySubtitle}>When students request lessons, they'll appear here for your approval.</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={item => item.id}
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => (
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Avatar initials={item.studentName} name={item.studentName} size={44} />
                  <View style={s.cardInfo}>
                    <Text style={s.cardName}>{item.studentName}</Text>
                    <Text style={s.cardMeta}>{item.date} at {item.startTime} – {item.endTime}</Text>
                    <Text style={s.cardDuration}>{item.duration}h lesson</Text>
                  </View>
                </View>
                <View style={s.cardActions}>
                  {actionLoading === item.id ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Pressable style={[s.actionBtn, { backgroundColor: theme.colors.success }]} onPress={() => handleApprove(item)}>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <Text style={s.actionText}>Approve</Text>
                      </Pressable>
                      <Pressable style={[s.actionBtn, { backgroundColor: theme.colors.error }]} onPress={() => handleDecline(item)}>
                        <Ionicons name="close" size={18} color="#fff" />
                        <Text style={s.actionText}>Decline</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            )}
          />
        )
      )}

      {/* ── Tab: Book Student ── */}
      {tab === 'book' && (
        studentsLoading ? (
          <View style={s.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
        ) : connectedStudents.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="people-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={s.emptyTitle}>No Connected Students</Text>
            <Text style={s.emptySubtitle}>Students need to connect with you and purchase a package first.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
            {/* Step 1: Select Student */}
            <Text style={s.stepLabel}>
              <Ionicons name="person-outline" size={15} color={theme.colors.primary} />
              {'  '}Select Student
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {connectedStudents.map(st => {
                const isSelected = selectedStudent?.id === st.id;
                return (
                  <Pressable
                    key={st.id}
                    style={[s.studentChip, isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight ?? theme.colors.surface }]}
                    onPress={() => setSelectedStudent(st)}>
                    <Avatar initials={st.name} imageUrl={st.avatar} size={32} />
                    <View>
                      <Text style={[s.studentChipName, isSelected && { color: theme.colors.primary }]}>{st.name}</Text>
                      <Text style={{ ...theme.typography.caption, color: st.remainingHours > 0 ? theme.colors.success : theme.colors.textTertiary }}>
                        {st.remainingHours > 0 ? `${st.remainingHours}h` : 'No hours'}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>

            {selectedStudent && (
              <>
                {/* Step 2: Select Date */}
                <Text style={[s.stepLabel, { marginTop: theme.spacing.lg }]}>
                  <Ionicons name="calendar-outline" size={15} color={theme.colors.primary} />
                  {'  '}Select Date
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                  {dates.map(d => {
                    const isSelected = selectedDate === d.value;
                    return (
                      <Pressable
                        key={d.value}
                        style={[s.dateChip, isSelected && { backgroundColor: theme.colors.primary }]}
                        onPress={() => { setSelectedDate(d.value); setSelectedTime(''); }}>
                        <Text style={[s.dateChipText, isSelected && { color: theme.colors.textInverse }]}>{d.label}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Step 3: Select Time */}
                {selectedDate && (
                  <>
                    <Text style={[s.stepLabel, { marginTop: theme.spacing.lg }]}>
                      <Ionicons name="time-outline" size={15} color={theme.colors.primary} />
                      {'  '}Select Time
                    </Text>
                    <View style={s.timeGrid}>
                      {TIME_SLOTS.map(t => {
                        const isSelected = selectedTime === t;
                        return (
                          <Pressable
                            key={t}
                            style={[s.timeChip, isSelected && { backgroundColor: theme.colors.primary }]}
                            onPress={() => setSelectedTime(t)}>
                            <Text style={[s.timeChipText, isSelected && { color: theme.colors.textInverse }]}>{t}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Step 4: Select Duration */}
                {selectedTime && (
                  <>
                    <Text style={[s.stepLabel, { marginTop: theme.spacing.lg }]}>
                      <Ionicons name="hourglass-outline" size={15} color={theme.colors.primary} />
                      {'  '}Duration
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {DURATIONS.map(d => {
                        const isSelected = selectedDuration === d.value;
                        return (
                          <Pressable
                            key={d.value}
                            style={[s.dateChip, { flex: 1 }, isSelected && { backgroundColor: theme.colors.primary }]}
                            onPress={() => setSelectedDuration(d.value)}>
                            <Text style={[s.dateChipText, { textAlign: 'center' }, isSelected && { color: theme.colors.textInverse }]}>{d.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Confirm Button */}
                {selectedDate && selectedTime && (
                  <Pressable
                    style={[s.confirmBtn, bookingInProgress && { opacity: 0.6 }]}
                    onPress={handleSendBooking}
                    disabled={bookingInProgress || selectedStudent.remainingHours <= 0}>
                    {bookingInProgress ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="send-outline" size={18} color="#fff" />
                        <Text style={s.confirmBtnText}>
                          Send Booking to {selectedStudent.name}
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}

                {selectedStudent.remainingHours <= 0 && (
                  <View style={s.warningBanner}>
                    <Ionicons name="alert-circle-outline" size={16} color={theme.colors.warning} />
                    <Text style={{ ...theme.typography.bodySmall, color: theme.colors.warning, flex: 1 }}>
                      {selectedStudent.name} has no remaining hours. They need to purchase a package first.
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )
      )}
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tabRow: { flexDirection: 'row', marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.lg, backgroundColor: theme.colors.surface },
    tabActive: { backgroundColor: theme.colors.primary },
    tabText: { ...theme.typography.buttonSmall, color: theme.colors.textSecondary },
    tabTextActive: { color: theme.colors.textInverse },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing['3xl'] },
    emptyTitle: { ...theme.typography.h3, color: theme.colors.textPrimary, marginTop: theme.spacing.md },
    emptySubtitle: { ...theme.typography.bodyMedium, color: theme.colors.textTertiary, textAlign: 'center', marginTop: theme.spacing.xs, lineHeight: 22 },
    listContent: { padding: theme.spacing.md, paddingBottom: theme.spacing['3xl'] },
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm, ...theme.shadows.sm },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    cardInfo: { flex: 1, marginLeft: theme.spacing.sm },
    cardName: { ...theme.typography.h4, color: theme.colors.textPrimary },
    cardMeta: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 2 },
    cardDuration: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 2 },
    cardActions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md },
    actionText: { ...theme.typography.buttonSmall, color: '#fff' },
    stepLabel: { ...theme.typography.h4, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    studentChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.sm, borderWidth: 2, borderColor: theme.colors.border, ...theme.shadows.sm },
    studentChipName: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '600' },
    dateChip: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    dateChipText: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '500' },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    timeChip: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border, minWidth: 64, alignItems: 'center' },
    timeChipText: { ...theme.typography.bodySmall, color: theme.colors.textPrimary, fontWeight: '500' },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.success, borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing.md, marginTop: theme.spacing.lg, ...theme.shadows.md },
    confirmBtnText: { ...theme.typography.buttonMedium, color: '#fff' },
    warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.warning + '14', borderRadius: theme.borderRadius.md, padding: theme.spacing.sm, marginTop: theme.spacing.sm },
  });

export default InstructorBookingRequestsScreen;
