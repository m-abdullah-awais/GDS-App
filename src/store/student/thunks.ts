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
  setRequests,
  setPackages,
  purchasePackage,
  setPurchasedPackages,
  setAvailableSlots,
  bookLesson,
  setLessons,
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
    if (__DEV__) console.log('[Firebase][StudentThunk] Data request triggered: loadStudentData', { studentId });

    const readOrFallback = async <T>(reader: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await reader();
      } catch (error: any) {
        if (error?.code === 'firestore/permission-denied') {
          if (__DEV__) console.info('[Student] Firestore permission denied for one query, using fallback data.');
          return fallback;
        }
        // Also fallback on network errors to prevent entire dashboard from failing
        if (error?.code === 'firestore/unavailable' || error?.message?.includes('network')) {
          if (__DEV__) console.warn('[Student] Network error for one query, using fallback data.');
          return fallback;
        }
        if (__DEV__) console.error('[Student] Unexpected error in query:', error);
        return fallback;
      }
    };

    // Fetch in parallel with per-query fallback so one denied collection doesn't block the dashboard
    const [activeInstructors, studentRequests, studentAssignments, studentBookings, studentBookingRequests] = await Promise.all([
      readOrFallback(() => userService.getActiveInstructors(), []),
      readOrFallback(() => requestService.getStudentRequests(studentId), []),
      readOrFallback(() => assignmentService.getStudentAssignments(studentId), []),
      readOrFallback(() => bookingService.getStudentBookings(studentId), []),
      readOrFallback(() => bookingService.getStudentBookingRequests(studentId), []),
    ]);

    if (__DEV__) console.log('[Firebase][StudentThunk] Data received: loadStudentData', {
      studentId,
      instructors: activeInstructors.length,
      requests: studentRequests.length,
      assignments: studentAssignments.length,
      bookings: studentBookings.length,
    });

    // Map instructors to view model
    const instructorVMs = activeInstructors.map(u => mapUserToStudentInstructor(u));

    // Map requests to view model
    const requestVMs = studentRequests.map(mapRequestToInstructorRequest);

    // Derive connected instructor IDs from accepted requests AND assignments
    const acceptedInstructorIds = studentRequests
      .filter(r => r.status === 'accepted' || r.status === 'confirmed')
      .map(r => r.instructorId || r.instructor_id || '');
    const assignmentInstructorIds = studentAssignments
      .map(a => a.instructorId || a.instructor_id || '')
      .filter(Boolean);
    const connectedIds = [...new Set([...acceptedInstructorIds, ...assignmentInstructorIds])];

    // Fetch any connected instructors not in active instructors list
    const knownIds = new Set(instructorVMs.map(i => i.id));
    const missingIds = connectedIds.filter(id => id && !knownIds.has(id));
    if (missingIds.length > 0) {
      const fetched = await Promise.all(
        missingIds.map(id =>
          readOrFallback(() => userService.getUserById(id), null),
        ),
      );
      for (const user of fetched) {
        if (user) {
          instructorVMs.push(mapUserToStudentInstructor(user));
        }
      }
    }

    dispatch(setInstructors(instructorVMs));

    const myInstructorVMs = instructorVMs.filter(i => connectedIds.includes(i.id));
    dispatch(setMyInstructors(myInstructorVMs));

    // Bulk set requests (replaces, not appends — safe on re-load)
    dispatch(setRequests(requestVMs));

    // Fetch packages for each connected instructor (needed for package name enrichment)
    // Map keyed by package ID for accurate matching
    const packageInfoById: Record<string, { name: string; price: number; totalLessons: number }> = {};
    for (const instId of connectedIds) {
      if (instId) {
        try {
          const avPkgs = await packageService.getInstructorAvailablePackages(instId);
          const pkgVMs = avPkgs.map(mapAvailablePackageToInstructorPackage);
          dispatch(setPackages(instId, pkgVMs));
          // Index by package ID for assignment enrichment
          for (const p of avPkgs) {
            packageInfoById[p.id] = {
              name: p.title || '',
              price: p.price || 0,
              totalLessons: p.number_of_lessons || 0,
            };
          }
        } catch (_e) {
          // Non-critical: continue if packages fail for one instructor
        }
      }
    }

    // Map assignments to purchased packages, enriched with actual package names
    const purchasedVMs = studentAssignments.map(a => {
      const pkgId = a.package_id || '';
      // Match by the assignment's package_id for accurate name/price
      const pkgInfo = pkgId ? packageInfoById[pkgId] : undefined;
      return mapAssignmentToPurchasedPackage(a, pkgInfo || undefined);
    });
    dispatch(setPurchasedPackages(purchasedVMs));

    // Map bookings to lessons, merging bookingRequests for pending/accepted lessons
    const confirmedLessons = studentBookings.map(b => mapBookingToBookedLesson(b));
    const confirmedRequestIds = new Set(
      studentBookings.map((b: any) => b.bookingRequestId || '').filter(Boolean),
    );

    // Include booking requests that aren't yet confirmed bookings
    const requestLessons = studentBookingRequests
      .filter((r: any) => {
        if (confirmedRequestIds.has(r.id)) return false;
        return ['pending', 'accepted', 'amendment_pending'].includes(r.status);
      })
      .map((r: any) => {
        const dateVal = r.date;
        let dateStr = '';
        if (typeof dateVal === 'string') {
          dateStr = dateVal.split('T')[0];
        } else if (dateVal && typeof dateVal.toDate === 'function') {
          dateStr = dateVal.toDate().toISOString().split('T')[0];
        } else if (dateVal instanceof Date) {
          dateStr = dateVal.toISOString().split('T')[0];
        }
        return {
          id: r.id,
          instructorId: r.instructorId || r.instructor_id || '',
          instructorName: r.instructorName || '',
          instructorAvatar: '',
          packageId: r.packageId || r.package_id || '',
          packageName: '',
          date: dateStr,
          time: r.startTime || '',
          duration: r.duration ? `${r.duration}` : '1h',
          status: r.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        };
      });

    // Merge and deduplicate
    const allLessons = [...requestLessons, ...confirmedLessons];
    const seenIds = new Set<string>();
    const uniqueLessons = allLessons.filter(l => {
      if (seenIds.has(l.id)) return false;
      seenIds.add(l.id);
      return true;
    });
    dispatch(setLessons(uniqueLessons));
  } catch (error) {
    if (__DEV__) console.error('[Firebase][StudentThunk] Error output: loadStudentData', { studentId, error });
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
    if (__DEV__) console.error('Failed to search instructors:', error);
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
    if (__DEV__) console.error('Failed to send request:', error);
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
    if (__DEV__) console.error('Failed to fetch packages:', error);
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
    if (__DEV__) console.error('Failed to buy package:', error);
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
    if (__DEV__) console.error('Failed to fetch available slots:', error);
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
    const bookingId = await bookingService.createBookingRequest({
      ...data,
      duration: `${data.duration}h`,
      requestedBy: 'student',
    });

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
    if (__DEV__) console.error('Failed to create booking:', error);
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
    if (__DEV__) console.error('Failed to cancel booking:', error);
    throw error;
  }
};

