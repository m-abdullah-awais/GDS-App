/**
 * GDS Driving School — Student Async Thunks
 * ============================================
 * Async operations that fetch real data from Firebase services
 * and dispatch actions to update the student Redux store.
 */

import type { Dispatch } from 'redux';
import {
  setInstructors,
  setMyInstructors,
  sendRequest,
  setPackages,
  purchasePackage,
  setAvailableSlots,
  bookLesson,
  cancelBooking,
  setLoading,
  updateRequestStatus,
} from './actions';

import * as userService from '../../services/userService';
import * as requestService from '../../services/requestService';
import * as packageService from '../../services/packageService';
import * as bookingService from '../../services/bookingService';
import * as timetableService from '../../services/timetableService';
import * as assignmentService from '../../services/assignmentService';
import * as paymentService from '../../services/paymentService';

import {
  mapUserToStudentInstructor,
  mapRequestToInstructorRequest,
  mapAvailablePackageToInstructorPackage,
  mapAssignmentToPurchasedPackage,
  mapBookingToBookedLesson,
  mapTimetableToAvailableSlots,
} from '../../utils/mappers';

import type { RootState } from '../index';

// ─── Load All Student Data ───────────────────────────────────────────────────

/**
 * Load all initial data for the student role.
 * Called once after auth is confirmed as student.
 */
export const loadStudentData = (studentId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading('searchLoading', true));

    // Fetch in parallel
    const [
      activeInstructors,
      studentRequests,
      studentAssignments,
      studentBookings,
    ] = await Promise.all([
      userService.getActiveInstructors(),
      requestService.getStudentRequests(studentId),
      assignmentService.getStudentAssignments(studentId),
      bookingService.getStudentBookings(studentId),
    ]);

    // Map instructors to view model
    const instructorVMs = activeInstructors.map(u => mapUserToStudentInstructor(u));
    dispatch(setInstructors(instructorVMs));

    // Map requests to view model
    const requestVMs = studentRequests.map(mapRequestToInstructorRequest);

    // Derive my instructors from accepted requests
    const acceptedInstructorIds = studentRequests
      .filter(r => r.status === 'accepted' || r.status === 'confirmed')
      .map(r => r.instructorId || r.instructor_id || '');
    const myInstructorVMs = instructorVMs.filter(i => acceptedInstructorIds.includes(i.id));
    dispatch(setMyInstructors(myInstructorVMs));

    // Set requests
    for (const req of requestVMs) {
      dispatch(sendRequest(req));
    }

    // Map assignments to purchased packages
    const purchasedVMs = studentAssignments.map(a => mapAssignmentToPurchasedPackage(a));
    for (const pkg of purchasedVMs) {
      dispatch(purchasePackage(pkg));
    }

    // Map bookings to lessons
    const lessonVMs = studentBookings.map(b => mapBookingToBookedLesson(b));
    for (const lesson of lessonVMs) {
      dispatch(bookLesson(lesson));
    }

    // Fetch packages for each connected instructor
    for (const instructorId of acceptedInstructorIds) {
      if (instructorId) {
        try {
          const avPkgs = await packageService.getInstructorAvailablePackages(instructorId);
          const pkgVMs = avPkgs.map(mapAvailablePackageToInstructorPackage);
          dispatch(setPackages(instructorId, pkgVMs));
        } catch (_e) {
          // Non-critical: continue if packages fail for one instructor
        }
      }
    }
  } catch (error) {
    console.error('Failed to load student data:', error);
  } finally {
    dispatch(setLoading('searchLoading', false));
  }
};

// ─── Instructor Search ───────────────────────────────────────────────────────

/**
 * Search/reload all active instructors.
 */
export const searchInstructorsThunk = () => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading('searchLoading', true));
    const instructors = await userService.getActiveInstructors();
    const mapped = instructors.map(u => mapUserToStudentInstructor(u));
    dispatch(setInstructors(mapped));
  } catch (error) {
    console.error('Failed to search instructors:', error);
  } finally {
    dispatch(setLoading('searchLoading', false));
  }
};

// ─── Instructor Request ──────────────────────────────────────────────────────

/**
 * Send a connection request to an instructor.
 */
