/**
 * GDS Driving School — Timetable Service
 * =========================================
 * Firestore reads/writes for `timetables` collection.
 *
 * Timetable documents are keyed by instructorId and contain
 * availability slots per day-of-week.
 */

import { db } from '../config/firebase';
import { Collections, fromSnapshot, serverTimestamp } from '../utils/mappers';

export interface TimetableSlot {
  startTime: string;   // e.g. "09:00"
  endTime: string;     // e.g. "10:00"
  available: boolean;
}

export interface DayTimetable {
  slots: TimetableSlot[];
}

export interface Timetable {
  id: string;
  instructorId: string;
  instructor_id: string;
  days: Record<string, DayTimetable>; // mon, tue, wed, ...
  updatedAt?: unknown;
}

/**
 * Get timetable for an instructor.
 */
export const getInstructorTimetable = async (instructorId: string): Promise<Timetable | null> => {
  // Timetable doc ID is the instructorId
  const snapshot = await db
    .collection(Collections.TIMETABLES)
    .doc(instructorId)
    .get();
  return fromSnapshot<Timetable>(snapshot);
};

/**
 * Save / update timetable for an instructor.
 */
export const saveInstructorTimetable = async (
  instructorId: string,
  days: Record<string, DayTimetable>,
): Promise<void> => {
  await db
    .collection(Collections.TIMETABLES)
    .doc(instructorId)
    .set(
      {
        instructorId,
        instructor_id: instructorId,
        days,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
};

/**
 * Real-time listener for instructor timetable.
 */
export const onInstructorTimetable = (
  instructorId: string,
  callback: (timetable: Timetable | null) => void,
): (() => void) => {
  return db
    .collection(Collections.TIMETABLES)
    .doc(instructorId)
    .onSnapshot(
      (snapshot) => callback(fromSnapshot<Timetable>(snapshot)),
    );
};
