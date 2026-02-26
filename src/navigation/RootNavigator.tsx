import AdminStack from "./admin/AdminStack";
import InstructorStack from "./instructor/InstructorStack";
import StudentStack from "./student/StudentStack";
import AuthStack from "./AuthStack";

const ROLES = {
    STUDENT: "student",
    INSTRUCTOR: "instructor",
    ADMIN: "admin"
}

const RootNavigator = () => {
    const USER_ROLE = ROLES.INSTRUCTOR;

    switch (USER_ROLE) {
        case ROLES.ADMIN:
            return <AdminStack />

        case ROLES.INSTRUCTOR:
            return <InstructorStack />

        case ROLES.STUDENT:
            return <StudentStack />

        default:
            return <AuthStack />
    }
}

export default RootNavigator;