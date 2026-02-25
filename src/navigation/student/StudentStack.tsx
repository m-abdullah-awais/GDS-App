import React from 'react'
import StudentTabs from './StudentTabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestScreen from '../../test/TestScreen';
import { useTheme } from '../../theme';

export type StudentStackParamList = {
    StudentTabs: undefined;
    Test: undefined;
};

const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: theme.colors.background },
            }}
        >
            <Stack.Screen name="StudentTabs" component={StudentTabs} />
            <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
    )
}

export default StudentStack