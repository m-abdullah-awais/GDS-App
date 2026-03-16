/**
 * @format
 */

// MUST be the first import for react-native-gesture-handler to work correctly
// with @react-navigation/drawer v7 and gesture-handler v2.
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';

// Suppress React Native Firebase modular migration warnings in runtime logs.
// The app already uses modular APIs, and this keeps actionable warnings visible.
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
