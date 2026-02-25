import { createDrawerNavigator } from "@react-navigation/drawer";
import InstructorDashboardScreen from "../../screens/instructor/InstructorDashboardScreen";
import InstructorMyPackagesScreen from "../../screens/instructor/InstructorMyPackagesScreen";
import InstructorMyStudentsScreen from "../../screens/instructor/InstructorMyStudentsScreen";
import InstructorMessagesScreen from "../../screens/instructor/InstructorMessagesScreen";
import InstructorProfileScreen from "../../screens/instructor/InstructorProfileScreen";

const Drawer = createDrawerNavigator();

const InstructorTabs = () => {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Dashboard" component={InstructorDashboardScreen} />
            <Drawer.Screen name="My Packages" component={InstructorMyPackagesScreen} />
            <Drawer.Screen name="My Students" component={InstructorMyStudentsScreen} />
            <Drawer.Screen name="Messages" component={InstructorMessagesScreen} />
            <Drawer.Screen name="Profile" component={InstructorProfileScreen} />
        </Drawer.Navigator>
    )
}

export default InstructorTabs;