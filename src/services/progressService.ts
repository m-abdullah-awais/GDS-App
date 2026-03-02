/**
 * GDS Driving School — Progress Service
 * =========================================
 * Firestore reads for `studentProgress` and `studentAchievements` collections.
 */

import { db } from '../config/firebase';
import { Collections, fromSnapshot } from '../utils/mappers';
import type { StudentProgress, StudentAchievement } from '../types';

/**
 * Get student progress document.
 */
export const getStudentProgress = async (studentId: string): Promise<StudentProgress | null> => {
  const snapshot = await db
    .collection(Collections.STUDENT_PROGRESS)
    .doc(studentId)
    .get();
  return fromSnapshot<StudentProgress>(snapshot);
};

/**
 * Get student achievements document.
 */
export const getStudentAchievements = async (studentId: string): Promise<StudentAchievement | null> => {
  const snapshot = await db
    .collection(Collections.STUDENT_ACHIEVEMENTS)
    .doc(studentId)
    .get();
  return fromSnapshot<StudentAchievement>(snapshot);
};

/**
 * Real-time listener for student progress.
 */
export const onStudentProgress = (
  studentId: string,
  callback: (progress: StudentProgress | null) => void,
): (() => void) => {
  return db
    .collection(Collections.STUDENT_PROGRESS)
    .doc(studentId)
    .onSnapshot(
      (snapshot) => callback(fromSnapshot<StudentProgress>(snapshot)),
    );
};
