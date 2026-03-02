/**
 * GDS Driving School — Auth Service
 * ====================================
 * Firebase Authentication operations.
 * Matches web app auth flows: email/password only,
 * user profile creation in Firestore `users/{uid}`.
 */

import { firebaseAuth, db } from '../config/firebase';
import { serverTimestamp } from '../utils/mappers';
import type { UserRole } from '../types';

/**
 * Sign in with email and password.
 * Returns the Firebase User on success.
 */
export const signInWithEmail = async (email: string, password: string) => {
  const credential = await firebaseAuth.signInWithEmailAndPassword(email, password);
  return credential.user;
};

/**
 * Sign up a new student.
 * Creates Firebase Auth user + Firestore `users/{uid}` profile doc.
 */
export const signUpStudent = async (
  email: string,
  password: string,
  fullName: string,
) => {
  const credential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
  const { uid } = credential.user;

  // Create Firestore user profile
  await db.collection('users').doc(uid).set({
    uid,
    email,
    full_name: fullName,
    role: 'student' as UserRole,
    status: 'active',
    termsAccepted: false,
    createdAt: serverTimestamp(),
  });

  return credential.user;
};

/**
 * Sign up a new instructor.
 * Creates Firebase Auth user + Firestore `users/{uid}` profile doc
 * with pending status and incomplete profile flags.
 */
export const signUpInstructor = async (
  email: string,
  password: string,
  fullName: string,
) => {
  const credential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
  const { uid } = credential.user;

  // Create Firestore user profile with instructor onboarding state
  await db.collection('users').doc(uid).set({
    uid,
    email,
    full_name: fullName,
    role: 'instructor' as UserRole,
    status: 'pending',
    approved: false,
    profileComplete: false,
    profile_completed: false,
    createdAt: serverTimestamp(),
  });

  return credential.user;
};

/**
 * Sign out the current user.
 */
export const signOut = async () => {
  await firebaseAuth.signOut();
};

/**
 * Send password reset email.
 * (Not implemented in current web source, but the Firebase API supports it.)
 */
export const sendPasswordReset = async (email: string) => {
  await firebaseAuth.sendPasswordResetEmail(email);
};

/**
 * Get the current authenticated user (synchronous check).
 */
export const getCurrentUser = () => {
  return firebaseAuth.currentUser;
};

/**
 * Fetch a user's Firestore profile document.
 */
export const getUserProfile = async (uid: string) => {
  const snapshot = await db.collection('users').doc(uid).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};
