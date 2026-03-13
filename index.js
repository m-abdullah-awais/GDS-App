/**
 * @format
 */

// MUST be the first import for react-native-gesture-handler to work correctly
// with @react-navigation/drawer v7 and gesture-handler v2.
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
