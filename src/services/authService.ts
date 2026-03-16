/**
 * GDS Driving School — Auth Service
 * ====================================
 * Firebase Authentication operations.
 * Matches web app auth flows: email/password only,
 * user profile creation in Firestore `users/{uid}`.
 */

import { firebaseAuth, db } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as signOutAuth,
  sendPasswordResetEmail,
} from '@react-native-firebase/auth';
import { collection, doc, setDoc, getDoc, addDoc } from '@react-native-firebase/firestore';
import { serverTimestamp } from '../utils/mappers';
import type { UserRole } from '../types';

/**
 * Sign in with email and password.
 * Returns the Firebase User on success.
 */
export const signInWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
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
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  const { uid } = credential.user;

  // Create Firestore user profile
  await setDoc(doc(collection(db, 'users'), uid), {
    uid,
    email,
    full_name: fullName,
    role: 'student' as UserRole,
    status: 'active',
    termsAccepted: false,
    profileComplete: false,
    profile_completed: false,
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
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  const { uid } = credential.user;

  // Create Firestore user profile with instructor onboarding state
  await setDoc(doc(collection(db, 'users'), uid), {
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

  // Send welcome message (matches web AuthContext signUp)
  try {
    await addDoc(collection(db, 'messages'), {
      sender_id: 'system',
      sender_name: 'GDS Team',
      sender_role: 'admin',
      receiver_id: uid,
      receiver_role: 'instructor',
      subject: 'Welcome to GDS - Complete Your Profile',
      content: `Hi ${fullName},\n\nWelcome to GDS! Your instructor account has been created successfully.\n\nTo get started, please complete your profile by providing:\n\u2022 Your personal information\n\u2022 Required documents (instructor badge, insurance)\n\u2022 Profile picture\n\u2022 About me section\n\nOnce you submit your application, our admin team will review it and get back to you within 2-3 business days.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nThe GDS Team`,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Non-critical: don't block signup if welcome message fails
    if (__DEV__) console.warn('[AuthService] Failed to send welcome message:', error);
  }

  return credential.user;
};

/**
 * Sign out the current user.
 */
export const signOut = async () => {
  await signOutAuth(firebaseAuth);
};

/**
 * Send password reset email.
 * (Not implemented in current web source, but the Firebase API supports it.)
 */
export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(firebaseAuth, email);
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
  const snapshot = await getDoc(doc(collection(db, 'users'), uid));
  if (!snapshot.exists) return null;
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  const profile = { id: snapshot.id, ...data };
  if (__DEV__) console.log('[Firebase][READ][AuthService] getUserProfile', {
    uid,
    data: profile,
  });
  return profile;
};
