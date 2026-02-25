import React from 'react'
import StudentTabs from './StudentTabs'
import StudentBookLessonsScreen from '../../screens/student/StudentBookLessonsScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestScreen from '../../test/TestScreen';

export type StudentStackParamList = {
    StudentTabs: undefined;
    Test: undefined;
};

const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="StudentTabs" component={StudentTabs} />
            <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
    )
}

export default StudentStack