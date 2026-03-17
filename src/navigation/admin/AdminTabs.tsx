import React, { useCallback, useMemo } from 'react';
import { createDrawerNavigator, type DrawerContentComponentProps } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import AppTopHeader from '../../components/AppTopHeader';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { clearAuth } from '../../store/auth/authSlice';
import * as authService from '../../services/authService';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import { useConfirmation } from '../../components/common';

import AdminDashboardScreen from '../../screens/admin/AdminDashboardScreen';
import AdminStudentApprovalScreen from '../../screens/admin/AdminStudentApprovalScreen';
import AdminInstructorApprovalScreen from '../../screens/admin/AdminInstructorApprovalScreen';
import AdminPackageApprovalScreen from '../../screens/admin/AdminPackageApprovalScreen';
import AdminStudentManagementScreen from '../../screens/admin/AdminStudentManagementScreen';
import AdminInstructorManagementScreen from '../../screens/admin/AdminInstructorManagementScreen';
import AdminPaymentsScreen from '../../screens/admin/AdminPaymentsScreen';
import AdminReportsScreen from '../../screens/admin/AdminReportsScreen';
import AdminInstructorMessagesScreen from '../../screens/admin/AdminInstructorMessagesScreen';
import AdminProfileScreen from '../../screens/admin/AdminProfileScreen';

export type AdminTabsParamList = {
  Dashboard: undefined;
  'Student Approvals': undefined;
  'Instructor Approvals': undefined;
  'Package Approvals': undefined;
  'Student Management': undefined;
  'Instructor Management': undefined;
  Messages: undefined;
  Payments: undefined;
  Reports: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<AdminTabsParamList>();

const AdminTabs = () => {
  const { theme } = useTheme();
  const { confirm } = useConfirmation();
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.auth.profile);
  const userName = profile?.full_name || 'Admin';
  const userEmail = profile?.email || '';

  const handleLogout = useCallback(async () => {
    const shouldLogout = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmLabel: 'Logout',
      cancelLabel: 'Cancel',
      variant: 'destructive',
      icon: 'log-out-outline',
    });

    if (shouldLogout) {
      await authService.signOut();
      dispatch(clearAuth());
    }
  }, [confirm, dispatch]);

  const renderDrawerContent = useCallback(
    (props: DrawerContentComponentProps) => (
      <CustomDrawerContent
        {...props}
        userName={userName}
        userEmail={userEmail}
        roleLabel="Admin"
        onLogout={handleLogout}
      />
    ),
    [userName, userEmail, handleLogout],
  );

  const screenOptions = useMemo(
    () => ({
      header: ({ navigation, route, options }: any) => (
        <AppTopHeader
          title={options.title ?? route.name}
          subtitle="Admin Console"
          avatarText={userName}
          leftAction="menu"
          onLeftPress={() => navigation.openDrawer()}
        />
      ),
      drawerType: 'front' as const,
      swipeEdgeWidth: 50,
      overlayColor: 'rgba(0,0,0,0.5)',
      drawerStyle: { backgroundColor: theme.colors.background },
      drawerActiveTintColor: theme.colors.primary,
      drawerInactiveTintColor: theme.colors.textSecondary,
      drawerActiveBackgroundColor: theme.colors.primaryLight,
      drawerLabelStyle: { marginLeft: -10, fontSize: 15, fontWeight: '500' as const },
      sceneStyle: { backgroundColor: theme.colors.background },
      lazy: true,
      freezeOnBlur: true,
    }),
    [theme, userName],
  );

  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={screenOptions}>
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Student Approvals"
        component={AdminStudentApprovalScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Instructor Approvals"
        component={AdminInstructorApprovalScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Package Approvals"
        component={AdminPackageApprovalScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Student Management"
        component={AdminStudentManagementScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Instructor Management"
        component={AdminInstructorManagementScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Messages"
        component={AdminInstructorMessagesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Payments"
        component={AdminPaymentsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={AdminReportsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={AdminProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AdminTabs;
