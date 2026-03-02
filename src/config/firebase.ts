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

import firebase from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import functions, { FirebaseFunctionsTypes } from '@react-native-firebase/functions';
import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';
import Config from 'react-native-config';

// ─── Region-Bound Functions Instance ──────────────────────────────────────────
const FUNCTIONS_REGION = Config.FUNCTIONS_REGION || 'europe-west2';

// ─── Singleton Service Exports ────────────────────────────────────────────────
export const firebaseApp = firebase.app();
export const firebaseAuth: FirebaseAuthTypes.Module = auth();
export const db: FirebaseFirestoreTypes.Module = firestore();
export const cloudFunctions: FirebaseFunctionsTypes.Module = functions();
export const firebaseStorage: FirebaseStorageTypes.Module = storage();

/**
 * Get a callable Cloud Function reference bound to europe-west2.
 * Usage: const result = await callable('createCheckoutSession')({ packageId, instructorId });
 */
export const callable = (functionName: string) => {
  return firebase.app().functions(FUNCTIONS_REGION).httpsCallable(functionName);
};

// ─── Emulator Wiring (dev only) ──────────────────────────────────────────────
const USE_EMULATOR = Config.USE_EMULATOR === 'true';
const EMULATOR_HOST = Config.EMULATOR_HOST || 'localhost';

if (__DEV__ && USE_EMULATOR) {
  // Auth emulator
  auth().useEmulator(`http://${EMULATOR_HOST}:9099`);

  // Firestore emulator
  firestore().useEmulator(EMULATOR_HOST, 8080);

  // Functions emulator
  firebase.app().functions(FUNCTIONS_REGION).useEmulator(EMULATOR_HOST, 5001);

  // Storage emulator
  storage().useEmulator(EMULATOR_HOST, 9199);

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

export { firebase };
export default firebase;
