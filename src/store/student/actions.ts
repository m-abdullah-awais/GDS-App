/**
 * GDS Driving School — Student Action Creators
 * ===============================================
 * Typed action creators for the student booking lifecycle.
 */

import {
  SET_INSTRUCTORS,
  SEND_REQUEST,
  UPDATE_REQUEST_STATUS,
  SET_MY_INSTRUCTORS,
  SET_PACKAGES,
  PURCHASE_PACKAGE,
  SET_AVAILABLE_SLOTS,
  BOOK_LESSON,
  UPDATE_LESSON_STATUS,
  CANCEL_BOOKING,
  SET_LOADING,
  UPDATE_PACKAGE_USAGE,
  type StudentInstructor,
  type InstructorRequest,
  type InstructorPackage,
  type PurchasedPackage,
  type AvailableSlot,
  type BookedLesson,
  type InstructorRequestStatus,
  type BookingLessonStatus,
} from './types';

// ─── Instructor Actions ───────────────────────────────────────────────────────

export const setInstructors = (instructors: StudentInstructor[]) => ({
  type: SET_INSTRUCTORS as typeof SET_INSTRUCTORS,
  payload: { instructors },
});

export const sendRequest = (request: InstructorRequest) => ({
  type: SEND_REQUEST as typeof SEND_REQUEST,
  payload: { request },
});

export const updateRequestStatus = (
  requestId: string,
  status: InstructorRequestStatus,
  responseDate?: string,
  message?: string,
) => ({
  type: UPDATE_REQUEST_STATUS as typeof UPDATE_REQUEST_STATUS,
  payload: { requestId, status, responseDate, message },
});

export const setMyInstructors = (instructors: StudentInstructor[]) => ({
  type: SET_MY_INSTRUCTORS as typeof SET_MY_INSTRUCTORS,
  payload: { instructors },
});

// ─── Package Actions ──────────────────────────────────────────────────────────

export const setPackages = (instructorId: string, packages: InstructorPackage[]) => ({
  type: SET_PACKAGES as typeof SET_PACKAGES,
  payload: { instructorId, packages },
});

export const purchasePackage = (purchasedPackage: PurchasedPackage) => ({
  type: PURCHASE_PACKAGE as typeof PURCHASE_PACKAGE,
  payload: { purchasedPackage },
});

export const updatePackageUsage = (purchasedPackageId: string, lessonsUsed: number) => ({
  type: UPDATE_PACKAGE_USAGE as typeof UPDATE_PACKAGE_USAGE,
  payload: { purchasedPackageId, lessonsUsed },
});

// ─── Slot Actions ─────────────────────────────────────────────────────────────

export const setAvailableSlots = (slots: AvailableSlot[]) => ({
  type: SET_AVAILABLE_SLOTS as typeof SET_AVAILABLE_SLOTS,
  payload: { slots },
});

// ─── Lesson / Booking Actions ─────────────────────────────────────────────────

export const bookLesson = (lesson: BookedLesson) => ({
  type: BOOK_LESSON as typeof BOOK_LESSON,
  payload: { lesson },
});

export const updateLessonStatus = (
  lessonId: string,
  status: BookingLessonStatus,
  cancelledBy?: 'student' | 'instructor',
) => ({
  type: UPDATE_LESSON_STATUS as typeof UPDATE_LESSON_STATUS,
  payload: { lessonId, status, cancelledBy },
});

export const cancelBooking = (
  lessonId: string,
  cancelledBy: 'student' | 'instructor',
) => ({
  type: CANCEL_BOOKING as typeof CANCEL_BOOKING,
  payload: { lessonId, cancelledBy },
});

// ─── Loading Actions ──────────────────────────────────────────────────────────

export const setLoading = (
  key: 'searchLoading' | 'packagesLoading' | 'slotsLoading' | 'bookingLoading' | 'requestLoading',
  value: boolean,
) => ({
  type: SET_LOADING as typeof SET_LOADING,
  payload: { key, value },
});
