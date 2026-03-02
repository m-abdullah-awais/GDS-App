import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import StudentDashboardScreen from "../../screens/student/StudentDashboardScreen";
import MyLessonsScreen from "../../screens/student/MyLessonsScreen";
import StudentProfileScreen from "../../screens/student/StudentProfileScreen";
import MyInstructorsScreen from "../../screens/student/MyInstructorsScreen";
import StudentProgressScreen from "../../screens/student/StudentProgressScreen";
import StudentMessagesScreen from "../../screens/student/StudentMessagesScreen";
import InstructorDiscoveryScreen from "../../screens/student/InstructorDiscoveryScreen";
import { useTheme } from "../../theme";
import Ionicons from "react-native-vector-icons/Ionicons";
import AppTopHeader from '../../components/AppTopHeader';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { clearAuth } from '../../store/auth/authSlice';
import * as authService from '../../services/authService';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import StudentBookLessonsScreen from '../../screens/student/StudentBookLessonsScreen';
import { useConfirmation } from '../../components/common';

const Drawer = createDrawerNavigator();

const StudentTabs = () => {
    const { theme } = useTheme();
    const { confirm } = useConfirmation();
    const dispatch = useDispatch();
    const profile = useSelector((state: RootState) => state.auth.profile);
    const userName = profile?.full_name || 'Student';
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
                    roleLabel="Student"
                    onLogout={handleLogout}
                />
            )}
            screenOptions={{
                header: ({ navigation, route, options }) => (
                    <AppTopHeader
                        title={options.title ?? route.name}
                        subtitle="Student Journey"
                        avatarText="Student"
                        leftAction="menu"
                        onLeftPress={() => navigation.toggleDrawer()}
                    />
                ),
                drawerStyle: { backgroundColor: theme.colors.background },
                drawerActiveTintColor: theme.colors.primary,
                drawerInactiveTintColor: theme.colors.textSecondary,
                drawerActiveBackgroundColor: theme.colors.primaryLight,
                sceneStyle: { backgroundColor: theme.colors.background },
                drawerLabelStyle: { marginLeft: -10, fontSize: 15, fontWeight: '500' },
            }}
        >
            <Drawer.Screen
                name="Dashboard"
                component={StudentDashboardScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="My Lessons"
                component={MyLessonsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Search Instructors"
                component={InstructorDiscoveryScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="My Instructors"
                component={MyInstructorsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Book Lesson"
                component={StudentBookLessonsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Messages"
                component={StudentMessagesScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Progress"
                component={StudentProgressScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="bar-chart-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={StudentProfileScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
        </Drawer.Navigator>
    )
}

export default StudentTabs;