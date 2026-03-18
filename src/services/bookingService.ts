/**
 * GDS Driving School — Booking Service
 * =======================================
 * Firestore operations for bookingRequests & bookings collections.
 * Replaces the legacy mock-data version.
 */

import { db } from '../config/firebase';
import {
  Collections,
  fromQuerySnapshot,
  fromSnapshot,
  serverTimestamp,
  withDualIds,
} from '../utils/mappers';
import { collection, query, where, getDocs, addDoc, updateDoc, onSnapshot, doc, getDoc } from '@react-native-firebase/firestore';
import type { BookingRequest, Booking } from '../types';

const sortBookingsByDateDesc = (bookings: Booking[]): Booking[] => {
  return [...bookings].sort((a, b) => {
    const aTime = new Date(a.date as any).getTime();
    const bTime = new Date(b.date as any).getTime();
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  });
};

const toMillis = (value: unknown): number => {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }

  const maybeTimestamp = value as { toDate?: () => Date };
  if (typeof maybeTimestamp.toDate === 'function') {
    return maybeTimestamp.toDate().getTime();
  }

  return 0;
};

const sortBookingRequestsByCreatedAtDesc = (requests: BookingRequest[]): BookingRequest[] => {
  return [...requests].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
};

// ─── Booking Requests (student → instructor) ─────────────────────────────────

/**
 * Create a lesson booking request.
 */
export const createBookingRequest = async (data: {
  studentId: string;
  instructorId: string;
  packageId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  notes?: string;
  studentName?: string;
  instructorName?: string;
  week?: number;
  day?: number;
  requestedBy?: 'student' | 'instructor';
}): Promise<string> => {
  const ref = await addDoc(collection(db, Collections.BOOKING_REQUESTS), {
    ...withDualIds(data.studentId, data.instructorId),
    packageId: data.packageId,
    package_id: data.packageId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    duration: data.duration,
    notes: data.notes || '',
    studentName: data.studentName || '',
    instructorName: data.instructorName || '',
    week: data.week ?? 0,
    day: data.day ?? 0,
    requestedBy: data.requestedBy || 'student',
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Get booking requests for a student.
 */
export const getStudentBookingRequests = async (
  studentId: string,
): Promise<BookingRequest[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.BOOKING_REQUESTS),
      where('studentId', '==', studentId),
    ),
  );
  return sortBookingRequestsByCreatedAtDesc(fromQuerySnapshot<BookingRequest>(snap));
};

/**
 * Get booking requests for an instructor.
 */
export const getInstructorBookingRequests = async (
  instructorId: string,
): Promise<BookingRequest[]> => {
  try {
    const [camelSnap, snakeSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, Collections.BOOKING_REQUESTS),
          where('instructorId', '==', instructorId),
        ),
      ),
      getDocs(
        query(
          collection(db, Collections.BOOKING_REQUESTS),
          where('instructor_id', '==', instructorId),
        ),
      ),
    ]);

    const merged = new Map<string, BookingRequest>();
    for (const item of [
      ...fromQuerySnapshot<BookingRequest>(camelSnap),
      ...fromQuerySnapshot<BookingRequest>(snakeSnap),
    ]) {
      merged.set(item.id, item);
    }

    return sortBookingRequestsByCreatedAtDesc(Array.from(merged.values()));
  } catch (error) {
    if (__DEV__) console.error('[BookingService] getInstructorBookingRequests error:', { instructorId, error });
    throw error;
  }
};

/**
 * Subscribe to booking requests for an instructor (real-time).
 */
