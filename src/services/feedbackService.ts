/**
 * GDS Driving School — Feedback Service
 * ========================================
 * Firestore operations for feedback flow:
 *   lessonCompletions → feedbackPending → feedback
 *   lessonCancellations
 */

import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  orderBy,
} from '@react-native-firebase/firestore';
import {
  Collections,
  fromSnapshot,
  fromQuerySnapshot,
  serverTimestamp,
  withDualIds,
} from '../utils/mappers';
import type {
  Feedback,
  FeedbackPending,
  LessonCompletion,
  LessonCancellation,
} from '../types';

// ─── Lesson Completions ──────────────────────────────────────────────────────

/**
 * Get lesson completions for a student.
 */
export const getStudentLessonCompletions = async (
  studentId: string,
): Promise<LessonCompletion[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.LESSON_COMPLETIONS),
      where('studentId', '==', studentId),
      orderBy('completedAt', 'desc'),
    ),
  );
  return fromQuerySnapshot<LessonCompletion>(snap);
};

/**
 * Get lesson completions for an instructor.
 */
export const getInstructorLessonCompletions = async (
  instructorId: string,
): Promise<LessonCompletion[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.LESSON_COMPLETIONS),
      where('instructorId', '==', instructorId),
      orderBy('completedAt', 'desc'),
    ),
  );
  return fromQuerySnapshot<LessonCompletion>(snap);
};

// ─── Feedback Pending ────────────────────────────────────────────────────────

/**
 * Get pending feedback items for a student.
 */
export const getPendingFeedback = async (
  studentId: string,
): Promise<FeedbackPending[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.FEEDBACK_PENDING),
      where('studentId', '==', studentId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
    ),
  );
  return fromQuerySnapshot<FeedbackPending>(snap);
};

/**
 * Subscribe to pending feedback for a student.
 */
export const onPendingFeedback = (
  studentId: string,
  callback: (items: FeedbackPending[]) => void,
): (() => void) => {
  return onSnapshot(
    query(
      collection(db, Collections.FEEDBACK_PENDING),
      where('studentId', '==', studentId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
    ),
    (snap) => callback(fromQuerySnapshot<FeedbackPending>(snap)),
  );
};

/**
 * Get pending feedback items for an instructor.
 * Matches web InstructorDashboard.tsx query:
 *   where('instructorId', '==', instructorId) + where('status', '==', 'pending')
 */
export const getInstructorPendingFeedback = async (
  instructorId: string,
): Promise<FeedbackPending[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.FEEDBACK_PENDING),
      where('instructorId', '==', instructorId),
      where('status', '==', 'pending'),
    ),
  );
  return fromQuerySnapshot<FeedbackPending>(snap);
};

/**
 * Subscribe to pending feedback for an instructor.
 * Matches web InstructorDashboard.tsx real-time query.
 */
export const onInstructorPendingFeedback = (
  instructorId: string,
  callback: (items: FeedbackPending[]) => void,
): (() => void) => {
  return onSnapshot(
    query(
      collection(db, Collections.FEEDBACK_PENDING),
      where('instructorId', '==', instructorId),
      where('status', '==', 'pending'),
    ),
    (snap) => callback(fromQuerySnapshot<FeedbackPending>(snap)),
  );
};

/**
 * Complete a pending feedback item without creating feedback
 * (used when lesson is marked cancelled from feedback modal flow).
 */
export const completePendingFeedback = async (
  feedbackPendingId: string,
  action: 'feedback_submitted' | 'lesson_cancelled' = 'feedback_submitted',
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.FEEDBACK_PENDING), feedbackPendingId), {
    status: 'completed',
    action,
    completedAt: serverTimestamp(),
  });
};

// ─── Submit Feedback ─────────────────────────────────────────────────────────

/**
 * Submit feedback for a completed lesson.
 */
export const submitFeedback = async (data: {
  studentId: string;
  instructorId: string;
  bookingId: string;
  rating: number;
  skills?: Array<{ skill: string; rating?: number; notes?: string }>;
  notes?: string;
  studentName?: string;
  instructorName?: string;
  lessonDate?: string;
  lessonTime?: string;
  duration?: number;
  lessonTitle?: string;
  feedbackPendingId: string;
}): Promise<string> => {
  // Derive primary skill name from first skill (matches web)
  const primarySkill = data.skills?.[0]?.skill || '';

  // 1. Write feedback doc — matching web FeedbackModal.tsx structure
  const feedbackRef = await addDoc(collection(db, Collections.FEEDBACK), {
    ...withDualIds(data.studentId, data.instructorId),
    bookingId: data.bookingId,
    booking_id: data.bookingId,
    studentName: data.studentName || '',
    instructorName: data.instructorName || '',
    lessonDate: data.lessonDate || '',
    lessonTime: data.lessonTime || '',
    duration: data.duration || 0,
    skills: data.skills || [],
    notes: data.notes || '',
    rating: data.rating,
    lesson_title: data.lessonTitle || '',
    skill: primarySkill,
    status: 'submitted',
    submittedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  // 2. Mark feedbackPending as completed — matching web status mechanism
  await updateDoc(doc(collection(db, Collections.FEEDBACK_PENDING), data.feedbackPendingId), {
    status: 'completed',
    action: 'feedback_submitted',
    completedAt: serverTimestamp(),
  });

  return feedbackRef.id;
};

// ─── Read Feedback ───────────────────────────────────────────────────────────

/**
 * Get all feedback for an instructor (for rating calculation).
 */
export const getInstructorFeedback = async (
  instructorId: string,
): Promise<Feedback[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.FEEDBACK),
      where('instructorId', '==', instructorId),
      orderBy('createdAt', 'desc'),
    ),
  );
  return fromQuerySnapshot<Feedback>(snap);
};

/**
 * Get feedback submitted by a student.
 */
export const getStudentFeedback = async (
  studentId: string,
): Promise<Feedback[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.FEEDBACK),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc'),
    ),
  );
  return fromQuerySnapshot<Feedback>(snap);
};

// ─── Lesson Cancellations ────────────────────────────────────────────────────

/**
 * Get cancellations for a student.
 */
export const getStudentCancellations = async (
  studentId: string,
): Promise<LessonCancellation[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.LESSON_CANCELLATIONS),
      where('studentId', '==', studentId),
      orderBy('cancelledAt', 'desc'),
    ),
  );
  return fromQuerySnapshot<LessonCancellation>(snap);
};
