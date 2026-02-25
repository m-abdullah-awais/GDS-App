import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '../../theme'

const AdminDashboardScreen = () => {
  const { theme } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Admin Dashboard</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Manage operations with a unified themed interface.</Text>
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

export default AdminDashboardScreen