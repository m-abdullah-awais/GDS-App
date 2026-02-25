import React from 'react';
import StudentTabs from './StudentTabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InstructorDiscoveryScreen from '../../screens/student/InstructorDiscoveryScreen';
import InstructorProfileScreen from '../../screens/student/InstructorProfileScreen';
import PackageListingScreen from '../../screens/student/PackageListingScreen';
import BookingRequestScreen from '../../screens/student/BookingRequestScreen';
import MyLessonsScreen from '../../screens/student/MyLessonsScreen';
import StudentMessagesScreen from '../../screens/student/StudentMessagesScreen';
import ChatScreen from '../../screens/student/ChatScreen';
import { useTheme } from '../../theme';

export type StudentStackParamList = {
  StudentTabs: undefined;
  InstructorDiscovery: undefined;
  InstructorProfile: { instructorId: string };
  PackageListing: { instructorId: string };
  BookingRequest: { instructorId: string; packageId: string };
  MyLessons: undefined;
  StudentMessages: undefined;
  Chat: { conversationId: string; instructorName: string };
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
      }}>
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
      <Stack.Screen name="InstructorDiscovery" component={InstructorDiscoveryScreen} />
      <Stack.Screen name="InstructorProfile" component={InstructorProfileScreen} />
      <Stack.Screen name="PackageListing" component={PackageListingScreen} />
      <Stack.Screen name="BookingRequest" component={BookingRequestScreen} />
      <Stack.Screen name="MyLessons" component={MyLessonsScreen} />
      <Stack.Screen name="StudentMessages" component={StudentMessagesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default StudentStack;