// ─── Real-time Listener Setup ────────────────────────────────────────────────

/**
 * Subscribe to real-time booking updates.
 * Returns unsubscribe function.
 *
 * Listens to BOTH `bookings` AND `bookingRequests` collections:
 * - `bookings`: Confirmed/completed lessons (created when instructor confirms)
 * - `bookingRequests`: Pending/accepted requests (where lessons start their lifecycle)
 *
 * This matches the web where bookingRequests are the primary source of truth,
 * and bookings are only created on instructor confirmation.
 */
export const subscribeToStudentBookings = (
  studentId: string,
) => (dispatch: Dispatch) => {
  // Track data from both sources and merge on each update
  let confirmedBookings: import('../../types').Booking[] = [];
  let bookingRequests: import('../../types').BookingRequest[] = [];

  const mergeAndDispatch = () => {
    // Map confirmed bookings
    const confirmedLessons = confirmedBookings.map(b => mapBookingToBookedLesson(b));

    // Map booking requests to lessons (pending/accepted that aren't yet in bookings)
    const confirmedIds = new Set(confirmedBookings.map(b =>
      b.bookingRequestId || ''
    ).filter(Boolean));

    const requestLessons = bookingRequests
      .filter((r: any) => {
        if (confirmedIds.has(r.id)) return false;
        return ['pending', 'accepted', 'amendment_pending'].includes(r.status);
      })
      .map((r: any) => {
        const dateVal = r.date;
        let dateStr = '';
        if (typeof dateVal === 'string') {
          dateStr = dateVal.split('T')[0];
        } else if (dateVal && typeof dateVal.toDate === 'function') {
          dateStr = dateVal.toDate().toISOString().split('T')[0];
        } else if (dateVal instanceof Date) {
          dateStr = dateVal.toISOString().split('T')[0];
        }

        return {
          id: r.id,
          instructorId: r.instructorId || r.instructor_id || '',
          instructorName: r.instructorName || '',
          instructorAvatar: '',
          packageId: r.packageId || r.package_id || '',
          packageName: '',
          date: dateStr,
          time: r.startTime || '',
          duration: r.duration ? `${r.duration}` : '1h',
          status: r.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        };
      });

    // Merge: booking requests first (most recent state), then confirmed
    const allLessons = [...requestLessons, ...confirmedLessons];

    // Deduplicate by ID
    const seen = new Set<string>();
    const unique = allLessons.filter(l => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });

    dispatch(setLessons(unique));
  };

  // Listener 1: Confirmed bookings
  const unsubBookings = bookingService.onStudentBookings(studentId, (bookings) => {
    confirmedBookings = bookings;
    mergeAndDispatch();
  });

  // Listener 2: Booking requests (pending/accepted)
  const unsubRequests = bookingService.onStudentBookingRequests(studentId, (requests) => {
    bookingRequests = requests;
    mergeAndDispatch();
  });

  return () => {
    if (typeof unsubBookings === 'function') unsubBookings();
    if (typeof unsubRequests === 'function') unsubRequests();
  };
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
