/**
 * GDS Driving School — Progress Service
 * =========================================
 * Firestore reads for `studentProgress` and `studentAchievements` collections.
 */

import { getDoc, doc, collection, onSnapshot } from '@react-native-firebase/firestore';
import { db } from '../config/firebase';
import { Collections, fromSnapshot } from '../utils/mappers';
import type { StudentProgress, StudentAchievement } from '../types';

/**
 * Get student progress document.
 */
export const getStudentProgress = async (studentId: string): Promise<StudentProgress | null> => {
  const snapshot = await getDoc(doc(collection(db, Collections.STUDENT_PROGRESS), studentId));
  return fromSnapshot<StudentProgress>(snapshot);
};

/**
 * Get student achievements document.
 */
export const getStudentAchievements = async (studentId: string): Promise<StudentAchievement | null> => {
  const snapshot = await getDoc(doc(collection(db, Collections.STUDENT_ACHIEVEMENTS), studentId));
  return fromSnapshot<StudentAchievement>(snapshot);
};

/**
 * Real-time listener for student progress.
 */
export const onStudentProgress = (
  studentId: string,
  callback: (progress: StudentProgress | null) => void,
): (() => void) => {
  return onSnapshot(doc(collection(db, Collections.STUDENT_PROGRESS), studentId),
    (snapshot) => callback(fromSnapshot<StudentProgress>(snapshot)),
  );
};
