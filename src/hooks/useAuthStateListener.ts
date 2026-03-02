/**
 * GDS Driving School — Auth State Listener Hook
 * =================================================
 * Subscribes to Firebase onAuthStateChanged + Firestore user profile.
 * Drives the auth slice in Redux.
 *
 * Behavior (matches web AuthContext):
 * 1. onAuthStateChanged fires → setUser
 * 2. If user present → onSnapshot on users/{uid}
 *    a. If profile doc exists → setProfile (role resolved from profile.role)
 *    b. If profile doc missing → sign out (match web behavior)
 * 3. If no user → clearAuth
 * 4. Set initialized = true after first callback
 */

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { firebaseAuth, db } from '../config/firebase';
import {
  setUser,
  setProfile,
  setInitialized,
  clearAuth,
  setError,
} from '../store/auth';
import type { AuthUser } from '../store/auth';
import type { UserProfile } from '../types';

const useAuthStateListener = () => {
  const dispatch = useDispatch();
  const profileUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up any existing profile subscription
    const cleanupProfileSub = () => {
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }
    };

    const unsubscribeAuth = firebaseAuth.onAuthStateChanged(
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Map Firebase user to serializable shape
            const authUser: AuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
            };
            dispatch(setUser(authUser));

            // Clean up previous profile listener
            cleanupProfileSub();

            // Real-time subscribe to Firestore user profile
            profileUnsubRef.current = db
              .collection('users')
              .doc(firebaseUser.uid)
              .onSnapshot(
                (snapshot) => {
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  if ((snapshot as any).exists) {
                    const data = snapshot.data() || {};
                    const profileData: UserProfile = {
                      id: snapshot.id,
                      uid: firebaseUser.uid,
                      email: firebaseUser.email || '',
                      full_name: '',
                      role: 'student',
                      ...data,
                    };
                    dispatch(setProfile(profileData));
                  } else {
                    // Auth user exists but no Firestore profile → sign out
                    console.warn(
                      '[Auth] User profile missing in Firestore, signing out:',
                      firebaseUser.uid,
                    );
                    firebaseAuth.signOut();
                  }
                },
                (error) => {
                  console.error('[Auth] Profile snapshot error:', error);
                  dispatch(setError('Failed to load user profile'));
                },
              );
          } else {
            // No authenticated user
            cleanupProfileSub();
            dispatch(clearAuth());
          }
        } catch (error: any) {
          console.error('[Auth] Auth state error:', error);
          dispatch(setError(error.message ?? 'Authentication error'));
        } finally {
          dispatch(setInitialized());
        }
      },
    );

    return () => {
      unsubscribeAuth();
      cleanupProfileSub();
    };
  }, [dispatch]);
};

export default useAuthStateListener;
