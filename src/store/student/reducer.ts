/**
 * GDS Driving School — Student Redux Reducer
 * =============================================
 * Classic switch/case reducer matching admin pattern.
 * Initializes from student mock data.
 */

import {
  instructors as mockInstructors,
  studentRequests as mockRequests,
  instructorPackages as mockPackages,
  purchasedPackages as mockPurchased,
  lessons as mockLessons,
} from '../../modules/student/mockData';

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
  type StudentState,
  type StudentAction,
} from './types';

// ─── Derive my instructors from accepted requests ─────────────────────────────

const acceptedIds = mockRequests
  .filter(r => r.status === 'accepted')
  .map(r => r.instructorId);

const initialMyInstructors = mockInstructors.filter(i =>
  acceptedIds.includes(i.id),
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: StudentState = {
  instructors: mockInstructors,
  myInstructors: initialMyInstructors,
  requests: mockRequests,
  packages: mockPackages,
  purchasedPackages: mockPurchased,
  availableSlots: [],
  lessons: mockLessons,
  searchLoading: false,
  packagesLoading: false,
  slotsLoading: false,
  bookingLoading: false,
  requestLoading: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

const studentReducer = (
  state: StudentState = initialState,
  action: StudentAction,
): StudentState => {
  switch (action.type) {
    case SET_INSTRUCTORS:
      return {
        ...state,
        instructors: action.payload.instructors,
      };

    case SEND_REQUEST:
      return {
        ...state,
        requests: [...state.requests, action.payload.request],
      };

    case UPDATE_REQUEST_STATUS: {
      const { requestId, status, responseDate, message } = action.payload;
      const updatedRequests = state.requests.map(r =>
        r.id === requestId
          ? { ...r, status, responseDate, message }
          : r,
      );

      // If accepted, add instructor to myInstructors
      let updatedMyInstructors = state.myInstructors;
      if (status === 'accepted') {
        const acceptedRequest = updatedRequests.find(r => r.id === requestId);
        if (acceptedRequest) {
          const instructor = state.instructors.find(
            i => i.id === acceptedRequest.instructorId,
          );
          if (
            instructor &&
            !state.myInstructors.some(mi => mi.id === instructor.id)
          ) {
            updatedMyInstructors = [...state.myInstructors, instructor];
          }
        }
      }

      // If rejected, remove from myInstructors if present
      if (status === 'rejected') {
        const rejectedRequest = updatedRequests.find(r => r.id === requestId);
        if (rejectedRequest) {
          updatedMyInstructors = state.myInstructors.filter(
            mi => mi.id !== rejectedRequest.instructorId,
          );
        }
      }

      return {
        ...state,
        requests: updatedRequests,
        myInstructors: updatedMyInstructors,
      };
    }

    case SET_MY_INSTRUCTORS:
      return {
        ...state,
        myInstructors: action.payload.instructors,
      };

    case SET_PACKAGES:
      return {
        ...state,
        packages: {
          ...state.packages,
          [action.payload.instructorId]: action.payload.packages,
        },
      };

    case PURCHASE_PACKAGE:
      return {
        ...state,
        purchasedPackages: [
          ...state.purchasedPackages,
          action.payload.purchasedPackage,
        ],
      };

    case SET_AVAILABLE_SLOTS:
      return {
        ...state,
        availableSlots: action.payload.slots,
      };

    case BOOK_LESSON: {
      // Add lesson and mark the slot as booked
      const newLesson = action.payload.lesson;
      const updatedSlots = state.availableSlots.map(slot =>
        slot.instructorId === newLesson.instructorId &&
        slot.date === newLesson.date &&
        slot.startTime === newLesson.time
          ? { ...slot, booked: true }
          : slot,
      );

      // Increment lessons used on the purchased package
      const updatedPurchased = state.purchasedPackages.map(pp =>
        pp.packageId === newLesson.packageId && pp.instructorId === newLesson.instructorId
          ? {
              ...pp,
              lessonsUsed: pp.lessonsUsed + 1,
              status: pp.lessonsUsed + 1 >= pp.totalLessons ? ('exhausted' as const) : pp.status,
            }
          : pp,
      );

      return {
        ...state,
        lessons: [...state.lessons, newLesson],
        availableSlots: updatedSlots,
        purchasedPackages: updatedPurchased,
      };
    }

    case UPDATE_LESSON_STATUS:
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === action.payload.lessonId
            ? {
                ...l,
                status: action.payload.status,
                cancelledBy: action.payload.cancelledBy,
              }
            : l,
        ),
      };

    case CANCEL_BOOKING:
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === action.payload.lessonId
            ? {
                ...l,
                status: 'cancelled' as const,
                cancelledBy: action.payload.cancelledBy,
              }
            : l,
        ),
      };

    case SET_LOADING:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };

    case UPDATE_PACKAGE_USAGE:
      return {
        ...state,
        purchasedPackages: state.purchasedPackages.map(pp =>
          pp.id === action.payload.purchasedPackageId
            ? {
                ...pp,
                lessonsUsed: action.payload.lessonsUsed,
                status:
                  action.payload.lessonsUsed >= pp.totalLessons
                    ? ('exhausted' as const)
                    : pp.status,
              }
            : pp,
        ),
      };

    default:
      return state;
  }
};

export default studentReducer;
