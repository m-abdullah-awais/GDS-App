import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import InstructorDashboardScreen from "../../screens/instructor/InstructorDashboardScreen";
import InstructorScheduleScreen from "../../screens/instructor/InstructorScheduleScreen";
import InstructorAvailabilityScreen from "../../screens/instructor/InstructorAvailabilityScreen";
import InstructorEarningsScreen from "../../screens/instructor/InstructorEarningsScreen";
import InstructorRequestsScreen from "../../screens/instructor/InstructorRequestsScreen";
import InstructorPendingReviewsScreen from "../../screens/instructor/InstructorPendingReviewsScreen";
import InstructorStudentSearchScreen from "../../screens/instructor/InstructorStudentSearchScreen";
import InstructorMessagesScreen from "../../screens/instructor/InstructorMessagesScreen";
import InstructorProfileScreen from "../../screens/instructor/InstructorProfileScreen";
import InstructorPackageScreen from "../../screens/instructor/InstructorPackageScreen";
import { useTheme } from "../../theme";
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppTopHeader from '../../components/AppTopHeader';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { clearAuth } from '../../store/auth/authSlice';
import * as authService from '../../services/authService';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import { useConfirmation } from '../../components/common';

export type InstructorTabsParamList = {
    Dashboard: undefined;
    Schedule: undefined;
    Availability: undefined;
    Packages: undefined;
    Earnings: undefined;
    Requests: undefined;
    'Pending Reviews': undefined;
    'Find Students': undefined;
    Messages: undefined;
    Profile: undefined;
};

const Drawer = createDrawerNavigator<InstructorTabsParamList>();

const InstructorTabs = () => {
    const { theme } = useTheme();
    const { confirm } = useConfirmation();
    const dispatch = useDispatch();
    const profile = useSelector((state: RootState) => state.auth.profile);
    const userName = profile?.full_name || 'Instructor';
    const userEmail = profile?.email || '';

    const handleLogout = async () => {
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
    };

    return (
        <Drawer.Navigator
            drawerContent={(props) => (
                <CustomDrawerContent
                    {...props}
                    userName={userName}
                    userEmail={userEmail}
                    roleLabel="Instructor"
                    onLogout={handleLogout}
                />
            )}
            screenOptions={{
                header: ({ navigation, route, options }) => (
                    <AppTopHeader
                        title={options.title ?? route.name}
                        subtitle="Instructor Workspace"
                        avatarText="Instructor"
                        leftAction="menu"
                        onLeftPress={() => navigation.toggleDrawer()}
                    />
                ),
                drawerStyle: { backgroundColor: theme.colors.background },
                drawerActiveTintColor: theme.colors.primary,
                drawerInactiveTintColor: theme.colors.textSecondary,
                drawerActiveBackgroundColor: theme.colors.primaryLight,
                drawerLabelStyle: { marginLeft: -10, fontSize: 15, fontWeight: '500' },
                sceneStyle: { backgroundColor: theme.colors.background },
            }}
        >
            <Drawer.Screen
                name="Dashboard"
                component={InstructorDashboardScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Schedule"
                component={InstructorScheduleScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Availability"
                component={InstructorAvailabilityScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Packages"
                component={InstructorPackageScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="cube-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Earnings"
                component={InstructorEarningsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="cash-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Requests"
                component={InstructorRequestsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="mail-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Pending Reviews"
                component={InstructorPendingReviewsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="star-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Find Students"
                component={InstructorStudentSearchScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Messages"
                component={InstructorMessagesScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={InstructorProfileScreen}
                options={{
                    // headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};

export default InstructorTabs;