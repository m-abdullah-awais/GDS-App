/**
 * GDS Driving School — Assignment Service
 * ==========================================
 * Firestore reads for `assignments` collection.
 * Writes are server-owned (Cloud Functions handle upserts on payment).
 */

import { db } from '../config/firebase';
import { Collections, fromQuerySnapshot } from '../utils/mappers';
import { collection, query, where, getDocs, limit } from '@react-native-firebase/firestore';
import type { Assignment } from '../types';

/**
 * Get assignments for a student.
 *
 * Firestore security rules only allow students to list assignments where
 * `resource.data.student_id == request.auth.uid` (snake_case).
 * The camelCase `studentId` query fails with permission-denied because
 * it doesn't match the security rule's field check.
 *
 * We query snake_case first (matches rule), then try camelCase with
 * graceful fallback so permission-denied doesn't break the flow.
 */
export const getStudentAssignments = async (studentId: string): Promise<Assignment[]> => {
  const map = new Map<string, Assignment>();

  // Primary query: snake_case (matches Firestore security rule)
  const q1 = query(collection(db, Collections.ASSIGNMENTS), where('student_id', '==', studentId));
  const snapshot1 = await getDocs(q1);
  for (const doc of snapshot1.docs) {
    if (!map.has(doc.id)) {
      map.set(doc.id, { id: doc.id, ...doc.data() } as Assignment);
    }
  }

  // Secondary query: camelCase (for legacy data — graceful fallback)
  try {
    const q2 = query(collection(db, Collections.ASSIGNMENTS), where('studentId', '==', studentId));
    const snapshot2 = await getDocs(q2);
    for (const doc of snapshot2.docs) {
      if (!map.has(doc.id)) {
        map.set(doc.id, { id: doc.id, ...doc.data() } as Assignment);
      }
    }
  } catch (err: any) {
    // Permission-denied is expected if Firestore rules don't allow
    // listing by camelCase field. Silently ignore.
    if (err?.code !== 'firestore/permission-denied') {
      if (__DEV__) console.warn('[AssignmentService] camelCase query error:', err);
    }
  }

  const assignments = Array.from(map.values());
  if (__DEV__) console.log('[Firebase][READ][AssignmentService] getStudentAssignments', {
    studentId,
    count: assignments.length,
    data: assignments,
  });
  return assignments;
};

/**
 * Get assignments for an instructor.
 * Firestore rules allow instructors to list all assignments,
 * but individual read requires `resource.data.instructor_id == request.auth.uid`.
 * Query snake_case first (matches rule), camelCase as fallback.
 */
export const getInstructorAssignments = async (instructorId: string): Promise<Assignment[]> => {
  const map = new Map<string, Assignment>();

  // Primary: snake_case (matches Firestore rule)
  const q1 = query(collection(db, Collections.ASSIGNMENTS), where('instructor_id', '==', instructorId));
  const snapshot1 = await getDocs(q1);
  for (const doc of snapshot1.docs) {
    if (!map.has(doc.id)) {
      map.set(doc.id, { id: doc.id, ...doc.data() } as Assignment);
    }
  }

  // Secondary: camelCase (legacy fallback)
  try {
    const q2 = query(collection(db, Collections.ASSIGNMENTS), where('instructorId', '==', instructorId));
    const snapshot2 = await getDocs(q2);
    for (const doc of snapshot2.docs) {
      if (!map.has(doc.id)) {
        map.set(doc.id, { id: doc.id, ...doc.data() } as Assignment);
      }
    }
  } catch (err: any) {
    if (err?.code !== 'firestore/permission-denied') {
      if (__DEV__) console.warn('[AssignmentService] camelCase instructor query error:', err);
    }
  }

  const assignments = Array.from(map.values());
  if (__DEV__) console.log('[Firebase][READ][AssignmentService] getInstructorAssignments', {
    instructorId,
    count: assignments.length,
    data: assignments,
  });
  return assignments;
};

/**
 * Get a specific assignment by student + instructor pair.
 * Queries snake_case first (matches Firestore security rules).
 */
export const getAssignment = async (
  studentId: string,
  instructorId: string,
): Promise<Assignment | null> => {
  // Primary: snake_case (matches Firestore rules)
  const q1 = query(collection(db, Collections.ASSIGNMENTS), where('student_id', '==', studentId), where('instructor_id', '==', instructorId), limit(1));
  const snapshot1 = await getDocs(q1);

  if (!snapshot1.empty) {
    const doc = snapshot1.docs[0];
    return { id: doc.id, ...doc.data() } as Assignment;
  }

  // Fallback: camelCase (legacy data)
  try {
    const q2 = query(collection(db, Collections.ASSIGNMENTS), where('studentId', '==', studentId), where('instructorId', '==', instructorId), limit(1));
    const snapshot2 = await getDocs(q2);
    if (!snapshot2.empty) {
      const doc = snapshot2.docs[0];
      return { id: doc.id, ...doc.data() } as Assignment;
    }
  } catch (err: any) {
    if (err?.code !== 'firestore/permission-denied') {
      if (__DEV__) console.warn('[AssignmentService] camelCase getAssignment error:', err);
    }
  }

  return null;
};
