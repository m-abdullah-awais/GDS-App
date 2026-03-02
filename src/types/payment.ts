/**
 * GDS Driving School — Payment / Transaction Domain Types
 * ==========================================================
 * Maps to `transactions`, `payments`, `instructorPayments`,
 * `weeklyInstructorPayments`, `payouts`, `purchases` collections.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/** `transactions` collection (Cloud Functions-owned financial log). */
export interface Transaction {
  id: string;
  student_id: string;
  instructor_id: string;
  package_id?: string;
  package_title?: string;
  instructor_name?: string;
  amount: number;
  currency?: string;
  payment_intent_id?: string;
  checkout_session_id?: string;
  hours_purchased?: number;
  status: 'completed' | 'failed' | 'canceled';
  error_message?: string;
  processed_via?: 'webhook' | 'checkout_webhook' | 'checkout_callable_fallback';
  created_at?: FirebaseFirestoreTypes.Timestamp;
}

/** `payments` collection (admin manual payout records). */
export interface Payment {
  id: string;
  instructorId: string;
  instructorName?: string;
  amount: number;
  currency?: string;
  processedBy?: string;
  processedByName?: string;
  processedAt?: FirebaseFirestoreTypes.Timestamp;
  type?: 'stripe_connect_payout';
  method?: 'stripe';
  status: 'completed' | 'failed' | 'processed';
  stripeTransferId?: string;
  stripeError?: string;
  stripeErrorType?: string;
}

/** `instructorPayments` collection (per-lesson earnings). */
export interface InstructorPayment {
  id: string;
  instructorId: string;
  instructorName?: string;
  studentId: string;
  studentName?: string;
  bookingId: string;
  lessonDate?: string;
  duration?: number;
  packagePrice?: number;
  pricePerHour?: number;
  commissionRate?: number;
  instructorPayment?: number;
  commissionAmount?: number;
  companyEarnings?: number;
  instructorPayout?: number;
  status: 'completed';
  completedAt?: FirebaseFirestoreTypes.Timestamp;
}

/** `weeklyInstructorPayments` collection (doc id = instructorId). */
export interface WeeklyInstructorPayment {
  id: string;
  instructorId: string;
  instructorName?: string;
  weeklyInstructorPayment?: number;
  weeklyLessonsCompleted?: number;
  weeklyTotalHours?: number;
  weeklyCommission?: number;
  weeklyCompanyEarnings?: number;
  weekStart?: FirebaseFirestoreTypes.Timestamp | string;
  lastUpdated?: FirebaseFirestoreTypes.Timestamp;
  lastPayout?: FirebaseFirestoreTypes.Timestamp;
  lastPayoutAmount?: number;
  lastPayoutId?: string;
}

/** `payouts` collection. */
export interface Payout {
  id: string;
  instructorId: string;
  instructorName?: string;
  weekStart?: string;
  weekEnd?: string;
  amount: number;
  completionCount?: number;
  stripeTransferId?: string;
  status: 'completed';
  processedAt?: FirebaseFirestoreTypes.Timestamp;
}

/** `purchases` collection (financial rollups). */
export interface Purchase {
  id: string;
  studentId: string;
  instructorId: string;
  status: string;
  finalPrice?: number;
  commissionAmount?: number;
}
