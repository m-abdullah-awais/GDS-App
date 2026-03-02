/**
 * GDS Driving School — Package Domain Types
 * ============================================
 * Maps to `packages`, `pendingPackages`, `availablePackages` collections.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type PackageStatus = 'pending' | 'approved' | 'rejected';

/** Admin-side package record — `packages` collection. */
export interface Package {
  id: string;
  instructorId: string;
  instructorName?: string;
  title: string;
  description: string;
  number_of_lessons: number;
  price: number;
  commission_percent?: number;
  commission_amount?: number;
  finalPrice?: number;
  status: PackageStatus;
  approvedAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

/** Instructor-submitted pending package — `pendingPackages` collection. */
export interface PendingPackage {
  id: string;
  instructorId: string;
  instructorName?: string;
  instructorEmail?: string;
  title: string;
  description: string;
  number_of_lessons: number;
  price: number;
  status: 'pending';
  created_at?: string | FirebaseFirestoreTypes.Timestamp;
  // Edit mode fields
  type?: string;
  availablePackageId?: string;
}

/** Student-visible purchasing source — `availablePackages` collection. */
export interface AvailablePackage {
  id: string;
  instructorId: string;
  instructorName?: string;
  title: string;
  description: string;
  number_of_lessons: number;
  price: number;
  originalPrice?: number;
  commission_percent?: number;
  commission_amount?: number;
  status: 'approved' | 'pending';
  available?: boolean;
  approvedAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}
