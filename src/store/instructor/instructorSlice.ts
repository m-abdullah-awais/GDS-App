/**
 * GDS Driving School — Instructor Slice (Redux Toolkit)
 * =======================================================
 * Client-side state for the instructor role.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  BookingRequest,
  Booking,
  StudentInstructorRequest,
  Timetable,
  LessonCompletion,
  InstructorPayment,
  WeeklyInstructorPayment,
  PendingPackage,
  Package,
} from '../../types';

// ─── State Shape ──────────────────────────────────────────────────────────────

export interface InstructorState {
  timetable: Timetable | null;
  studentRequests: StudentInstructorRequest[];
  bookingRequests: BookingRequest[];
  bookings: Booking[];
  pendingPackages: PendingPackage[];
  packages: Package[];
  lessonCompletions: LessonCompletion[];
  instructorPayments: InstructorPayment[];
  weeklyPayment: WeeklyInstructorPayment | null;
  loading: boolean;
  error: string | null;
}

const initialState: InstructorState = {
  timetable: null,
  studentRequests: [],
  bookingRequests: [],
  bookings: [],
  pendingPackages: [],
  packages: [],
  lessonCompletions: [],
  instructorPayments: [],
  weeklyPayment: null,
  loading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    setTimetable(state, action: PayloadAction<Timetable | null>) {
      state.timetable = action.payload;
    },
    setStudentRequests(state, action: PayloadAction<StudentInstructorRequest[]>) {
      state.studentRequests = action.payload;
    },
    setBookingRequests(state, action: PayloadAction<BookingRequest[]>) {
      state.bookingRequests = action.payload;
    },
    setBookings(state, action: PayloadAction<Booking[]>) {
      state.bookings = action.payload;
    },
    setPendingPackages(state, action: PayloadAction<PendingPackage[]>) {
      state.pendingPackages = action.payload;
    },
    setPackages(state, action: PayloadAction<Package[]>) {
      state.packages = action.payload;
    },
    setLessonCompletions(state, action: PayloadAction<LessonCompletion[]>) {
      state.lessonCompletions = action.payload;
    },
    setInstructorPayments(state, action: PayloadAction<InstructorPayment[]>) {
      state.instructorPayments = action.payload;
    },
    setWeeklyPayment(state, action: PayloadAction<WeeklyInstructorPayment | null>) {
      state.weeklyPayment = action.payload;
    },
    setInstructorLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setInstructorError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearInstructor(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
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
  clearInstructor,
} = instructorSlice.actions;

export default instructorSlice.reducer;
