/**
 * GDS Driving School — App Root
 *
 * @format
 */

import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './src/store';
import { ToastProvider } from './src/components/admin/ToastContext';
import { ConfirmationProvider } from './src/components/common';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import { useAuthStateListener } from './src/hooks';
import { linkingConfig } from './src/navigation/linking';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider initialScheme="system">
            <SafeAreaProvider>
              <ToastProvider>
                <ConfirmationProvider>
                  <AppContent />
                </ConfirmationProvider>
              </ToastProvider>
            </SafeAreaProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

function AppContent() {
  const { theme } = useTheme();

  // Subscribe to Firebase Auth state + Firestore user profile
  useAuthStateListener();

  const navigationTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.accent,
    },
  };

  return (
    <>
      <StatusBar barStyle={theme.colors.statusBar} />
      <NavigationContainer theme={navigationTheme} linking={linkingConfig}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default App;
