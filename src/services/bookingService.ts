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
import type { BookingRequest, Booking } from '../types';

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
  const ref = await db.collection(Collections.BOOKING_REQUESTS).add({
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
  const snap = await db
    .collection(Collections.BOOKING_REQUESTS)
    .where('studentId', '==', studentId)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<BookingRequest>(snap);
};

/**
 * Get booking requests for an instructor.
 */
export const getInstructorBookingRequests = async (
  instructorId: string,
): Promise<BookingRequest[]> => {
  const snap = await db
    .collection(Collections.BOOKING_REQUESTS)
    .where('instructorId', '==', instructorId)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<BookingRequest>(snap);
};

/**
 * Subscribe to booking requests for an instructor (real-time).
 */
export const onInstructorBookingRequests = (
  instructorId: string,
  callback: (requests: BookingRequest[]) => void,
): (() => void) => {
  return db
    .collection(Collections.BOOKING_REQUESTS)
    .where('instructorId', '==', instructorId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
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
  return db
    .collection(Collections.BOOKING_REQUESTS)
    .where('studentId', '==', studentId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
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
  await db.collection(Collections.BOOKING_REQUESTS).doc(requestId).update({
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
  const snap = await db
    .collection(Collections.BOOKINGS)
    .where('studentId', '==', studentId)
    .orderBy('date', 'desc')
    .get();
  return fromQuerySnapshot<Booking>(snap);
};

/**
 * Get confirmed bookings for an instructor.
 */
export const getInstructorBookings = async (
  instructorId: string,
): Promise<Booking[]> => {
  const snap = await db
    .collection(Collections.BOOKINGS)
    .where('instructorId', '==', instructorId)
    .orderBy('date', 'desc')
    .get();
  return fromQuerySnapshot<Booking>(snap);
};

/**
 * Subscribe to student bookings (real-time).
 */
export const onStudentBookings = (
  studentId: string,
  callback: (bookings: Booking[]) => void,
): (() => void) => {
  return db
    .collection(Collections.BOOKINGS)
    .where('studentId', '==', studentId)
    .orderBy('date', 'desc')
    .onSnapshot(
      (snap) => callback(fromQuerySnapshot<Booking>(snap)),
    );
};

/**
 * Subscribe to instructor bookings (real-time).
 */
export const onInstructorBookings = (
  instructorId: string,
  callback: (bookings: Booking[]) => void,
): (() => void) => {
  return db
    .collection(Collections.BOOKINGS)
    .where('instructorId', '==', instructorId)
    .orderBy('date', 'desc')
    .onSnapshot(
      (snap) => callback(fromQuerySnapshot<Booking>(snap)),
    );
};

/**
 * Get a single booking by ID.
 */
export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  const snap = await db.collection(Collections.BOOKINGS).doc(bookingId).get();
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
  await db.collection(Collections.BOOKINGS).doc(bookingId).update({
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
