import { useSyncExternalStore } from 'react';
import AdminStack from "./admin/AdminStack";
import InstructorStack from "./instructor/InstructorStack";
import StudentStack from "./student/StudentStack";
import AuthStack from "./AuthStack";
import {
    getDevRoleOverride,
    subscribeDevRoleOverride,
} from './devAuth';

const ROLES = {
    STUDENT: "student",
    INSTRUCTOR: "instructor",
    ADMIN: "admin"
}

const RootNavigator = () => {
    const devRoleOverride = useSyncExternalStore(
        subscribeDevRoleOverride,
        getDevRoleOverride,
        getDevRoleOverride,
    );

    const USER_ROLE = __DEV__ ? devRoleOverride : ROLES.ADMIN;

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