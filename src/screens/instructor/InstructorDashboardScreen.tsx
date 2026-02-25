import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '../../theme'

const InstructorDashboardScreen = () => {
  const { theme } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Instructor Dashboard</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Track classes and student progress with consistent branding.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
})

export default InstructorDashboardScreen