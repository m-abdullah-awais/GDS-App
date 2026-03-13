/**
 * GDS Driving School — Auth Slice (Redux Toolkit)
 * ==================================================
 * Manages authentication state: Firebase user, Firestore profile,
 * role, and initialization status.
 *
 * NOTE: Profile data is serialized ONCE in useAuthStateListener
 * (toSerializable) before dispatch. No re-serialization needed here.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, UserRole } from '../../types';

// ─── State Shape ──────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface AuthState {
  /** Serializable Firebase Auth user summary. */
  user: AuthUser | null;
  /** Firestore user profile document. */
  profile: UserProfile | null;
  /** Resolved role from profile.role. */
  role: UserRole | null;
  /** True once the first onAuthStateChanged callback fires. */
  initialized: boolean;
  /** Auth operation in progress. */
  loading: boolean;
  /** Last auth error message. */
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  role: null,
  initialized: false,
  loading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      if (!action.payload) {
        state.profile = null;
        state.role = null;
      }
    },
    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.profile = action.payload;
      state.role = action.payload?.role ?? null;
    },
    setRole(state, action: PayloadAction<UserRole | null>) {
      state.role = action.payload;
    },
    setInitialized(state) {
      state.initialized = true;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearAuth(state) {
      state.user = null;
      state.profile = null;
      state.role = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setUser,
  setProfile,
  setRole,
  setInitialized,
  setLoading,
  setError,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
