import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminTabs from './AdminTabs';
import AdminInstructorChatScreen from '../../screens/admin/AdminInstructorChatScreen';
// import AdminInstructorChatScreen from '../../screens/admin/AdminInstructorChatScreen';

export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminChat: {
    conversationId: string;
    instructorName: string;
  };
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AdminChat" component={AdminInstructorChatScreen} />
    </Stack.Navigator>
  );
};

export default AdminStack;