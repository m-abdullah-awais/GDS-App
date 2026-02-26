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
import { useTheme } from "../../theme";
import Ionicons from 'react-native-vector-icons/Ionicons';

export type InstructorTabsParamList = {
    Dashboard: undefined;
    Schedule: undefined;
    Availability: undefined;
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

    return (
        <Drawer.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.textPrimary,
                headerTitleStyle: { color: theme.colors.textPrimary },
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
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};

export default InstructorTabs;