export const onInstructorBookingRequests = (
  instructorId: string,
  callback: (requests: BookingRequest[]) => void,
): (() => void) => {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const emitMerged = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const requests = await getInstructorBookingRequests(instructorId);
        callback(requests);
      } catch (error) {
        if (__DEV__) console.error('[BookingService] onInstructorBookingRequests error:', error);
      }
    }, 300); // 300ms debounce to prevent cascade
  };

  const unsubscribers = [
    onSnapshot(
      query(collection(db, Collections.BOOKING_REQUESTS), where('instructorId', '==', instructorId)),
      () => emitMerged(),
      (error) => { if (__DEV__) console.error('[BookingService] onInstructorBookingRequests camel error:', error); },
    ),
    onSnapshot(
      query(collection(db, Collections.BOOKING_REQUESTS), where('instructor_id', '==', instructorId)),
      () => emitMerged(),
      (error) => { if (__DEV__) console.error('[BookingService] onInstructorBookingRequests snake error:', error); },
    ),
  ];

  // Initial load
  emitMerged();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribers.forEach(unsub => unsub());
  };
};

/**
 * Subscribe to booking requests for a student (real-time).
 */
export const onStudentBookingRequests = (
  studentId: string,
  callback: (requests: BookingRequest[]) => void,
): (() => void) => {
  return onSnapshot(
    query(
      collection(db, Collections.BOOKING_REQUESTS),
      where('studentId', '==', studentId),
    ),
    (snap) => callback(sortBookingRequestsByCreatedAtDesc(fromQuerySnapshot<BookingRequest>(snap))),
    (error) => { if (__DEV__) console.error('[BookingService] onStudentBookingRequests error:', error); },
  );
};

/**
 * Update booking request status (approve / reject).
 */
export const updateBookingRequestStatus = async (
  requestId: string,
  status: 'accepted' | 'declined' | 'cancelled' | 'amendment_pending' | 'completed',
  extras: Record<string, unknown> = {},
): Promise<void> => {
  const updateData: Record<string, unknown> = {
    status,
    ...extras,
  };
  // Add the appropriate timestamp based on status (matches web)
  if (status === 'accepted') {
    updateData.respondedAt = serverTimestamp();
  } else if (status === 'declined') {
    updateData.declinedAt = serverTimestamp();
  } else if (status === 'completed') {
    updateData.completedAt = serverTimestamp();
  }
  updateData.updatedAt = serverTimestamp();

  await updateDoc(doc(collection(db, Collections.BOOKING_REQUESTS), requestId), updateData as Record<string, any>);
};

// ─── Confirmed Bookings ──────────────────────────────────────────────────────

/**
 * Get confirmed bookings for a student.
 */
export const getStudentBookings = async (
  studentId: string,
): Promise<Booking[]> => {
  try {
    const [camelSnap, snakeSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, Collections.BOOKINGS),
          where('studentId', '==', studentId),
        ),
      ),
      getDocs(
        query(
          collection(db, Collections.BOOKINGS),
          where('student_id', '==', studentId),
        ),
      ),
    ]);

    const merged = new Map<string, Booking>();
    for (const item of [
      ...fromQuerySnapshot<Booking>(camelSnap),
      ...fromQuerySnapshot<Booking>(snakeSnap),
    ]) {
      merged.set(item.id, item);
    }

    return sortBookingsByDateDesc(Array.from(merged.values()));
  } catch (error) {
    if (__DEV__) console.error('[BookingService] getStudentBookings error:', { studentId, error });
    throw error;
  }
};

/**
 * Get confirmed bookings for an instructor.
 */
export const getInstructorBookings = async (
  instructorId: string,
): Promise<Booking[]> => {
  try {
    const [camelSnap, snakeSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, Collections.BOOKINGS),
          where('instructorId', '==', instructorId),
        ),
      ),
      getDocs(
        query(
          collection(db, Collections.BOOKINGS),
          where('instructor_id', '==', instructorId),
        ),
      ),
    ]);

    const merged = new Map<string, Booking>();
    for (const item of [
      ...fromQuerySnapshot<Booking>(camelSnap),
      ...fromQuerySnapshot<Booking>(snakeSnap),
    ]) {
      merged.set(item.id, item);
    }

    return sortBookingsByDateDesc(Array.from(merged.values()));
  } catch (error) {
    if (__DEV__) console.error('[BookingService] getInstructorBookings error:', { instructorId, error });
    throw error;
  }
};

