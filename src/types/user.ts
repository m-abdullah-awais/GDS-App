/**
 * GDS Driving School — User Domain Types
 * =========================================
 * Maps to Firestore `users` collection (doc id = auth UID).
 * Preserves both snake_case and camelCase variants from backend.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type UserRole = 'student' | 'instructor' | 'admin';
export type UserStatus = 'pending' | 'active' | 'rejected' | 'frozen';
export type StripeAccountStatus = 'pending_verification' | 'verified' | 'restricted';
export type TransmissionType = 'Manual' | 'Automatic' | 'Both';

/** Core user profile — fields present for all roles. */
export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  full_name: string;
  role: UserRole;

  // Status
  status?: UserStatus;
  approved?: boolean;
  profileComplete?: boolean;
  profile_completed?: boolean;

  // Timestamps (mixed formats in backend)
  createdAt?: FirebaseFirestoreTypes.Timestamp | Date | string;
  updated_at?: FirebaseFirestoreTypes.Timestamp;

  // Student-specific
  termsAccepted?: boolean;
  transmissionType?: TransmissionType;
  profileImage?: string; // base64 data URL or URL

  // Instructor-specific
  phone?: string;
  address?: string;
  postcode?: string;
  car_transmission?: TransmissionType | string;
  badge_number?: string;
  badge_url?: string;        // base64 data URL
  insurance_url?: string;    // base64 data URL
  profile_picture_url?: string; // base64 data URL or URL
  about_me?: string;

  // Stripe Connect (instructor)
  stripeAccountId?: string;
  stripeAccountStatus?: StripeAccountStatus;
  stripeAccountCreatedAt?: FirebaseFirestoreTypes.Timestamp;
  stripeAccountVerifiedAt?: FirebaseFirestoreTypes.Timestamp;

  // Instructor capability flags
  canCreatePackages?: boolean;
  canAcceptBookings?: boolean;
}

/** Firestore document reference type for users collection. */
export type UserDoc = UserProfile;
