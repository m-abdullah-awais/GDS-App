/**
 * GDS Driving School — Instructor Service
 * ==========================================
 * Firestore operations for instructor discovery and requests.
 * Replaces the legacy mock-data version.
 *
 * Heavy lifting is in userService.ts (searchInstructors, getActiveInstructors).
 * This module provides client-side helpers and request helpers that
 * consume the Firestore requestService.
 */

import { db } from '../config/firebase';
import {
  Collections,
  fromQuerySnapshot,
  withDualIds,
  serverTimestamp,
} from '../utils/mappers';
import type { UserProfile, StudentInstructorRequest } from '../types';

// ─── Search & Filter (client-side on pre-fetched list) ───────────────────────

export interface InstructorFilters {
  query?: string;
  city?: string;
  minRating?: number;
  transmission?: string;
}

export const filterInstructors = (
  instructors: UserProfile[],
  filters: InstructorFilters,
): UserProfile[] => {
  let results = [...instructors];

  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(
      i =>
        (i.fullName || i.full_name || '').toLowerCase().includes(q) ||
        (i.postcode || '').toLowerCase().includes(q) ||
        (i.email || '').toLowerCase().includes(q),
    );
  }

  if (filters.city && filters.city !== 'all') {
    results = results.filter(
      i => (i.postcode || '').toLowerCase().startsWith(filters.city!.toLowerCase()),
    );
  }

  if (filters.minRating && filters.minRating > 0) {
    results = results.filter(i => (i.averageRating || 0) >= filters.minRating!);
  }

  if (filters.transmission && filters.transmission !== 'all') {
    results = results.filter(
      i => (i.transmission || '').toLowerCase() === filters.transmission!.toLowerCase(),
    );
  }

  return results;
};

// ─── Get unique postcodes (used as "city" filter) ────────────────────────────

export const getInstructorPostcodes = (instructors: UserProfile[]): string[] => {
  const postcodes = new Set(
    instructors
      .map(i => i.postcode || '')
      .filter(Boolean)
      .map(p => p.substring(0, 3).toUpperCase()),
  );
  return Array.from(postcodes).sort();
};

// ─── Request status from local list ──────────────────────────────────────────

export const getRequestStatus = (
  requests: StudentInstructorRequest[],
  instructorId: string,
): StudentInstructorRequest['status'] | 'none' => {
  const request = requests.find(
    r =>
      r.instructorId === instructorId || r.instructor_id === instructorId,
  );
  return request ? request.status : 'none';
};

// ─── Get instructor by ID from local list ────────────────────────────────────

export const getInstructorById = (
  instructors: UserProfile[],
  instructorId: string,
): UserProfile | undefined => {
  return instructors.find(i => i.id === instructorId);
};