/**
 * Subscribe to student bookings (real-time).
 */
export const onStudentBookings = (
  studentId: string,
  callback: (bookings: Booking[]) => void,
): (() => void) => {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const emitMerged = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const bookings = await getStudentBookings(studentId);
        callback(bookings);
      } catch (error) {
        if (__DEV__) console.error('[BookingService] onStudentBookings error:', error);
      }
    }, 300); // 300ms debounce to prevent cascade
  };

  const unsubscribers = [
    onSnapshot(
      query(collection(db, Collections.BOOKINGS), where('studentId', '==', studentId)),
      () => emitMerged(),
      (error) => { if (__DEV__) console.error('[BookingService] onStudentBookings camel error:', error); },
    ),
    onSnapshot(
      query(collection(db, Collections.BOOKINGS), where('student_id', '==', studentId)),
      () => emitMerged(),
      (error) => { if (__DEV__) console.error('[BookingService] onStudentBookings snake error:', error); },
    ),
  ];

  // Initial load
  emitMerged();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribers.forEach(unsub => unsub());
  };
};

/**
 * Subscribe to instructor bookings (real-time).
 */
export const onInstructorBookings = (
  instructorId: string,
  callback: (bookings: Booking[]) => void,
): (() => void) => {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const emitMerged = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const bookings = await getInstructorBookings(instructorId);
        callback(bookings);
      } catch (error) {
        if (__DEV__) console.error('[BookingService] onInstructorBookings error:', error);
      }
    }, 300); // 300ms debounce to prevent cascade
  };

  const unsubscribers = [
    onSnapshot(
      query(collection(db, Collections.BOOKINGS), where('instructorId', '==', instructorId)),
      () => emitMerged(),
      (error) => { if (__DEV__) console.error('[BookingService] onInstructorBookings camel error:', error); },
    ),
    onSnapshot(
      query(collection(db, Collections.BOOKINGS), where('instructor_id', '==', instructorId)),
      () => emitMerged(),
      (error) => { if (__DEV__) console.error('[BookingService] onInstructorBookings snake error:', error); },
    ),
  ];

  // Initial load
  emitMerged();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribers.forEach(unsub => unsub());
  };
};

/**
 * Get a single booking by ID.
 */
export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  const snap = await getDoc(doc(collection(db, Collections.BOOKINGS), bookingId));
  return fromSnapshot<Booking>(snap);
};

/**
 * Cancel a booking.
 */
export const cancelBooking = async (
  bookingId: string,
  cancelledBy: 'student' | 'instructor',
  reason?: string,
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.BOOKINGS), bookingId), {
    status: 'cancelled',
    cancelledBy,
    cancellationReason: reason || '',
    cancelledAt: serverTimestamp(),
  });
};

// ─── Utility: filter bookings by status (client-side) ────────────────────────

export const filterBookings = <T extends { status: string; date?: any }>(
  bookings: T[],
  filter: 'upcoming' | 'completed' | 'cancelled',
): T[] => {
  switch (filter) {
    case 'upcoming':
      return bookings
        .filter(b => b.status === 'pending' || b.status === 'confirmed' || b.status === 'accepted' || b.status === 'amendment_pending')
        .sort((a, b) => new Date(a.date as any).getTime() - new Date(b.date as any).getTime());
    case 'completed':
      return bookings
        .filter(b => b.status === 'completed')
        .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime());
    case 'cancelled':
      return bookings
        .filter(b => b.status === 'cancelled')
        .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime());
    default:
      return bookings;
  }
};

// Backward-compatible aliases used by existing screens
export const filterLessons = filterBookings;

export const cancelLessonBooking = async (
  bookingId: string,
  cancelledBy: 'student' | 'instructor',
  _dispatch?: unknown,
): Promise<void> => {
  await cancelBooking(bookingId, cancelledBy);
};

