import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '../../theme'

const InstructorProfileScreen = () => {
  const { theme } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Instructor Profile</Text>
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
    textAlign: 'center',
  },
})

export default InstructorProfileScreen