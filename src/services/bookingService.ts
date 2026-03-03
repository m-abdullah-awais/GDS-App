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
  const q = query(
    collection(db, Collections.BOOKING_REQUESTS),
    where('instructorId', '==', instructorId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return fromQuerySnapshot<BookingRequest>(snap);
};

/**
 * Subscribe to booking requests for an instructor (real-time).
 */
export const onInstructorBookingRequests = (
  instructorId: string,
  callback: (requests: BookingRequest[]) => void,
): (() => void) => {
  return onSnapshot(
    query(
      collection(db, Collections.BOOKING_REQUESTS),
      where('instructorId', '==', instructorId),
      orderBy('createdAt', 'desc')
    ),
    (snap) => callback(fromQuerySnapshot<BookingRequest>(snap)),
  );
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
  status: 'approved' | 'rejected' | 'cancelled',
  extras: Record<string, unknown> = {},
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.BOOKING_REQUESTS), requestId), {
    status,
    ...extras,
    updatedAt: serverTimestamp(),
  });
};

// ─── Confirmed Bookings ──────────────────────────────────────────────────────

/**
 * Get confirmed bookings for a student.
 */
export const getStudentBookings = async (
  studentId: string,
): Promise<Booking[]> => {
  const q = query(
    collection(db, Collections.BOOKINGS),
    where('studentId', '==', studentId)
  );
  const snap = await getDocs(q);
  return sortBookingsByDateDesc(fromQuerySnapshot<Booking>(snap));
};

/**
 * Get confirmed bookings for an instructor.
 */
export const getInstructorBookings = async (
  instructorId: string,
): Promise<Booking[]> => {
  const q = query(
    collection(db, Collections.BOOKINGS),
    where('instructorId', '==', instructorId)
  );
  const snap = await getDocs(q);
  return sortBookingsByDateDesc(fromQuerySnapshot<Booking>(snap));
};

/**
 * Subscribe to student bookings (real-time).
 */
export const onStudentBookings = (
  studentId: string,
  callback: (bookings: Booking[]) => void,
): (() => void) => {
  return onSnapshot(
    query(collection(db, Collections.BOOKINGS), where('studentId', '==', studentId)),
    (snap) => callback(sortBookingsByDateDesc(fromQuerySnapshot<Booking>(snap))),
  );
};

/**
 * Subscribe to instructor bookings (real-time).
 */
export const onInstructorBookings = (
  instructorId: string,
  callback: (bookings: Booking[]) => void,
): (() => void) => {
  return onSnapshot(
    query(collection(db, Collections.BOOKINGS), where('instructorId', '==', instructorId)),
    (snap) => callback(sortBookingsByDateDesc(fromQuerySnapshot<Booking>(snap))),
  );
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
