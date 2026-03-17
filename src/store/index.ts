/**
 * GDS Driving School — Redux Store (Redux Toolkit)
 * ===================================================
 * Migrated from legacy createStore to configureStore.
 * Includes redux-persist for auth state persistence.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import adminReducer from './admin/reducer';
import studentReducer from './student/reducer';
import { authReducer } from './auth';
import { instructorReducer } from './instructor';
import offersReducer from './offers/offersSlice';

// ─── Root Reducer ─────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  student: studentReducer,
  instructor: instructorReducer,
  offers: offersReducer,
});

// ─── Persist Configuration ───────────────────────────────────────────────────
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state across app restarts
  // No transforms — auth profile is already serialized in useAuthStateListener
  // before it reaches Redux. The old authTransform was running sanitizeAuthProfile
  // redundantly on every persist cycle, wasting CPU.
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ─── Store ────────────────────────────────────────────────────────────────────
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  // Disabled — Redux DevTools records full state snapshots on every dispatch.
  // With 200+ admin records in state, this silently blocks the JS thread.
  devTools: false,
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
