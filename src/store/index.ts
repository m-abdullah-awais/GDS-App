/**
 * GDS Driving School — Redux Store (Redux Toolkit)
 * ===================================================
 * Migrated from legacy createStore to configureStore.
 * Includes redux-persist for auth state persistence.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import adminReducer from './admin/reducer';
import studentReducer from './student/reducer';
import { authReducer, sanitizeAuthProfile } from './auth';
import { instructorReducer } from './instructor';

// ─── Root Reducer ─────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  student: studentReducer,
  instructor: instructorReducer,
});

const authTransform = createTransform(
  (inboundState: any) => {
    if (!inboundState) {
      return inboundState;
    }

    return {
      ...inboundState,
      profile: sanitizeAuthProfile(inboundState.profile ?? null),
    };
  },
  (outboundState: any) => {
    if (!outboundState) {
      return outboundState;
    }

    return {
      ...outboundState,
      profile: sanitizeAuthProfile(outboundState.profile ?? null),
    };
  },
  { whitelist: ['auth'] },
);

// ─── Persist Configuration ───────────────────────────────────────────────────
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state across app restarts
  transforms: [authTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ─── Store ────────────────────────────────────────────────────────────────────
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist action types for serializable check
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  const { useSelector } = require('react-redux');
  return useSelector(selector);
};

export default store;
