import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import AdminStack from './admin/AdminStack';
import InstructorStack from './instructor/InstructorStack';
import StudentStack from './student/StudentStack';
import AuthStack from './AuthStack';
import type { RootState } from '../store';
import { useTheme } from '../theme';

const RootNavigator = () => {
  const { theme } = useTheme();
  const { user, role, initialized } = useSelector((state: RootState) => state.auth);

  // Show splash / loading indicator until Firebase auth state resolves
  if (!initialized) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Not authenticated → show auth screens
  if (!user) {
    return <AuthStack />;
  }

  // Authenticated → route by Firestore role
  switch (role) {
    case 'admin':
      return <AdminStack />;
    case 'instructor':
      return <InstructorStack />;
    case 'student':
      return <StudentStack />;
    default:
      // Role not loaded yet — shouldn't persist, but guard anyway
      return <AuthStack />;
  }
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;