/**
 * GDS Driving School — Assignment Service
 * ==========================================
 * Firestore reads for `assignments` collection.
 * Writes are server-owned (Cloud Functions handle upserts on payment).
 */

import { db } from '../config/firebase';
import { Collections, fromQuerySnapshot } from '../utils/mappers';
import { collection, query, where, getDocs } from '@react-native-firebase/firestore';
import type { Assignment } from '../types';

/**
 * Get assignments for a student.
 */
export const getStudentAssignments = async (studentId: string): Promise<Assignment[]> => {
  // Query both field name variants
  const q1 = query(collection(db, Collections.ASSIGNMENTS), where('studentId', '==', studentId));
  const snapshot1 = await getDocs(q1);

  const q2 = query(collection(db, Collections.ASSIGNMENTS), where('student_id', '==', studentId));
  const snapshot2 = await getDocs(q2);

  const map = new Map<string, Assignment>();
  for (const doc of [...snapshot1.docs, ...snapshot2.docs]) {
    if (!map.has(doc.id)) {
      map.set(doc.id, { id: doc.id, ...doc.data() } as Assignment);
    }
  }
  return Array.from(map.values());
};

/**
 * Get assignments for an instructor.
 */
export const getInstructorAssignments = async (instructorId: string): Promise<Assignment[]> => {
  const snapshot1 = await db
    .collection(Collections.ASSIGNMENTS)
    .where('instructorId', '==', instructorId)
    .get();

  const snapshot2 = await db
    .collection(Collections.ASSIGNMENTS)
    .where('instructor_id', '==', instructorId)
    .get();

  const map = new Map<string, Assignment>();
  for (const doc of [...snapshot1.docs, ...snapshot2.docs]) {
    if (!map.has(doc.id)) {
      map.set(doc.id, { id: doc.id, ...doc.data() } as Assignment);
    }
  }
  return Array.from(map.values());
};

/**
 * Get a specific assignment by student + instructor pair.
 */
export const getAssignment = async (
  studentId: string,
  instructorId: string,
): Promise<Assignment | null> => {
  const snapshot = await db
    .collection(Collections.ASSIGNMENTS)
    .where('studentId', '==', studentId)
    .where('instructorId', '==', instructorId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    // Try alternate field names
    const snapshot2 = await db
      .collection(Collections.ASSIGNMENTS)
      .where('student_id', '==', studentId)
      .where('instructor_id', '==', instructorId)
      .limit(1)
      .get();

    if (snapshot2.empty) return null;
    const doc = snapshot2.docs[0];
    return { id: doc.id, ...doc.data() } as Assignment;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Assignment;
};
