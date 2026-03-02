/**
 * GDS Driving School — Assignment Domain Types
 * ================================================
 * Maps to `assignments` collection (student hours ledger per instructor).
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface CommissionSnapshot {
  adminCommissionPercent?: number;
  instructorPercent?: number;
  capturedAt?: FirebaseFirestoreTypes.Timestamp;
}

/** `assignments` collection — tracks purchased lesson hours per student-instructor pair. */
export interface Assignment {
  id: string;

  // Dual-naming IDs
  student_id?: string;
  studentId?: string;
  instructor_id?: string;
  instructorId?: string;

  // Hours
  remaining_hours: number;
  total_hours?: number;

  // Timestamps
  assigned_at?: FirebaseFirestoreTypes.Timestamp;
  updated_at?: FirebaseFirestoreTypes.Timestamp;

  // Payment references
  package_id?: string;
  created_by_payment?: string;
  created_by_checkout?: string;
  last_payment?: string;
  last_checkout?: string;

  // Commission snapshot
  commission_snapshot?: CommissionSnapshot;
}