// ─── Screen-level wrapper functions ──────────────────────────────────────────
// These bridge service calls with Redux dispatch for use directly in screens.
// NOTE: Uses lazy requires to avoid circular dependency with store/student.

import type { AvailableSlot, PurchasedPackage, BookedLesson } from '../store/student/types';

/**
 * Fetch available slots for an instructor and dispatch to Redux.
 * Uses bookingRequests (filtered by studentId) instead of bookings
 * (filtered by instructorId) to respect Firestore security rules.
 * This matches the web's StudentLiveTimetable approach.
 * Used by StudentBookLessonsScreen.
 */
export const fetchAvailableSlots = async (
  instructorId: string,
  dispatch: (action: any) => void,
): Promise<void> => {
  // Lazy require to break circular dependency
  const actions = require('../store/student/actions');
  const { mapTimetableToAvailableSlots } = require('../utils/mappers');
  const timetableService = require('./timetableService');

  try {
    dispatch(actions.setLoading('slotsLoading', true));
    const timetable = await timetableService.getInstructorTimetable(instructorId);
    if (timetable) {
      // Use bookingRequests filtered by studentId (like web) instead of
      // bookings by instructorId which causes permission-denied errors.
      const { firebaseAuth } = require('../config/firebase');
      const currentUserId = firebaseAuth.currentUser?.uid;
      let bookedSlots: Array<{ date: string; startTime: string }> = [];

      if (currentUserId) {
        try {
          // Query bookingRequests for this student + instructor (active statuses only)
          const bookingRequestsSnap = await getDocs(
            query(
              collection(db, Collections.BOOKING_REQUESTS),
              where('studentId', '==', currentUserId),
              where('instructorId', '==', instructorId),
              where('status', 'in', ['pending', 'accepted', 'amendment_pending']),
            ),
          );

          bookedSlots = bookingRequestsSnap.docs.map((doc: any) => {
            const data = doc.data();
            const dateVal = data.date;
            let dateStr = '';
            if (typeof dateVal === 'string') {
              dateStr = dateVal.split('T')[0];
            } else if (dateVal?.toDate) {
              dateStr = dateVal.toDate().toISOString().split('T')[0];
            } else if (dateVal instanceof Date) {
              dateStr = dateVal.toISOString().split('T')[0];
            }
            return {
              date: dateStr,
              startTime: data.startTime || '',
            };
          });
        } catch (err) {
          if (__DEV__) console.warn('[BookingService] Could not fetch booking requests for slot check:', err);
        }
      }

      const slots = mapTimetableToAvailableSlots(timetable, instructorId, bookedSlots);
      dispatch(actions.setAvailableSlots(slots));
    } else {
      dispatch(actions.setAvailableSlots([]));
    }
  } catch (error) {
    if (__DEV__) console.error('[BookingService] fetchAvailableSlots error:', error);
    dispatch(actions.setAvailableSlots([]));
  } finally {
    dispatch(actions.setLoading('slotsLoading', false));
  }
};

/**
 * Get available slots for a specific date (pure client-side filter).
 * Used by StudentBookLessonsScreen.
 */
export const getSlotsForDate = (
  slots: AvailableSlot[],
  instructorId: string,
  date: string,
): AvailableSlot[] => {
  return slots.filter(
    s => s.instructorId === instructorId && s.date === date && !s.booked,
  );
};

/**
 * Validate a booking slot against existing lessons (pure client-side).
 * Used by StudentBookLessonsScreen.
 */
export const validateBooking = (
  slot: AvailableSlot,
  lessons: BookedLesson[],
  purchasedPkg: PurchasedPackage,
): { valid: boolean; error?: string } => {
  // Check if slot is already booked
  if (slot.booked) {
    return { valid: false, error: 'This slot is already booked.' };
  }

  // Check if student already has a lesson at this time
  const conflict = lessons.find(
    l =>
      l.date === slot.date &&
      l.time === slot.startTime &&
      (l.status === 'pending' || l.status === 'confirmed'),
  );
  if (conflict) {
    return { valid: false, error: 'You already have a lesson at this time.' };
  }

  // Check if package has remaining lessons
  const remaining = (purchasedPkg.totalLessons || 0) - (purchasedPkg.lessonsUsed || 0);
  if (remaining <= 0) {
    return { valid: false, error: 'No remaining lessons in this package.' };
  }

  return { valid: true };
};

