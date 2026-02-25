import { createDrawerNavigator } from "@react-navigation/drawer";
import AdminDashboardScreen from "../../screens/admin/AdminDashboardScreen";

const Drawer = createDrawerNavigator();

const AdminTabs = () => {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Dashboard" component={AdminDashboardScreen} />
        </Drawer.Navigator>
    )
}

export default AdminTabs;