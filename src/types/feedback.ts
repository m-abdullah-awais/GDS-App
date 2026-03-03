/**
 * GDS Driving School — Feedback / Lesson Completion Domain Types
 * ================================================================
 * Maps to `feedback`, `feedbackPending`, `lessonCompletions`,
 * `lessonCancellations` collections.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { CommissionSnapshot } from './assignment';

export type PayoutStatus = 'pending' | 'paid' | 'failed' | 'manual_required';

/** `feedback` collection. */
export interface Feedback {
  id: string;
  bookingId: string;

  // Dual-naming IDs
  studentId?: string;
  student_id?: string;
  instructorId?: string;
  instructor_id?: string;

  studentName?: string;
  instructorName?: string;
  lessonDate?: string;
  lessonTime?: string;
  duration?: number;
  lesson_title?: string;
  skill?: string;
  skills?: Array<{ skill: string; rating?: number; notes?: string }>;
  notes?: string;
  rating?: number;
  status?: 'submitted' | 'reviewed';
  submittedAt?: FirebaseFirestoreTypes.Timestamp;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
}

/** `feedbackPending` collection. */
export interface FeedbackPending {
  id: string;
  bookingId: string;

  // Dual-naming IDs
  studentId?: string;
  student_id?: string;
  instructorId?: string;
  instructor_id?: string;

  studentName?: string;
  instructorName?: string;
  lessonDate?: string;
  lessonTime?: string;
  duration?: number;

  status: 'pending' | 'completed';
  action?: string;
  completedAt?: FirebaseFirestoreTypes.Timestamp;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
}

/** `lessonCompletions` collection. */
export interface LessonCompletion {
  id: string;
  bookingId: string;

  // Identifiers
  studentId: string;
  studentName?: string;
  instructorId: string;
  instructorName?: string;

  // Lesson details
  lessonDate?: string;
  lessonTime?: string;
  duration?: number;

  // Package / finance
  packageId?: string;
  packagePrice?: number;
  pricePerHour?: number;
  commissionSnapshot?: CommissionSnapshot;
  instructorPayment?: number;
  commissionAmount?: number;
  companyEarnings?: number;
  instructorPayout?: number;

  // Status
  status: 'completed';
  payoutStatus?: PayoutStatus;

  // Timestamps & payout
  completedAt?: FirebaseFirestoreTypes.Timestamp;
  payoutDate?: FirebaseFirestoreTypes.Timestamp;
  payoutError?: string;
  stripeTransferId?: string;
}

/** `lessonCancellations` collection. */
export interface LessonCancellation {
  id: string;
  bookingId: string;

  // Identifiers
  studentId: string;
  studentName?: string;
  instructorId: string;

  // Lesson details
  lessonDate?: string;
  lessonTime?: string;
  duration?: number;

  // Cancellation
  reason: string;
  compensationHours?: number;
  totalRefundHours?: number;
  status: 'cancelled';
  cancelledAt?: FirebaseFirestoreTypes.Timestamp;
}