export const sendInstructorRequestThunk = (
  studentId: string,
  instructorId: string,
  studentName?: string,
  studentEmail?: string,
) => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading('requestLoading', true));
    const requestId = await requestService.createStudentInstructorRequest({
      studentId,
      instructorId,
      studentName,
      studentEmail,
    });

    dispatch(sendRequest({
      id: requestId,
      instructorId,
      status: 'pending',
      sentDate: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to send request:', error);
    throw error;
  } finally {
    dispatch(setLoading('requestLoading', false));
  }
};

// ─── Package Operations ──────────────────────────────────────────────────────

/**
 * Fetch instructor's available packages.
 */
export const fetchInstructorPackagesThunk = (instructorId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading('packagesLoading', true));
    const packages = await packageService.getInstructorAvailablePackages(instructorId);
    const mapped = packages.map(mapAvailablePackageToInstructorPackage);
    dispatch(setPackages(instructorId, mapped));
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    throw error;
  } finally {
    dispatch(setLoading('packagesLoading', false));
  }
};

/**
 * Buy a package — creates a checkout session via Cloud Function.
 */
export const buyPackageThunk = (
  packageId: string,
  instructorId: string,
) => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading('packagesLoading', true));
    const result = await paymentService.createCheckoutSession({
      packageId,
      instructorId,
    });

    // Open checkout URL in browser if available
    if (result.url) {
      paymentService.openCheckoutInBrowser(result.url);
    }

    return result;
  } catch (error) {
    console.error('Failed to buy package:', error);
    throw error;
  } finally {
    dispatch(setLoading('packagesLoading', false));
  }
};

// ─── Booking Operations ──────────────────────────────────────────────────────

/**
 * Fetch available time slots for an instructor.
 */
export const fetchAvailableSlotsThunk = (
  instructorId: string,
) => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading('slotsLoading', true));
    const timetable = await timetableService.getInstructorTimetable(instructorId);
    if (timetable) {
      // Also fetch existing bookings to mark slots as booked
      const existingBookings = await bookingService.getInstructorBookings(instructorId);
      const bookedSlots = existingBookings
        .filter(b => b.status !== 'cancelled')
        .map(b => ({
          date: b.date ? new Date(b.date as any).toISOString().split('T')[0] : '',
          startTime: b.startTime || '',
        }));

      const slots = mapTimetableToAvailableSlots(timetable, instructorId, bookedSlots);
      dispatch(setAvailableSlots(slots));
    } else {
      dispatch(setAvailableSlots([]));
    }
  } catch (error) {
    console.error('Failed to fetch available slots:', error);
    throw error;
  } finally {
    dispatch(setLoading('slotsLoading', false));
  }
};

/**
 * Create a new booking request.
 */
export const createBookingThunk = (data: {
  studentId: string;
  instructorId: string;
  packageId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch(setLoading('bookingLoading', true));
    const bookingId = await bookingService.createBookingRequest(data);

    const state = getState();
    const instructor = state.student.instructors.find(i => i.id === data.instructorId);
    const allPkgs = state.student.packages[data.instructorId] || [];
    const pkg = allPkgs.find(p => p.id === data.packageId);

    dispatch(bookLesson({
      id: bookingId,
      instructorId: data.instructorId,
      instructorName: instructor?.name || '',
      instructorAvatar: instructor?.avatar || '',
      packageId: data.packageId,
      packageName: pkg?.name || '',
      date: data.date,
      time: data.startTime,
      duration: `${data.duration} min`,
      status: 'pending',
    }));

    return bookingId;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  } finally {
    dispatch(setLoading('bookingLoading', false));
  }
};

/**
 * Cancel a lesson booking.
 */
export const cancelLessonThunk = (
  bookingId: string,
  reason?: string,
) => async (dispatch: Dispatch) => {
  try {
    await bookingService.cancelBooking(bookingId, 'student', reason);
    dispatch(cancelBooking(bookingId, 'student'));
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    throw error;
  }
};

// ─── Real-time Listener Setup ────────────────────────────────────────────────

/**
 * Subscribe to real-time booking updates.
 * Returns unsubscribe function.
 */
export const subscribeToStudentBookings = (
  studentId: string,
) => (dispatch: Dispatch) => {
  return bookingService.onStudentBookings(studentId, (bookings) => {
    const mapped = bookings.map(b => mapBookingToBookedLesson(b));
    // Re-set lessons (replace all)
    // We use a workaround: dispatch setInstructors-style bulk set
    // Since there's no SET_LESSONS action, we'll update via individual actions
    // For now, the thunk-based initial load handles this
  });
};

/**
 * Subscribe to real-time request updates.
 * Returns unsubscribe function.
 */
export const subscribeToStudentRequests = (
  studentId: string,
) => (dispatch: Dispatch) => {
  return requestService.onStudentRequests(studentId, (requests) => {
    const mapped = requests.map(mapRequestToInstructorRequest);
    // Update request statuses based on latest data
    for (const req of mapped) {
      dispatch(updateRequestStatus(req.id, req.status, req.responseDate));
    }
  });
};
