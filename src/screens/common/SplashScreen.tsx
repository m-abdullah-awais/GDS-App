import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../../theme'
import Button from '../../components/Button'

const SplashScreen = () => {
  const { theme } = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>GDS Driving School</Text>
        <Text style={styles.title}>Learn with confidence</Text>
        <Text style={styles.subtitle}>
          Professional driving education for students, instructors, and admins.
        </Text>
      </View>

      <Button title="Get Started" size="lg" fullWidth style={styles.cta} />
    </View>
  )
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing['2xl'],
    },
    content: {
      marginTop: theme.spacing['4xl'],
      gap: theme.spacing.sm,
    },
    brand: {
      ...theme.typography.overline,
      color: theme.colors.primary,
    },
    title: {
      ...theme.typography.displayMedium,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
      maxWidth: 360,
    },
    cta: {
      marginBottom: theme.spacing.md,
    },
  })

export default SplashScreen