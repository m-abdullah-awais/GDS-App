import { createDrawerNavigator } from "@react-navigation/drawer";
import StudentDashboardScreen from "../../screens/student/StudentDashboardScreen";
import StudentLessonsScreen from "../../screens/student/StudentLessonsScreen";
import StudentProfileScreen from "../../screens/student/StudentProfileScreen";
import StudentBookLessonsScreen from "../../screens/student/StudentBookLessonsScreen";
import StudentPurchaseHoursScreen from "../../screens/student/StudentPurchaseHoursScreen";
import StudentMyRequestsScreen from "../../screens/student/StudentMyRequestsScreen";
import StudentProgressScreen from "../../screens/student/StudentProgressScreen";
import StudentMessagesScreen from "../../screens/student/StudentMessagesScreen";

const Drawer = createDrawerNavigator();

const StudentTabs = () => {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Dashboard" component={StudentDashboardScreen} />
            <Drawer.Screen name="My Lessons" component={StudentLessonsScreen} />
            <Drawer.Screen name="Book Lessons" component={StudentBookLessonsScreen} />
            <Drawer.Screen name="Purchase Hours" component={StudentPurchaseHoursScreen} />
            <Drawer.Screen name="My Requests" component={StudentMyRequestsScreen} />
            <Drawer.Screen name="Messages" component={StudentMessagesScreen} />
            <Drawer.Screen name="Progress" component={StudentProgressScreen} />
            <Drawer.Screen name="Profile" component={StudentProfileScreen} />
        </Drawer.Navigator>
    )
}

export default StudentTabs;