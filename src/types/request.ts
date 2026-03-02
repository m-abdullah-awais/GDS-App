/**
 * GDS Driving School — Student-Instructor Request Domain Types
 * ==============================================================
 * Maps to `studentInstructorRequests` collection.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type SIRequestStatus = 'pending' | 'accepted' | 'rejected' | 'confirmed';

/** `studentInstructorRequests` collection. */
export interface StudentInstructorRequest {
  id: string;

  // Dual-naming IDs
  studentId?: string;
  student_id?: string;
  instructorId?: string;
  instructor_id?: string;

  // Student details (optional)
  studentName?: string;
  studentEmail?: string;
  studentPostcode?: string;
  studentTransmission?: string;

  // Request metadata
  initiatedBy?: 'student' | 'instructor';
  status: SIRequestStatus;

  // Timestamps
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  acceptedAt?: FirebaseFirestoreTypes.Timestamp;
  rejectedAt?: FirebaseFirestoreTypes.Timestamp;
}
