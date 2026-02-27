import React from 'react';
import { Alert } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import AppTopHeader from '../../components/AppTopHeader';
import { clearDevRoleOverride } from '../devAuth';

import AdminDashboardScreen from '../../screens/admin/AdminDashboardScreen';
import AdminStudentApprovalScreen from '../../screens/admin/AdminStudentApprovalScreen';
import AdminInstructorApprovalScreen from '../../screens/admin/AdminInstructorApprovalScreen';
import AdminPackageApprovalScreen from '../../screens/admin/AdminPackageApprovalScreen';
import AdminStudentManagementScreen from '../../screens/admin/AdminStudentManagementScreen';
import AdminInstructorManagementScreen from '../../screens/admin/AdminInstructorManagementScreen';
import AdminPaymentsScreen from '../../screens/admin/AdminPaymentsScreen';
import AdminReportsScreen from '../../screens/admin/AdminReportsScreen';
import AdminSettingsScreen from '../../screens/admin/AdminSettingsScreen';
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
  Settings: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<AdminTabsParamList>();

const AdminTabs = () => {
  const { theme } = useTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => clearDevRoleOverride(),
      },
    ]);
  };

  return (
    <Drawer.Navigator
      screenOptions={{
        header: ({ navigation, route, options }) => (
          <AppTopHeader
            title={options.title ?? route.name}
            subtitle="Admin Console"
            avatarText="Admin"
            leftAction="menu"
            onLeftPress={() => navigation.toggleDrawer()}
            onAvatarPress={() => navigation.navigate('Profile')}
            onLogoutPress={handleLogout}
          />
        ),
        drawerStyle: { backgroundColor: theme.colors.background },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerActiveBackgroundColor: theme.colors.primaryLight,
        drawerLabelStyle: { marginLeft: -10, fontSize: 15, fontWeight: '500' },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}>
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
        //   headerShown: false,
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
        name="Settings"
        component={AdminSettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={AdminProfileScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} style={{ marginRight: 6 }} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AdminTabs;