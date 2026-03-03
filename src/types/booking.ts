/**
 * GDS Driving School — Booking Domain Types
 * ============================================
 * Maps to `bookingRequests` and `bookings` collections.
 * Both snake_case and camelCase variants preserved.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type BookingRequestStatus = 'pending' | 'accepted' | 'declined' | 'amendment_pending' | 'completed';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

/** `bookingRequests` collection. */
export interface BookingRequest {
  id: string;

  // Dual-naming IDs (backend uses both)
  instructorId?: string;
  instructor_id?: string;
  studentId?: string;
  student_id?: string;

  // Display names
  instructorName?: string;
  studentName?: string;

  // Schedule
  date?: FirebaseFirestoreTypes.Timestamp | Date;
  startTime?: string;
  endTime?: string;
  duration?: number;

  // Timetable position (matches web)
  week?: number;
  day?: number;

  // Request metadata
  requestedBy?: 'student' | 'instructor';
  status: BookingRequestStatus;

  // Timestamps
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  acceptedAt?: FirebaseFirestoreTypes.Timestamp;
  declinedAt?: FirebaseFirestoreTypes.Timestamp;
  completedAt?: FirebaseFirestoreTypes.Timestamp;

  // Amendment references
  originalRequestId?: string;
  amendmentRequestId?: string;

  // Completion finance fields (optional)
  lessonDuration?: number;
  instructorPayout?: number;
  commissionAmount?: number;
}

/** `bookings` collection. */
export interface Booking {
  id: string;

  // Dual-naming IDs
  instructorId?: string;
  instructor_id?: string;
  studentId?: string;
  student_id?: string;

  // Display names
  instructorName?: string;
  studentName?: string;

  // Schedule (dual naming)
  date?: FirebaseFirestoreTypes.Timestamp | Date;
  scheduled_date?: FirebaseFirestoreTypes.Timestamp | Date;
  startTime?: string;
  endTime?: string;
  duration?: number;
  duration_hours?: number;

  // References
  packageId?: string;
  package_id?: string;
  bookingRequestId?: string;

  // Price
  total_price?: number;

  // Status
  status: BookingStatus;

  // Timestamps
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  completedAt?: FirebaseFirestoreTypes.Timestamp;
  updated_at?: FirebaseFirestoreTypes.Timestamp;
}
