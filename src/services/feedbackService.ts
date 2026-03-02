/**
 * GDS Driving School — Feedback Service
 * ========================================
 * Firestore operations for feedback flow:
 *   lessonCompletions → feedbackPending → feedback
 *   lessonCancellations
 */

import { db } from '../config/firebase';
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
  const snap = await db
    .collection(Collections.LESSON_COMPLETIONS)
    .where('studentId', '==', studentId)
    .orderBy('completedAt', 'desc')
    .get();
  return fromQuerySnapshot<LessonCompletion>(snap);
};

/**
 * Get lesson completions for an instructor.
 */
export const getInstructorLessonCompletions = async (
  instructorId: string,
): Promise<LessonCompletion[]> => {
  const snap = await db
    .collection(Collections.LESSON_COMPLETIONS)
    .where('instructorId', '==', instructorId)
    .orderBy('completedAt', 'desc')
    .get();
  return fromQuerySnapshot<LessonCompletion>(snap);
};

// ─── Feedback Pending ────────────────────────────────────────────────────────

/**
 * Get pending feedback items for a student.
 */
export const getPendingFeedback = async (
  studentId: string,
): Promise<FeedbackPending[]> => {
  const snap = await db
    .collection(Collections.FEEDBACK_PENDING)
    .where('studentId', '==', studentId)
    .where('submitted', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<FeedbackPending>(snap);
};

/**
 * Subscribe to pending feedback for a student.
 */
export const onPendingFeedback = (
  studentId: string,
  callback: (items: FeedbackPending[]) => void,
): (() => void) => {
  return db
    .collection(Collections.FEEDBACK_PENDING)
    .where('studentId', '==', studentId)
    .where('submitted', '==', false)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snap) => callback(fromQuerySnapshot<FeedbackPending>(snap)),
    );
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
  comment: string;
  feedbackPendingId: string;
}): Promise<string> => {
  // 1. Write feedback doc
  const feedbackRef = await db.collection(Collections.FEEDBACK).add({
    ...withDualIds(data.studentId, data.instructorId),
    bookingId: data.bookingId,
    booking_id: data.bookingId,
    rating: data.rating,
    comment: data.comment,
    createdAt: serverTimestamp(),
  });

  // 2. Mark feedbackPending as submitted
  await db
    .collection(Collections.FEEDBACK_PENDING)
    .doc(data.feedbackPendingId)
    .update({
      submitted: true,
      feedbackId: feedbackRef.id,
      submittedAt: serverTimestamp(),
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
  const snap = await db
    .collection(Collections.FEEDBACK)
    .where('instructorId', '==', instructorId)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<Feedback>(snap);
};

/**
 * Get feedback submitted by a student.
 */
export const getStudentFeedback = async (
  studentId: string,
): Promise<Feedback[]> => {
  const snap = await db
    .collection(Collections.FEEDBACK)
    .where('studentId', '==', studentId)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<Feedback>(snap);
};

// ─── Lesson Cancellations ────────────────────────────────────────────────────

/**
 * Get cancellations for a student.
 */
export const getStudentCancellations = async (
  studentId: string,
): Promise<LessonCancellation[]> => {
  const snap = await db
    .collection(Collections.LESSON_CANCELLATIONS)
    .where('studentId', '==', studentId)
    .orderBy('cancelledAt', 'desc')
    .get();
  return fromQuerySnapshot<LessonCancellation>(snap);
};
