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
import { authReducer } from './auth';
import { instructorReducer } from './instructor';

// ─── Persist Configuration ───────────────────────────────────────────────────
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state across app restarts
};

// ─── Root Reducer ─────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  student: studentReducer,
  instructor: instructorReducer,
});

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
