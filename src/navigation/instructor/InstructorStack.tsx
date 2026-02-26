import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InstructorTabs from './InstructorTabs';
import InstructorCompleteProfileScreen from '../../screens/instructor/InstructorCompleteProfileScreen';
import InstructorPendingApprovalScreen from '../../screens/instructor/InstructorPendingApprovalScreen';
import InstructorAreasScreen from '../../screens/instructor/InstructorAreasScreen';
import InstructorCreatePackageScreen from '../../screens/instructor/InstructorCreatePackageScreen';
import InstructorChatScreen from '../../screens/instructor/InstructorChatScreen';
import { useTheme } from '../../theme';

export type InstructorStackParamList = {
  CompleteProfile: undefined;
  PendingApproval: undefined;
  InstructorTabs: undefined;
  Areas: undefined;
  CreatePackage: undefined;
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
      <Stack.Screen name="CreatePackage" component={InstructorCreatePackageScreen} />
      <Stack.Screen name="Chat" component={InstructorChatScreen} />
    </Stack.Navigator>
  );
};

export default InstructorStack;