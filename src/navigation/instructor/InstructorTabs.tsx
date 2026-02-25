import { createDrawerNavigator } from "@react-navigation/drawer";
import InstructorDashboardScreen from "../../screens/instructor/InstructorDashboardScreen";
import InstructorMyPackagesScreen from "../../screens/instructor/InstructorMyPackagesScreen";
import InstructorMyStudentsScreen from "../../screens/instructor/InstructorMyStudentsScreen";
import InstructorMessagesScreen from "../../screens/instructor/InstructorMessagesScreen";
import InstructorProfileScreen from "../../screens/instructor/InstructorProfileScreen";
import { useTheme } from "../../theme";

const Drawer = createDrawerNavigator();

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
                sceneStyle: { backgroundColor: theme.colors.background },
            }}
        >
            <Drawer.Screen name="Dashboard" component={InstructorDashboardScreen} />
            <Drawer.Screen name="My Packages" component={InstructorMyPackagesScreen} />
            <Drawer.Screen name="My Students" component={InstructorMyStudentsScreen} />
            <Drawer.Screen name="Messages" component={InstructorMessagesScreen} />
            <Drawer.Screen name="Profile" component={InstructorProfileScreen} />
        </Drawer.Navigator>
    )
}

export default InstructorTabs;