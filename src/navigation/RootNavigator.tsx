import AdminTabs from "./admin/AdminTabs";
import AuthStack from "./AuthStack";
import InstructorTabs from "./instructor/InstructorTabs";
import StudentTabs from "./student/StudentTabs";

const ROLES = {
    STUDENT: "student",
    INSTRUCTOR: "instructor",
    ADMIN: "admin"
}

const RootNavigator = () => {
    const userRole = ROLES.INSTRUCTOR;

    switch (userRole) {
        case ROLES.ADMIN:
            return <AdminTabs />

        case ROLES.INSTRUCTOR:
            return <InstructorTabs />

        case ROLES.STUDENT:
            return <StudentTabs />

        default:
            return <AuthStack />
    }
}

export default RootNavigator;