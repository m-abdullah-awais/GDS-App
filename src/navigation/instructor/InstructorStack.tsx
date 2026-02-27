import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InstructorTabs from './InstructorTabs';
import InstructorCompleteProfileScreen from '../../screens/instructor/InstructorCompleteProfileScreen';
import InstructorPendingApprovalScreen from '../../screens/instructor/InstructorPendingApprovalScreen';
import InstructorAreasScreen from '../../screens/instructor/InstructorAreasScreen';
import InstructorPackageScreen from '../../screens/instructor/InstructorPackageScreen';
import InstructorChatScreen from '../../screens/instructor/InstructorChatScreen';
import InstructorAvailabilityScreen from '../../screens/instructor/InstructorAvailabilityScreen';
import InstructorScheduleScreen from '../../screens/instructor/InstructorScheduleScreen';
import InstructorRequestsScreen from '../../screens/instructor/InstructorRequestsScreen';
import InstructorEarningsScreen from '../../screens/instructor/InstructorEarningsScreen';
import { useTheme } from '../../theme';

export type InstructorStackParamList = {
  CompleteProfile: undefined;
  PendingApproval: undefined;
  InstructorTabs: undefined;
  Areas: undefined;
  CreatePackage: undefined;
  Availability: undefined;
  Schedule: undefined;
  Requests: undefined;
  Earnings: undefined;
  Chat: { conversationId: string; studentName: string };
};

const Stack = createNativeStackNavigator<InstructorStackParamList>();

const InstructorStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen name="InstructorTabs" component={InstructorTabs} />
      <Stack.Screen name="CompleteProfile" component={InstructorCompleteProfileScreen} />
      <Stack.Screen name="PendingApproval" component={InstructorPendingApprovalScreen} />
      <Stack.Screen name="Areas" component={InstructorAreasScreen} />
      <Stack.Screen name="CreatePackage" component={InstructorPackageScreen} />
      <Stack.Screen name="Availability" component={InstructorAvailabilityScreen} />
      <Stack.Screen name="Schedule" component={InstructorScheduleScreen} />
      <Stack.Screen name="Requests" component={InstructorRequestsScreen} />
      <Stack.Screen name="Earnings" component={InstructorEarningsScreen} />
      <Stack.Screen name="Chat" component={InstructorChatScreen} />
    </Stack.Navigator>
  );
};

export default InstructorStack;