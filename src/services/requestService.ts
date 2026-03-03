/**
 * GDS Driving School — Request Service
 * ========================================
 * Firestore CRUD for `studentInstructorRequests` collection.
 */

import { db } from '../config/firebase';
import {
  Collections,
  fromQuerySnapshot,
  withDualIds,
  serverTimestamp,
} from '../utils/mappers';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, onSnapshot } from '@react-native-firebase/firestore';
import type { StudentInstructorRequest } from '../types';

/**
 * Create a new student-instructor request.
 */
export const createStudentInstructorRequest = async (data: {
  studentId: string;
  instructorId: string;
  studentName?: string;
  studentEmail?: string;
  studentPostcode?: string;
  studentTransmission?: string;
}): Promise<string> => {
  const ref = await addDoc(collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS), {
    ...withDualIds(data.studentId, data.instructorId),
    studentName: data.studentName ?? '',
    studentEmail: data.studentEmail ?? '',
    studentPostcode: data.studentPostcode,
    studentTransmission: data.studentTransmission,
    initiatedBy: 'student',
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Update request status (accept/reject).
 */
export const updateRequestStatus = async (
  requestId: string,
  status: 'accepted' | 'rejected',
): Promise<void> => {
  const updateData: Record<string, unknown> = { status };
  if (status === 'accepted') {
    updateData.acceptedAt = serverTimestamp();
  } else {
    updateData.rejectedAt = serverTimestamp();
  }
  await updateDoc(doc(collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS), requestId), updateData);
};

/**
 * Get requests where the current user is the student.
 */
export const getStudentRequests = async (
  studentId: string,
): Promise<StudentInstructorRequest[]> => {
  // Query both field variants
  const q1 = query(
    collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS),
    where('studentId', '==', studentId)
  );
  const snapshot1 = await getDocs(q1);

  const q2 = query(
    collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS),
    where('student_id', '==', studentId)
  );
  const snapshot2 = await getDocs(q2);

  // Deduplicate by doc ID
  const map = new Map<string, StudentInstructorRequest>();
  for (const doc of [...snapshot1.docs, ...snapshot2.docs]) {
    if (!map.has(doc.id)) {
      map.set(doc.id, { id: doc.id, ...doc.data() } as StudentInstructorRequest);
    }
  }
  return Array.from(map.values());
};

/**
 * Get requests where the current user is the instructor.
 */
export const getInstructorRequests = async (
  instructorId: string,
): Promise<StudentInstructorRequest[]> => {
  const q1 = query(
    collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS),
    where('instructorId', '==', instructorId)
  );
  const snapshot1 = await getDocs(q1);

  const q2 = query(
    collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS),
    where('instructor_id', '==', instructorId)
  );
  const snapshot2 = await getDocs(q2);

  const map = new Map<string, StudentInstructorRequest>();
  for (const doc of [...snapshot1.docs, ...snapshot2.docs]) {
    if (!map.has(doc.id)) {
      map.set(doc.id, { id: doc.id, ...doc.data() } as StudentInstructorRequest);
    }
  }
  return Array.from(map.values());
};

/**
 * Real-time listener for student's requests.
 */
export const onStudentRequests = (
  studentId: string,
  callback: (requests: StudentInstructorRequest[]) => void,
): (() => void) => {
  return onSnapshot(
    query(collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS), where('studentId', '==', studentId)),
    (snapshot) => callback(fromQuerySnapshot<StudentInstructorRequest>(snapshot)),
  );
};

/**
 * Real-time listener for instructor's requests.
 */
export const onInstructorRequests = (
  instructorId: string,
  callback: (requests: StudentInstructorRequest[]) => void,
): (() => void) => {
  return onSnapshot(
    query(collection(db, Collections.STUDENT_INSTRUCTOR_REQUESTS), where('instructorId', '==', instructorId)),
    (snapshot) => callback(fromQuerySnapshot<StudentInstructorRequest>(snapshot)),
  );
};
