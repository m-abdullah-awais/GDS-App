/**
 * GDS Driving School — User Service
 * ====================================
 * Firestore CRUD for the `users` collection.
 */

import { db, firebaseAuth } from '../config/firebase';
import { firebaseStorage } from '../config/firebase';
import { Collections, fromSnapshot, fromQuerySnapshot, serverTimestamp } from '../utils/mappers';
import { collection, doc, getDoc, query, where, getDocs, limit, updateDoc, onSnapshot } from '@react-native-firebase/firestore';
import type { UserProfile, UserDoc } from '../types';

/**
 * Get a user profile by UID.
 */
export const getUserById = async (uid: string): Promise<UserDoc | null> => {
  const snapshot = await getDoc(doc(collection(db, Collections.USERS), uid));
  return fromSnapshot<UserDoc>(snapshot);
};

/**
 * Update the current user's profile fields.
 * Prevents mutation of Stripe account fields (security rules enforce this).
 */
export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  // Strip Stripe fields that are backend-managed
  const {
    stripeAccountId,
    stripeAccountStatus,
    stripeAccountCreatedAt,
    stripeAccountVerifiedAt,
    ...safeData
  } = data as any;

  await updateDoc(doc(collection(db, Collections.USERS), uid), {
    ...safeData,
    updated_at: serverTimestamp(),
  });
};

/**
 * Query active instructors (for student discovery).
 */
export const getActiveInstructors = async (): Promise<UserDoc[]> => {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error('[Firebase][UserService] User not authenticated');
  }

  try {
    // Match web: query approved instructors (the primary query)
    const approvedSnap = await getDocs(
      query(
        collection(db, Collections.USERS),
        where('role', '==', 'instructor'),
        where('approved', '==', true),
      ),
    );

    const instructors = fromQuerySnapshot<UserDoc>(approvedSnap);
    if (__DEV__) console.log('[UserService] Active instructors:', instructors.length);
    return instructors;
  } catch (error) {
    if (__DEV__) console.error('[UserService] getActiveInstructors error:', error);
    throw error;
  }
};

/**
 * Strip heavy base64 fields (profile images, badge/insurance scans)
 * to prevent megabytes of data from flooding the JS thread and Redux state.
 */
const stripHeavyFields = <T extends Record<string, any>>(doc: T): T => {
  const copy: Record<string, any> = { ...doc };
  // Preserve existence flags for document URLs before stripping heavy data
  if (copy.badge_url) { copy.badge_url = 'exists'; }
  if (copy.insurance_url) { copy.insurance_url = 'exists'; }
  delete copy.profile_picture_url;
  delete copy.profileImage;
  return copy as T;
};

/**
 * Query users by role.
 */
export const getUsersByRole = async (role: string, limitCount?: number): Promise<UserDoc[]> => {
  const constraints = limitCount
    ? [where('role', '==', role), limit(limitCount)]
    : [where('role', '==', role)];
  const q = query(collection(db, Collections.USERS), ...constraints);
  const snapshot = await getDocs(q);
  return fromQuerySnapshot<UserDoc>(snapshot).map(stripHeavyFields);
};

/**
 * Real-time listener for a user profile.
 * Returns unsubscribe function.
 */
export const onUserProfile = (
  uid: string,
  callback: (profile: UserDoc | null) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  return onSnapshot(
    doc(collection(db, Collections.USERS), uid),
    (snapshot) => callback(fromSnapshot<UserDoc>(snapshot)),
    (error) => onError?.(error as Error),
  );
};

// ─── Extended User Functions ─────────────────────────────────────────────────

/**
 * Complete an instructor's profile with additional details.
 */
export const completeInstructorProfile = async (
  uid: string,
  data: {
    phone?: string;
    experience?: string;
    car_transmission?: string;
    about_me?: string;
    address?: string;
    postcode?: string;
    badge_url?: string;
    insurance_url?: string;
    profile_picture_url?: string;
  },
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), uid), {
    ...data,
    profileComplete: true,
    profile_completed: true,
    status: 'pending',
    updated_at: serverTimestamp(),
  });
};

/**
 * Upload a profile image to Firebase Storage and update user doc.
 * Returns the download URL.
 */
export const uploadProfileImage = async (
  uid: string,
  imageUri: string,
): Promise<string> => {
  const ref = firebaseStorage.ref(`profileImages/${uid}`);
  await ref.putFile(imageUri);
  const downloadUrl = await ref.getDownloadURL();
  await updateDoc(doc(collection(db, Collections.USERS), uid), {
    profileImage: downloadUrl,
    profile_picture_url: downloadUrl,
    updated_at: serverTimestamp(),
  });
  return downloadUrl;
};

/**
 * Upload instructor documents (badge, insurance) to Firebase Storage.
 * Returns an object of download URLs.
 */
export const uploadInstructorDocuments = async (
  uid: string,
  documents: { badge?: string; insurance?: string },
): Promise<{ badgeUrl?: string; insuranceUrl?: string }> => {
  const results: { badgeUrl?: string; insuranceUrl?: string } = {};
  const updates: Record<string, unknown> = { updated_at: serverTimestamp() };

  if (documents.badge) {
    const badgeRef = firebaseStorage.ref(`instructorDocuments/${uid}/badge`);
    await badgeRef.putFile(documents.badge);
    results.badgeUrl = await badgeRef.getDownloadURL();
    updates.badge_url = results.badgeUrl;
  }

  if (documents.insurance) {
    const insRef = firebaseStorage.ref(`instructorDocuments/${uid}/insurance`);
    await insRef.putFile(documents.insurance);
    results.insuranceUrl = await insRef.getDownloadURL();
    updates.insurance_url = results.insuranceUrl;
  }

  await updateDoc(doc(collection(db, Collections.USERS), uid), updates);
  return results;
};

/**
 * Search students by name (client-side filter after role query).
 */
export const searchStudentsByQuery = async (query: string): Promise<UserDoc[]> => {
  const allStudents = await getUsersByRole('student');
  if (!query.trim()) {return allStudents;}
  const lowerQuery = query.toLowerCase();
  return allStudents.filter(s =>
    (s.full_name || '').toLowerCase().includes(lowerQuery) ||
    (s.email || '').toLowerCase().includes(lowerQuery) ||
    (s.postcode || '').toLowerCase().includes(lowerQuery),
  );
};
