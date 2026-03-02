/**
 * GDS Driving School — Booking Service
 * =======================================
 * Abstraction layer for lesson booking operations.
 * Currently uses mock data; structured for future API replacement.
 */

import { Dispatch } from 'redux';
import {
  setAvailableSlots,
  bookLesson as bookLessonAction,
  cancelBooking as cancelBookingAction,
  setLoading,
} from '../store/student/actions';
import type {
  AvailableSlot,
  BookedLesson,
  PurchasedPackage,
} from '../store/student/types';
import { generateAvailableSlots } from '../modules/student/mockData';

// ─── Fetch available slots for instructor (simulated API) ─────────────────────

export const fetchAvailableSlots = (
  instructorId: string,
  dispatch: Dispatch,
): Promise<AvailableSlot[]> => {
  return new Promise((resolve) => {
    dispatch(setLoading('slotsLoading', true));

    setTimeout(() => {
      const slots = generateAvailableSlots(instructorId);
      dispatch(setAvailableSlots(slots));
      dispatch(setLoading('slotsLoading', false));
      resolve(slots);
    }, 500);
  });
};

// ─── Get available slots for a specific date ──────────────────────────────────

export const getSlotsForDate = (
  slots: AvailableSlot[],
  instructorId: string,
  date: string,
): AvailableSlot[] => {
  return slots.filter(
    s => s.instructorId === instructorId && s.date === date,
  );
};

// ─── Validate booking (30-min buffer, no overlap) ─────────────────────────────

export interface BookingValidation {
  valid: boolean;
  error?: string;
}

const parseTime = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (period === 'PM' && hours !== 12) { hours += 12; }
  if (period === 'AM' && hours === 12) { hours = 0; }
  return hours * 60 + minutes;
};

export const validateBooking = (
  slot: AvailableSlot,
  existingLessons: BookedLesson[],
  purchasedPackage: PurchasedPackage,
): BookingValidation => {
  // Check slot is not already booked
  if (slot.booked) {
    return { valid: false, error: 'This time slot is already booked.' };
  }

  // Check package has remaining lessons
  if (purchasedPackage.lessonsUsed >= purchasedPackage.totalLessons) {
    return { valid: false, error: 'No remaining lessons in this package.' };
  }

  if (purchasedPackage.status !== 'active') {
    return { valid: false, error: 'This package is no longer active.' };
  }

  // Check for overlapping lessons on the same date (30-min buffer)
  const slotStart = parseTime(slot.startTime);
  const slotEnd = parseTime(slot.endTime);

  const sameDayLessons = existingLessons.filter(
    l =>
      l.date === slot.date &&
      (l.status === 'confirmed' || l.status === 'pending'),
  );

  for (const lesson of sameDayLessons) {
    const lessonStart = parseTime(lesson.time);
    // Parse duration string like "1.5 hours" or "1 hour"
    const durationMatch = lesson.duration.match(/([\d.]+)/);
    const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 1;
    const lessonEnd = lessonStart + durationHours * 60;

    // Check overlap with 30-min buffer
    const bufferMinutes = 30;
    if (
      slotStart < lessonEnd + bufferMinutes &&
      slotEnd > lessonStart - bufferMinutes
    ) {
      return {
        valid: false,
        error: 'This slot conflicts with an existing booking (30-minute buffer required).',
      };
    }
  }

  return { valid: true };
};

// ─── Book a lesson (simulated API) ────────────────────────────────────────────

export const createBooking = (
  instructorId: string,
  instructorName: string,
  instructorAvatar: string,
  packageId: string,
  packageName: string,
  slot: AvailableSlot,
  dispatch: Dispatch,
): Promise<BookedLesson> => {
  return new Promise((resolve) => {
    dispatch(setLoading('bookingLoading', true));

    const lesson: BookedLesson = {
      id: `LES-${Date.now()}`,
      instructorId,
      instructorName,
      instructorAvatar,
      packageId,
      packageName,
      date: slot.date,
      time: slot.startTime,
      duration: slot.duration,
      status: 'pending',
    };

    // Simulate API call
    setTimeout(() => {
      dispatch(bookLessonAction(lesson));
      dispatch(setLoading('bookingLoading', false));
      resolve(lesson);
    }, 1000);
  });
};

// ─── Cancel a booking (simulated API) ─────────────────────────────────────────

export const cancelLessonBooking = (
  lessonId: string,
  cancelledBy: 'student' | 'instructor',
  dispatch: Dispatch,
): Promise<void> => {
  return new Promise((resolve) => {
    dispatch(setLoading('bookingLoading', true));

    setTimeout(() => {
      dispatch(cancelBookingAction(lessonId, cancelledBy));
      dispatch(setLoading('bookingLoading', false));
      resolve();
    }, 600);
  });
};

// ─── Filter lessons by status ─────────────────────────────────────────────────

export const filterLessons = (
  lessons: BookedLesson[],
  filter: 'upcoming' | 'completed' | 'cancelled',
): BookedLesson[] => {
  switch (filter) {
    case 'upcoming':
      return lessons
        .filter(l => l.status === 'pending' || l.status === 'confirmed')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case 'completed':
      return lessons
        .filter(l => l.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case 'cancelled':
      return lessons
        .filter(l => l.status === 'cancelled')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    default:
      return lessons;
  }
};
