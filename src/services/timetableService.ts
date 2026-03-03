/**
 * GDS Driving School — Timetable Service
 * =========================================
 * Firestore reads/writes for `timetables` collection.
 *
 * Timetable documents are keyed by instructorId and contain
 * timeBlocks (flat array) and a derived availability lookup —
 * matching the web app's AdvancedDragDropTimetable format.
 */

import { db } from '../config/firebase';
import { Collections, fromSnapshot, serverTimestamp } from '../utils/mappers';

// ─── Day name helpers (matches web DAYS constant) ────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** A single block on the timetable — matches web TimeBlock exactly. */
export interface TimeBlock {
  id: string;
  duration: number;      // hours (can be decimal, e.g. 1, 1.5, 2)
  startTime: string;     // "HH:MM"
  day: number;           // 0-6 index into DAYS (0=Mon, 6=Sun)
  color: string;
  label: string;
  rowSpan: number;       // number of 30-min intervals
  week: number;          // week offset from current week (0 = current)
  studentId?: string;
  studentName?: string;
  status?: 'available' | 'pending' | 'confirmed';
}

/** Document shape stored in `timetables/{instructorId}` — matches web. */
export interface Timetable {
  id: string;
  instructorId: string;
  availability: Record<string, string[]>; // e.g. { Mon: ["09:00","10:00"], Tue: [...] }
  timeBlocks: TimeBlock[];
  updatedAt?: unknown;
  [key: string]: unknown;
}

// ─── Compatibility helpers ──────────────────────────────────────────────────

/** Convert timeBlocks → availability lookup (same as web timeBlocksToAvailability). */
const timeBlocksToAvailability = (blocks: TimeBlock[]): Record<string, string[]> => {
  const availability: Record<string, string[]> = {};
  blocks.forEach(block => {
    const day = DAYS[block.day];
    if (!availability[day]) {availability[day] = [];}
    availability[day].push(block.startTime);
  });
  return availability;
};

/**
 * Convert legacy `days` structure to timeBlocks (one-time migration helper).
 * Used when reading a doc that was written by the old mobile format.
 */
const legacyDaysToTimeBlocks = (
  days: Record<string, { slots?: Array<{ startTime: string; endTime: string; available?: boolean }> } | Array<{ startTime: string; endTime: string; available?: boolean }>>,
): TimeBlock[] => {
  const blocks: TimeBlock[] = [];
  let counter = Date.now();

  for (const [dayKey, value] of Object.entries(days)) {
    const dayIndex = DAYS.findIndex(d => d.toLowerCase() === dayKey.toLowerCase());
    if (dayIndex === -1) {continue;}

    const slots = Array.isArray(value) ? value : (value?.slots ?? []);
    for (const slot of slots) {
      if (slot.available === false) {continue;}
      const [sh, sm] = slot.startTime.split(':').map(Number);
      const [eh, em] = slot.endTime.split(':').map(Number);
      const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
      const durationHours = durationMinutes / 60;
      const rowSpan = Math.round(durationMinutes / 30);

      blocks.push({
        id: `MIGRATED-${counter++}`,
        duration: durationHours,
        startTime: slot.startTime,
        day: dayIndex,
        color: '#3B82F6',
        label: `${slot.startTime} – ${slot.endTime}`,
        rowSpan,
        week: 0,
      });
    }
  }
  return blocks;
};

/**
 * Get timetable for an instructor.
 */
export const getInstructorTimetable = async (instructorId: string): Promise<Timetable | null> => {
  const snapshot = await db
    .collection(Collections.TIMETABLES)
    .doc(instructorId)
    .get();

  if (!snapshot.exists) {return null;}

  const data = snapshot.data() as Record<string, unknown> | undefined;
  if (!data) {return null;}

  // Web format: timeBlocks array present
  if (data.timeBlocks && Array.isArray(data.timeBlocks)) {
    return {
      id: snapshot.id,
      instructorId: (data.instructorId as string) || instructorId,
      availability: (data.availability as Record<string, string[]>) || {},
      timeBlocks: data.timeBlocks as TimeBlock[],
      updatedAt: data.updatedAt,
    };
  }

  // Legacy mobile format: days object → convert on-the-fly
  if (data.days && typeof data.days === 'object') {
    const legacyBlocks = legacyDaysToTimeBlocks(data.days as Record<string, { slots?: Array<{ startTime: string; endTime: string; available?: boolean }> }>);
    return {
      id: snapshot.id,
      instructorId: (data.instructorId as string) || instructorId,
      availability: timeBlocksToAvailability(legacyBlocks),
      timeBlocks: legacyBlocks,
      updatedAt: data.updatedAt,
    };
  }

  return fromSnapshot<Timetable>(snapshot);
};

/**
 * Save / update timetable for an instructor.
 * Writes in the same format as the web AdvancedDragDropTimetable.
 */
export const saveInstructorTimetable = async (
  instructorId: string,
  timeBlocks: TimeBlock[],
): Promise<void> => {
  const availability = timeBlocksToAvailability(timeBlocks);
  await db
    .collection(Collections.TIMETABLES)
    .doc(instructorId)
    .set(
      {
        instructorId,
        availability,
        timeBlocks,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
};

/**
 * Convenience overload: accept legacy `days` format from the mobile UI
 * and convert to timeBlocks before saving.
 */
export const saveInstructorTimetableFromDays = async (
  instructorId: string,
  days: Record<string, Array<{ startTime: string; endTime: string; available?: boolean }>>,
): Promise<void> => {
  const timeBlocks = legacyDaysToTimeBlocks(days);
  await saveInstructorTimetable(instructorId, timeBlocks);
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
    .onSnapshot((snapshot) => {
      if (!snapshot.exists) {
        callback(null);
        return;
      }

      const data = snapshot.data() as Record<string, unknown> | undefined;
      if (!data) {
        callback(null);
        return;
      }

      // Web format
      if (data.timeBlocks && Array.isArray(data.timeBlocks)) {
        callback({
          id: snapshot.id,
          instructorId: (data.instructorId as string) || instructorId,
          availability: (data.availability as Record<string, string[]>) || {},
          timeBlocks: data.timeBlocks as TimeBlock[],
          updatedAt: data.updatedAt,
        });
        return;
      }

      // Legacy mobile format
      if (data.days && typeof data.days === 'object') {
        const legacyBlocks = legacyDaysToTimeBlocks(data.days as Record<string, { slots?: Array<{ startTime: string; endTime: string; available?: boolean }> }>);
        callback({
          id: snapshot.id,
          instructorId: (data.instructorId as string) || instructorId,
          availability: timeBlocksToAvailability(legacyBlocks),
          timeBlocks: legacyBlocks,
          updatedAt: data.updatedAt,
        });
        return;
      }

      callback(fromSnapshot<Timetable>(snapshot));
    });
};
