/**
 * GDS Driving School — Firebase Configuration (React Native Firebase)
 * =====================================================================
 * Singleton initialization for all Firebase services.
 *
 * React Native Firebase reads its config from native files:
 *   Android → android/app/google-services.json
 *   iOS     → ios/GDSMobileApplication/GoogleService-Info.plist
 *
 * This module exports ready-to-use service instances and
 * wires emulators in dev when USE_EMULATOR=true.
 */

import { getApp } from '@react-native-firebase/app';
import { getAuth, FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getFirestore, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getFunctions, FirebaseFunctionsTypes } from '@react-native-firebase/functions';
import { getStorage, FirebaseStorageTypes } from '@react-native-firebase/storage';
import Config from 'react-native-config';

// ─── Region-Bound Functions Instance ──────────────────────────────────────────
const FUNCTIONS_REGION = Config.FUNCTIONS_REGION || 'europe-west2';

// ─── Singleton Service Exports ────────────────────────────────────────────────
export const firebaseApp = getApp();
export const firebaseAuth: FirebaseAuthTypes.Module = getAuth();
export const db: FirebaseFirestoreTypes.Module = getFirestore();
export const cloudFunctions: FirebaseFunctionsTypes.Module = getFunctions();
export const firebaseStorage: FirebaseStorageTypes.Module = getStorage();

const firebaseOptions = firebaseApp.options || {};
console.log('[Firebase] Initialized', {
  projectId: firebaseOptions.projectId,
  appId: firebaseOptions.appId,
  storageBucket: firebaseOptions.storageBucket,
});

if (
  !firebaseOptions.appId ||
  String(firebaseOptions.appId).startsWith('YOUR_')
) {
  console.warn('[Firebase] Native config issue: appId appears to be a placeholder. Verify google-services.json / GoogleService-Info.plist.');
}

/**
 * Get a callable Cloud Function reference bound to europe-west2.
 * Usage: const result = await callable('createCheckoutSession')({ packageId, instructorId });
 */
export const callable = (functionName: string) => {
  return getFunctions(getApp(), FUNCTIONS_REGION).httpsCallable(functionName);
};

// ─── Emulator Wiring (dev only) ──────────────────────────────────────────────
const USE_EMULATOR = Config.USE_EMULATOR === 'true';
const EMULATOR_HOST = Config.EMULATOR_HOST || 'localhost';

if (__DEV__ && USE_EMULATOR) {
  // Auth emulator
  getAuth().useEmulator(`http://${EMULATOR_HOST}:9099`);

  // Firestore emulator
  getFirestore().useEmulator(EMULATOR_HOST, 8080);

  // Functions emulator
  getFunctions(getApp(), FUNCTIONS_REGION).useEmulator(EMULATOR_HOST, 5001);

  // Storage emulator
  getStorage().useEmulator(EMULATOR_HOST, 9199);

  console.log('[Firebase] Emulators connected:', EMULATOR_HOST);
}

// ─── Firestore Settings ──────────────────────────────────────────────────────
// Offline persistence is enabled by default in React Native Firebase.
// Uncomment below to configure cache size if needed:
// firestore().settings({ cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED });

// ─── Re-export Types ─────────────────────────────────────────────────────────
export type { FirebaseAuthTypes } from '@react-native-firebase/auth';
export type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
export type { FirebaseFunctionsTypes } from '@react-native-firebase/functions';
export type { FirebaseStorageTypes } from '@react-native-firebase/storage';
