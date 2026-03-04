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
import { collection, query, where, getDocs, orderBy, addDoc, updateDoc, onSnapshot, doc, getDoc } from '@react-native-firebase/firestore';
import type { BookingRequest, Booking } from '../types';

const sortBookingsByDateDesc = (bookings: Booking[]): Booking[] => {
  return [...bookings].sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
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
  const q = query(
    collection(db, Collections.BOOKING_REQUESTS),
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return fromQuerySnapshot<BookingRequest>(snap);
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
    console.error('[Firebase][BookingService] Error output: getInstructorBookingRequests', { instructorId, error });
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
  const emitMerged = async () => {
    const requests = await getInstructorBookingRequests(instructorId);
    callback(requests);
  };

  const unsubscribers = [
    onSnapshot(
      query(collection(db, Collections.BOOKING_REQUESTS), where('instructorId', '==', instructorId)),
      () => {
        emitMerged().catch(error => {
          console.error('[Firebase][BookingService] Error output: onInstructorBookingRequests(camel)', { instructorId, error });
        });
      },
      (error) => {
        console.error('[Firebase][BookingService] Error output: onInstructorBookingRequests(camel snapshot)', { instructorId, error });
      },
    ),
    onSnapshot(
      query(collection(db, Collections.BOOKING_REQUESTS), where('instructor_id', '==', instructorId)),
      () => {
        emitMerged().catch(error => {
          console.error('[Firebase][BookingService] Error output: onInstructorBookingRequests(snake)', { instructorId, error });
        });
      },
      (error) => {
        console.error('[Firebase][BookingService] Error output: onInstructorBookingRequests(snake snapshot)', { instructorId, error });
      },
    ),
  ];

  emitMerged().catch(error => {
    console.error('[Firebase][BookingService] Error output: onInstructorBookingRequests(initial)', { instructorId, error });
  });

  return () => {
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
      orderBy('createdAt', 'desc')
    ),
    (snap) => callback(fromQuerySnapshot<BookingRequest>(snap)),
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
    console.error('[Firebase][BookingService] Error output: getStudentBookings', { studentId, error });
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
    console.error('[Firebase][BookingService] Error output: getInstructorBookings', { instructorId, error });
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
  const emitMerged = async () => {
    const bookings = await getStudentBookings(studentId);
    callback(bookings);
  };

  const unsubscribers = [
    onSnapshot(
      query(collection(db, Collections.BOOKINGS), where('studentId', '==', studentId)),
      () => {
        emitMerged().catch(error => {
          console.error('[Firebase][BookingService] Error output: onStudentBookings(camel)', { studentId, error });
        });
      },
      (error) => {
        console.error('[Firebase][BookingService] Error output: onStudentBookings(camel snapshot)', { studentId, error });
      },
    ),
    onSnapshot(
      query(collection(db, Collections.BOOKINGS), where('student_id', '==', studentId)),
      () => {
        emitMerged().catch(error => {
          console.error('[Firebase][BookingService] Error output: onStudentBookings(snake)', { studentId, error });
        });
      },
      (error) => {
        console.error('[Firebase][BookingService] Error output: onStudentBookings(snake snapshot)', { studentId, error });
      },
    ),
  ];

  emitMerged().catch(error => {
    console.error('[Firebase][BookingService] Error output: onStudentBookings(initial)', { studentId, error });
  });

  return () => {
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
  const emitMerged = async () => {
    const bookings = await getInstructorBookings(instructorId);
    callback(bookings);
  };

  const unsubscribers = [
    onSnapshot(
      query(collection(db, Collections.BOOKINGS), where('instructorId', '==', instructorId)),
      () => {
        emitMerged().catch(error => {
          console.error('[Firebase][BookingService] Error output: onInstructorBookings(camel)', { instructorId, error });
        });
      },
      (error) => {
        console.error('[Firebase][BookingService] Error output: onInstructorBookings(camel snapshot)', { instructorId, error });
      },
    ),
    onSnapshot(
      query(collection(db, Collections.BOOKINGS), where('instructor_id', '==', instructorId)),
      () => {
        emitMerged().catch(error => {
          console.error('[Firebase][BookingService] Error output: onInstructorBookings(snake)', { instructorId, error });
        });
      },
      (error) => {
        console.error('[Firebase][BookingService] Error output: onInstructorBookings(snake snapshot)', { instructorId, error });
      },
    ),
  ];

  emitMerged().catch(error => {
    console.error('[Firebase][BookingService] Error output: onInstructorBookings(initial)', { instructorId, error });
  });

  return () => {
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

export const filterBookings = (
  bookings: Booking[],
  filter: 'upcoming' | 'completed' | 'cancelled',
): Booking[] => {
  switch (filter) {
    case 'upcoming':
      return bookings
        .filter(b => b.status === 'pending' || b.status === 'confirmed')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case 'completed':
      return bookings
        .filter(b => b.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case 'cancelled':
      return bookings
        .filter(b => b.status === 'cancelled')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
