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
            }}
        >
            <Drawer.Screen name="Dashboard" component={StudentDashboardScreen} />
            <Drawer.Screen name="My Lessons" component={MyLessonsScreen} options={{ headerShown: false }} />
            <Drawer.Screen name="Find Instructors" component={InstructorDiscoveryScreen} options={{ headerShown: false }} />
            <Drawer.Screen name="Book Lessons" component={StudentBookLessonsScreen} />
            <Drawer.Screen name="My Requests" component={StudentMyRequestsScreen} options={{ headerShown: false }} />
            <Drawer.Screen name="Messages" component={StudentMessagesScreen} options={{ headerShown: false }} />
            <Drawer.Screen name="Progress" component={StudentProgressScreen} />
            <Drawer.Screen name="Profile" component={StudentProfileScreen} />
        </Drawer.Navigator>
    )
}

export default StudentTabs;