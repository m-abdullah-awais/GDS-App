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
import { onAuthStateChanged, signOut } from '@react-native-firebase/auth';
import { collection, doc, onSnapshot } from '@react-native-firebase/firestore';
import {
  setUser,
  setProfile,
  setInitialized,
  clearAuth,
  setError,
} from '../store/auth';
import type { AuthUser } from '../store/auth';
import type { UserProfile } from '../types';

const toSerializable = (value: unknown): unknown => {
  if (value == null) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toSerializable);
  }

  if (typeof value === 'object') {
    const maybeTimestamp = value as { toDate?: () => Date };
    if (typeof maybeTimestamp.toDate === 'function') {
      return maybeTimestamp.toDate().toISOString();
    }

    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, nestedValue]) => [key, toSerializable(nestedValue)],
    );
    return Object.fromEntries(entries);
  }

  return value;
};

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

    const unsubscribeAuth = onAuthStateChanged(
      firebaseAuth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            console.log('[Firebase] User authenticated', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            });

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
            profileUnsubRef.current = onSnapshot(
              doc(collection(db, 'users'), firebaseUser.uid),
              (snapshot) => {
                  if (snapshot.exists()) {
                    const data = snapshot.data() || {};
                    const serializableData = toSerializable(data) as Record<string, unknown>;
                    const profileData: UserProfile = {
                      id: snapshot.id,
                      uid: firebaseUser.uid,
                      email: firebaseUser.email || '',
                      full_name: '',
                      role: 'student',
                      ...serializableData,
                    };
                    console.log('[Firebase] Data received: user profile', {
                      uid: firebaseUser.uid,
                      role: profileData.role,
                    });
                    dispatch(setProfile(profileData));
                  } else {
                    // Auth user exists but no Firestore profile → sign out
                    console.warn(
                      '[Auth] User profile missing in Firestore, signing out:',
                      firebaseUser.uid,
                    );
                    signOut(firebaseAuth);
                  }
                },
                (error) => {
                  console.error('[Firebase] Error output: profile snapshot', error);
                  dispatch(setError('Failed to load user profile'));
                },
              );
          } else {
            // No authenticated user
            console.log('[Firebase] User authenticated: none');
            cleanupProfileSub();
            dispatch(clearAuth());
          }
        } catch (error: any) {
          console.error('[Firebase] Error output: auth state', error);
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
