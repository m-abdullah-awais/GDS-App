import { createDrawerNavigator } from "@react-navigation/drawer";
import AdminDashboardScreen from "../../screens/admin/AdminDashboardScreen";
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
        </Drawer.Navigator>
    )
}

export default AdminTabs;