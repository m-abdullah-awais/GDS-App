import { createDrawerNavigator } from "@react-navigation/drawer";
import StudentDashboardScreen from "../../screens/student/StudentDashboardScreen";
import MyLessonsScreen from "../../screens/student/MyLessonsScreen";
import StudentProfileScreen from "../../screens/student/StudentProfileScreen";
import StudentBookLessonsScreen from "../../screens/student/StudentBookLessonsScreen";
import StudentMyRequestsScreen from "../../screens/student/StudentMyRequestsScreen";
import StudentProgressScreen from "../../screens/student/StudentProgressScreen";
import StudentMessagesScreen from "../../screens/student/StudentMessagesScreen";
import InstructorDiscoveryScreen from "../../screens/student/InstructorDiscoveryScreen";
import { useTheme } from "../../theme";
import Ionicons from "react-native-vector-icons/Ionicons";

const Drawer = createDrawerNavigator();

const StudentTabs = () => {
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
                name="Find Instructors"
                component={InstructorDiscoveryScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Book Lessons"
                component={StudentBookLessonsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" size={size} color={color} style={{ marginRight: 6 }} />
                    ),
                }}
            />
            <Drawer.Screen
                name="My Requests"
                component={StudentMyRequestsScreen}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} style={{ marginRight: 6 }} />
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