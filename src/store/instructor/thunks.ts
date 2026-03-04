/**
 * GDS Driving School — Instructor Async Thunks
 * ===============================================
 * Async operations that fetch/mutate data via Firebase services
 * and dispatch actions to update the instructor Redux slice.
 */

import type { Dispatch } from 'redux';
import {
  setTimetable,
  setStudentRequests,
  setBookingRequests,
  setBookings,
  setPendingPackages,
  setPackages,
  setLessonCompletions,
  setInstructorPayments,
  setWeeklyPayment,
  setInstructorLoading,
  setInstructorError,
} from './instructorSlice';

import * as timetableService from '../../services/timetableService';
import * as requestService from '../../services/requestService';
import * as bookingService from '../../services/bookingService';
import * as packageService from '../../services/packageService';
import * as adminService from '../../services/adminService';

// ─── Load All Instructor Data ────────────────────────────────────────────────

/**
 * Load all initial data for the instructor role.
 * Called once after auth is confirmed as instructor.
 */
export const loadInstructorData = (instructorId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(setInstructorLoading(true));

    const [
      timetable,
      requests,
      bookingRequests,
      bookings,
      availablePackages,
      pendingPackages,
      payments,
      weeklyPayments,
    ] = await Promise.all([
      timetableService.getInstructorTimetable(instructorId),
      requestService.getInstructorRequests(instructorId),
      bookingService.getInstructorBookingRequests(instructorId),
      bookingService.getInstructorBookings(instructorId),
      packageService.getInstructorAvailablePackages(instructorId),
      packageService.getInstructorPendingPackages(instructorId),
      adminService.getInstructorPayments(instructorId),
      adminService.getWeeklyInstructorPayments(instructorId),
    ]);

    dispatch(setTimetable(timetable));
    dispatch(setStudentRequests(requests));
    dispatch(setBookingRequests(bookingRequests));
    dispatch(setBookings(bookings));
    dispatch(setPackages(availablePackages));
    dispatch(setPendingPackages(pendingPackages));
    dispatch(setInstructorPayments(payments));
    dispatch(setWeeklyPayment(weeklyPayments.length > 0 ? weeklyPayments[0] : null));
  } catch (error: any) {
    console.error('Failed to load instructor data:', error);
    dispatch(setInstructorError(error.message || 'Failed to load data'));
  } finally {
    dispatch(setInstructorLoading(false));
  }
};

// ─── Timetable ───────────────────────────────────────────────────────────────

/**
 * Save instructor availability/timetable.
 */
export const saveAvailabilityThunk = (
  instructorId: string,
  days: Record<string, any>,
) => async (dispatch: Dispatch) => {
  try {
    dispatch(setInstructorLoading(true));
    await timetableService.saveInstructorTimetableFromDays(instructorId, days);
    // Re-fetch to get server-updated version
    const updated = await timetableService.getInstructorTimetable(instructorId);
    dispatch(setTimetable(updated));
  } catch (error: any) {
    console.error('Failed to save availability:', error);
    dispatch(setInstructorError(error.message || 'Failed to save'));
    throw error;
  } finally {
    dispatch(setInstructorLoading(false));
  }
};

// ─── Student Request Actions ─────────────────────────────────────────────────

/**
 * Accept a student connection request.
 */
export const acceptStudentRequestThunk = (
  requestId: string,
) => async (dispatch: Dispatch) => {
  try {
    await requestService.updateRequestStatus(requestId, 'accepted');
    // Re-fetch requests to get updated list
    // Note: the real-time listener will also pick this up
  } catch (error) {
    console.error('Failed to accept request:', error);
    throw error;
  }
};

/**
 * Reject a student connection request.
 */
export const rejectStudentRequestThunk = (
  requestId: string,
) => async (dispatch: Dispatch) => {
  try {
    await requestService.updateRequestStatus(requestId, 'rejected');
  } catch (error) {
    console.error('Failed to reject request:', error);
    throw error;
  }
};

// ─── Booking Request Actions ─────────────────────────────────────────────────

/**
 * Confirm (approve) a booking request.
 */
export const confirmBookingRequestThunk = (
  requestId: string,
) => async (dispatch: Dispatch) => {
  try {
    await bookingService.updateBookingRequestStatus(requestId, 'accepted');
  } catch (error) {
    console.error('Failed to confirm booking:', error);
    throw error;
  }
};

/**
 * Reject a booking request.
 */
export const rejectBookingRequestThunk = (
  requestId: string,
) => async (dispatch: Dispatch) => {
  try {
    await bookingService.updateBookingRequestStatus(requestId, 'declined');
  } catch (error) {
    console.error('Failed to reject booking:', error);
    throw error;
  }
};

