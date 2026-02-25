import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StudentStackParamList } from '../../navigation/student/StudentStack'

type StudentDashboardNavigationProp = NativeStackNavigationProp<StudentStackParamList>

const StudentDashboardScreen = () => {
  const navigation = useNavigation<StudentDashboardNavigationProp>()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Dashboard</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('Test')}>
        <Text style={styles.buttonText}>Go to Test Screen</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
})

export default StudentDashboardScreen