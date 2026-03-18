/**
 * GDS Driving School — Instructor Service
 * ==========================================
 * Client-side helpers for instructor discovery and requests.
 *
 * These operate on the Redux store view-model types (StudentInstructor,
 * InstructorRequest) — NOT raw Firestore types.
 */

import type {
  StudentInstructor,
  InstructorRequest,
  InstructorRequestStatus,
} from '../store/student/types';

// ─── Search & Filter (client-side on pre-fetched list) ───────────────────────

export interface InstructorFilters {
  query?: string;
  city?: string;
  postcode?: string;
  minRating?: number;
  transmission?: string;
}

export const searchInstructors = (
  instructors: StudentInstructor[],
  filters: InstructorFilters,
): StudentInstructor[] => {
  let results = [...instructors];

  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(
      i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.city || '').toLowerCase().includes(q),
    );
  }

  if (filters.postcode && filters.postcode.trim().length > 0) {
    const pc = filters.postcode.toUpperCase().trim();
    results = results.filter(i =>
      (i.coveredPostcodes || []).some(
        covered => covered.toUpperCase().trim() === pc,
      ),
    );
  }

  if (filters.city && filters.city !== 'all') {
    results = results.filter(
      i => (i.city || '').toLowerCase().startsWith(filters.city!.toLowerCase()),
    );
  }

  if (filters.minRating && filters.minRating > 0) {
    results = results.filter(i => (i.rating || 0) >= filters.minRating!);
  }

  if (filters.transmission && filters.transmission !== 'all') {
    results = results.filter(
      i => (i.transmissionType || '').toLowerCase() === filters.transmission!.toLowerCase(),
    );
  }

  return results;
};

// ─── Get unique cities from instructor list ──────────────────────────────────

export const getInstructorCities = (instructors: StudentInstructor[]): string[] => {
  const cities = new Set(
    instructors
      .map(i => (i.city || '').trim())
      .filter(Boolean),
  );
  return Array.from(cities).sort();
};

// ─── Request status from local list ──────────────────────────────────────────

export const getRequestStatus = (
  requests: InstructorRequest[],
  instructorId: string,
): InstructorRequestStatus | 'none' => {
  const request = requests.find(r => r.instructorId === instructorId);
  return request ? request.status : 'none';
};

// ─── Get instructor by ID from local list ────────────────────────────────────

export const getInstructorById = (
  instructors: StudentInstructor[],
  instructorId: string,
): StudentInstructor | undefined => {
  return instructors.find(i => i.id === instructorId);
};