/**
 * Cancel a booking (by instructor).
 */
export const cancelBookingThunk = (
  bookingId: string,
  reason?: string,
) => async (dispatch: Dispatch) => {
  try {
    await bookingService.cancelBooking(bookingId, 'instructor', reason);
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    throw error;
  }
};

// ─── Package Actions ─────────────────────────────────────────────────────────

/**
 * Create a new available package.
 */
export const createPackageThunk = (data: {
  instructorId: string;
  name: string;
  description: string;
  price: number;
  totalLessons: number;
  duration: string;
  transmission: string;
}) => async (dispatch: Dispatch) => {
  try {
    dispatch(setInstructorLoading(true));
    await packageService.createAvailablePackage(data);
    // Re-fetch packages
    const [available, pending] = await Promise.all([
      packageService.getInstructorAvailablePackages(data.instructorId),
      packageService.getInstructorPendingPackages(data.instructorId),
    ]);
    dispatch(setPackages(available));
    dispatch(setPendingPackages(pending));
  } catch (error: any) {
    console.error('Failed to create package:', error);
    dispatch(setInstructorError(error.message || 'Failed to create package'));
    throw error;
  } finally {
    dispatch(setInstructorLoading(false));
  }
};

/**
 * Fetch instructor packages (available + pending).
 * Uses per-query fallback so one denied collection doesn't hide all package data.
 */
export const fetchInstructorPackagesThunk = (
  instructorId: string,
) => async (dispatch: Dispatch) => {
  try {
    dispatch(setInstructorLoading(true));

    const readOrFallback = async <T>(reader: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await reader();
      } catch (error: any) {
        if (error?.code === 'firestore/permission-denied') {
          console.warn('[Instructor] Firestore permission denied for one package query, using fallback data.');
          return fallback;
        }
        throw error;
      }
    };

    const [available, pending] = await Promise.all([
      readOrFallback(() => packageService.getInstructorAvailablePackages(instructorId), []),
      readOrFallback(() => packageService.getInstructorPendingPackages(instructorId), []),
    ]);

    dispatch(setPackages(available));
    dispatch(setPendingPackages(pending));
  } catch (error: any) {
    console.error('Failed to fetch instructor packages:', error);
    dispatch(setInstructorError(error.message || 'Failed to fetch packages'));
    throw error;
  } finally {
    dispatch(setInstructorLoading(false));
  }
};

/**
 * Update an existing package.
 */
export const updatePackageThunk = (
  packageId: string,
  data: Record<string, any>,
  instructorId: string,
) => async (dispatch: Dispatch) => {
  try {
    await packageService.updateAvailablePackage(packageId, data);
    // Re-fetch
    const available = await packageService.getInstructorAvailablePackages(instructorId);
    dispatch(setPackages(available));
  } catch (error) {
    console.error('Failed to update package:', error);
    throw error;
  }
};

/**
 * Deactivate a package.
 */
export const deactivatePackageThunk = (
  packageId: string,
  instructorId: string,
) => async (dispatch: Dispatch) => {
  try {
    await packageService.deactivateAvailablePackage(packageId);
    const available = await packageService.getInstructorAvailablePackages(instructorId);
    dispatch(setPackages(available));
  } catch (error) {
    console.error('Failed to deactivate package:', error);
    throw error;
  }
};

// ─── Real-time Listener Setup ────────────────────────────────────────────────

/**
 * Subscribe to all real-time instructor data updates.
 * Returns an array of unsubscribe functions.
 */
export const subscribeToInstructorData = (
  instructorId: string,
) => (dispatch: Dispatch): (() => void)[] => {
  const unsubscribers: (() => void)[] = [];

  // Timetable
  unsubscribers.push(
    timetableService.onInstructorTimetable(instructorId, (timetable) => {
      dispatch(setTimetable(timetable));
    }),
  );

  // Student requests
  unsubscribers.push(
    requestService.onInstructorRequests(instructorId, (requests) => {
      dispatch(setStudentRequests(requests));
    }),
  );

  // Booking requests
  unsubscribers.push(
    bookingService.onInstructorBookingRequests(instructorId, (requests) => {
      dispatch(setBookingRequests(requests));
    }),
  );

  // Bookings
  unsubscribers.push(
    bookingService.onInstructorBookings(instructorId, (bookings) => {
      dispatch(setBookings(bookings));
    }),
  );

  // Available packages
  unsubscribers.push(
    packageService.onInstructorAvailablePackages(instructorId, (packages) => {
      dispatch(setPackages(packages));
    }),
  );

  // Pending packages
  unsubscribers.push(
    packageService.onInstructorPendingPackages(instructorId, (packages) => {
      dispatch(setPendingPackages(packages));
    }),
  );

  return unsubscribers;
};