/**
 * Create a booking and dispatch to Redux.
 * Aligned with web's StudentLiveTimetable confirmBooking:
 *   - Includes `requestedBy`, `week`, `day` fields
 *   - Deducts hours from assignment immediately (refunded if declined)
 *   - Sends notification message to instructor
 * Used by StudentBookLessonsScreen.
 */
export const createBooking = async (
  instructorId: string,
  instructorName: string,
  instructorAvatar: string,
  packageId: string,
  packageName: string,
  slot: AvailableSlot,
  dispatch: (action: any) => void,
): Promise<string> => {
  const actions = require('../store/student/actions');

  try {
    dispatch(actions.setLoading('bookingLoading', true));
    // Get current user ID for the booking
    const { firebaseAuth } = require('../config/firebase');
    const currentUserId = firebaseAuth.currentUser?.uid;
    if (!currentUserId) {
      throw new Error('User not authenticated. Please sign in and try again.');
    }

    // Calculate week offset and day index from slot date (like web)
    const slotDate = new Date(slot.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
    const weekOffset = Math.floor((slotDate.getTime() - startOfWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const dayOfWeek = slotDate.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6

    // Get student name for the booking request
    let studentName = '';
    try {
      const authStore = require('../store');
      const state = authStore.default?.getState?.();
      studentName = state?.auth?.profile?.full_name || '';
    } catch (_e) {
      // Safe fallback if store not accessible
    }

    const bookingId = await createBookingRequest({
      studentId: currentUserId,
      instructorId,
      packageId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      instructorName,
      studentName,
      requestedBy: 'student',
      week: weekOffset,
      day: dayIndex,
    });

    // Deduct hours from assignment immediately (like web — refunded if declined)
    try {
      const assignmentService = require('./assignmentService');
      const assignment = await assignmentService.getAssignment(currentUserId, instructorId);
      if (assignment && assignment.id) {
        const { updateDoc: mapperUpdateDoc } = require('../utils/mappers');
        const slotDuration = parseFloat(slot.duration) || 1;
        const newHours = Math.max(0, (assignment.remaining_hours || 0) - slotDuration);
        await mapperUpdateDoc('assignments', assignment.id, { remaining_hours: newHours });
      }
    } catch (err) {
      if (__DEV__) console.warn('[BookingService] Could not deduct hours from assignment:', err);
    }

    // Send notification message to instructor (like web)
    try {
      const { createDoc: mapperCreateDoc } = require('../utils/mappers');
      const { serverTimestamp: getServerTimestamp } = require('../utils/mappers');
      await mapperCreateDoc('messages', {
        sender_id: currentUserId,
        sender_name: studentName,
        sender_role: 'student',
        receiver_id: instructorId,
        receiver_name: instructorName,
        receiver_role: 'instructor',
        content: `New booking request: ${slot.date} at ${slot.startTime} (${slot.duration}). Credits have been reserved.`,
        read: false,
      });
    } catch (err) {
      if (__DEV__) console.warn('[BookingService] Could not send booking notification:', err);
    }

    dispatch(actions.bookLesson({
      id: bookingId,
      instructorId,
      instructorName,
      instructorAvatar,
      packageId,
      packageName,
      date: slot.date,
      time: slot.startTime,
      duration: slot.duration,
      status: 'pending',
    }));

    return bookingId;
  } catch (error) {
    if (__DEV__) console.error('[BookingService] createBooking error:', error);
    throw error;
  } finally {
    dispatch(actions.setLoading('bookingLoading', false));
  }
};
