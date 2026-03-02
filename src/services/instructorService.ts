/**
 * GDS Driving School — Instructor Service
 * ==========================================
 * Abstraction layer for instructor-related operations.
 * Currently uses mock data; structured for future API replacement.
 */

import { Dispatch } from 'redux';
import {
  sendRequest as sendRequestAction,
  updateRequestStatus,
  setLoading,
} from '../store/student/actions';
import type {
  StudentInstructor,
  InstructorRequest,
  InstructorRequestStatus,
} from '../store/student/types';
import type { RootState } from '../store';

// ─── Search & Filter ──────────────────────────────────────────────────────────

export interface InstructorFilters {
  query?: string;
  city?: string;
  minRating?: number;
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
        i.name.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.bio.toLowerCase().includes(q),
    );
  }

  if (filters.city && filters.city !== 'all') {
    results = results.filter(
      i => i.city.toLowerCase() === filters.city!.toLowerCase(),
    );
  }

  if (filters.minRating && filters.minRating > 0) {
    results = results.filter(i => i.rating >= filters.minRating!);
  }

  return results;
};

// ─── Get unique cities from instructor list ───────────────────────────────────

export const getInstructorCities = (instructors: StudentInstructor[]): string[] => {
  const cities = new Set(instructors.map(i => i.city));
  return Array.from(cities).sort();
};

// ─── Send Request (simulated API) ─────────────────────────────────────────────

export const sendInstructorRequest = (
  instructorId: string,
  dispatch: Dispatch,
): Promise<InstructorRequest> => {
  return new Promise((resolve) => {
    dispatch(setLoading('requestLoading', true));

    const request: InstructorRequest = {
      id: `REQ-${Date.now()}`,
      instructorId,
      status: 'pending',
      sentDate: new Date().toISOString().split('T')[0],
    };

    // Simulate network delay
    setTimeout(() => {
      dispatch(sendRequestAction(request));
      dispatch(setLoading('requestLoading', false));
      resolve(request);
    }, 800);
  });
};

// ─── Simulate instructor accepting/rejecting (for demo) ──────────────────────

export const simulateRequestResponse = (
  requestId: string,
  status: InstructorRequestStatus,
  dispatch: Dispatch,
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      dispatch(
        updateRequestStatus(
          requestId,
          status,
          new Date().toISOString().split('T')[0],
          status === 'accepted'
            ? 'Welcome! Browse my packages and book when ready.'
            : 'Sorry, I\'m fully booked at the moment.',
        ),
      );
      resolve();
    }, 1500);
  });
};

// ─── Get request status for a specific instructor ─────────────────────────────

export const getRequestStatus = (
  requests: InstructorRequest[],
  instructorId: string,
): InstructorRequestStatus | 'none' => {
  const request = requests.find(r => r.instructorId === instructorId);
  return request ? request.status : 'none';
};

// ─── Get instructor by ID ─────────────────────────────────────────────────────

export const getInstructorById = (
  instructors: StudentInstructor[],
  instructorId: string,
): StudentInstructor | undefined => {
  return instructors.find(i => i.id === instructorId);
};
