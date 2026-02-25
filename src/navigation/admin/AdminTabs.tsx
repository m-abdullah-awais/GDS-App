import { createDrawerNavigator } from "@react-navigation/drawer";
import AdminDashboardScreen from "../../screens/admin/AdminDashboardScreen";
import AdminInstructorManagementScreen from "../../screens/admin/AdminInstructorManagementScreen";
import AdminStudentManagementScreen from "../../screens/admin/AdminStudentManagementScreen";
import AdminPackageManagementScreen from "../../screens/admin/AdminPackageManagementScreen";
import AdminPendingPackagesScreen from "../../screens/admin/AdminPendingPackagesScreen";
import AdminPendingUsersScreen from "../../screens/admin/AdminPendingUsersScreen";
import { useTheme } from "../../theme";

const Drawer = createDrawerNavigator();

const AdminTabs = () => {
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
            <Drawer.Screen name="Dashboard" component={AdminDashboardScreen} />
            <Drawer.Screen name="Instructor Management" component={AdminInstructorManagementScreen} />
            <Drawer.Screen name="Student Management" component={AdminStudentManagementScreen} />
            <Drawer.Screen name="Package Management" component={AdminPackageManagementScreen} />
            <Drawer.Screen name="Pending Packages" component={AdminPendingPackagesScreen} />
            <Drawer.Screen name="Pending Users" component={AdminPendingUsersScreen} />
        </Drawer.Navigator>
    )
}

export default AdminTabs;