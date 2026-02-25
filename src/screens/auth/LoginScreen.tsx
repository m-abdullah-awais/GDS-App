import React, { useMemo, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../navigation/AuthStack'
import { useTheme } from '../../theme'
import Button from '../../components/Button'

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const styles = useMemo(() => createStyles(theme), [theme])

  const isFormValid = useMemo(() => {
    const hasValidEmail = /\S+@\S+\.\S+/.test(email.trim())
    return hasValidEmail && password.trim().length >= 6
  }, [email, password])

  const handleLogin = () => {
    if (!isFormValid) {
      Alert.alert('Incomplete form', 'Enter a valid email and a password with at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      Alert.alert('Login request', 'Connect this action to your authentication API.')
    }, 450)
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.placeholder}
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
                style={styles.input}
              />
            </View>

            <Button
              title={isSubmitting ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
              size="lg"
              fullWidth
              style={styles.primaryButton}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don’t have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}> Create one</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flex: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.md,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      marginTop: theme.spacing.xs - 2,
      marginBottom: theme.spacing.lg,
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    formGroup: {
      marginBottom: theme.spacing.sm + 2,
    },
    label: {
      marginBottom: theme.spacing.xs,
      ...theme.typography.label,
      color: theme.colors.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: Platform.OS === 'ios' ? 13 : 11,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
    },
    primaryButton: {
      marginTop: theme.spacing.xs,
    },
    footerRow: {
      marginTop: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    footerLink: {
      ...theme.typography.buttonMedium,
      color: theme.colors.primary,
    },
  })

export default LoginScreen