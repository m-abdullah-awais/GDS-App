import React, { useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../navigation/AuthStack'
import { useTheme } from '../../theme'
import Button from '../../components/Button'
import { useConfirmation } from '../../components/common'
import { signInWithEmail, sendPasswordReset } from '../../services/authService'

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>

const DEV_LOGIN_CREDENTIALS = {
  admin: {
    email: 'admin2@gmail.com',
    password: '12345678',
  },
  student: {
    email: 'student4@yopmail.com',
    password: '12345678',
  },
  instructor: {
    email: 'testi12@yopmail.com',
    password: '12345678',
  },
} as const

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { theme } = useTheme()
  const { notify } = useConfirmation()
  const [email, setEmail] = useState('asd@yopmail.com')
  const [password, setPassword] = useState('123456')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const styles = useMemo(() => createStyles(theme), [theme])

  const isFormValid = useMemo(() => {
    const hasValidEmail = /\S+@\S+\.\S+/.test(email.trim())
    return hasValidEmail && password.trim().length >= 6
  }, [email, password])

  const handleDevAutofill = (credential: { email: string; password: string }) => {
    setEmail(credential.email)
    setPassword(credential.password)
  }

  const handleLogin = async () => {
    if (!isFormValid) {
      void notify({
        title: 'Incomplete form',
        message: 'Enter a valid email and a password with at least 6 characters.',
        variant: 'warning',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await signInWithEmail(email.trim(), password)
      // Auth state listener in App.tsx will handle navigation automatically
    } catch (error: any) {
      let message = 'An unexpected error occurred. Please try again.'
      const code = error?.code
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        message = 'Invalid email or password.'
      } else if (code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.'
      } else if (code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.'
      } else if (code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.'
      }
      void notify({ title: 'Sign in failed', message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim()
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      void notify({
        title: 'Enter your email',
        message: 'Please enter your email address above, then tap "Forgot password?" again.',
        variant: 'info',
      })
      return
    }
    try {
      await sendPasswordReset(trimmedEmail)
      void notify({
        title: 'Reset email sent',
        message: 'Check your inbox for a password reset link.',
        variant: 'success',
      })
    } catch {
      void notify({
        title: 'Reset failed',
        message: 'Could not send password reset email. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle={theme.colors.statusBar} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroSection}>
            <View style={styles.brandPill}>
              <Ionicons name="school-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.brandText}>GDS Mobile</Text>
            </View>
            <Text style={styles.pageTitle}>Welcome back</Text>
            <Text style={styles.pageSubtitle}>Sign in to continue your driving lessons and progress</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.formTitle}>Sign in</Text>
            <Text style={styles.formSubtitle}>Use your registered account credentials</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  keyboardAppearance={theme.dark ? 'dark' : 'light'}
                  selectionColor={theme.colors.primary}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.placeholder}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  keyboardAppearance={theme.dark ? 'dark' : 'light'}
                  selectionColor={theme.colors.primary}
                  style={styles.input}
                />
              </View>
            </View>

            {__DEV__ ? (
              <View style={styles.devCard}>
                <View style={styles.devHeaderRow}>
                  <Ionicons name="flask-outline" size={16} color={theme.colors.warning} />
                  <Text style={styles.devTitle}>Development Autofill</Text>
                </View>
                <Text style={styles.devSubtitle}>Tap to prefill test credentials</Text>
                <View style={styles.devButtonsContainer}>
                  <Button
                    title="Use Admin"
                    variant="outline"
                    size="sm"
                    fullWidth
                    style={styles.devButton}
                    onPress={() => handleDevAutofill(DEV_LOGIN_CREDENTIALS.admin)}
                  />
                  <Button
                    title="Use Student"
                    variant="outline"
                    size="sm"
                    fullWidth
                    style={styles.devButton}
                    onPress={() => handleDevAutofill(DEV_LOGIN_CREDENTIALS.student)}
                  />
                  <Button
                    title="Use Instructor"
                    variant="outline"
                    size="sm"
                    fullWidth
                    style={styles.devButton}
                    onPress={() => handleDevAutofill(DEV_LOGIN_CREDENTIALS.instructor)}
                  />
                </View>
              </View>
            ) : null}

            <Pressable onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </Pressable>

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
      gap: theme.spacing.md,
    },
    heroSection: {
      marginHorizontal: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    brandPill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    brandText: {
      ...theme.typography.buttonSmall,
      color: theme.colors.primary,
    },
    pageTitle: {
      ...theme.typography.displayMedium,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.xs,
    },
    pageSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.lg,
    },
    devCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      ...theme.shadows.md,
    },
    devHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xxs,
    },
    devTitle: {
      ...theme.typography.buttonMedium,
      color: theme.colors.warning,
    },
    devSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    devButtonsContainer: {
      gap: theme.spacing.xs,
    },
    devButton: {
      borderColor: theme.colors.border,
    },
    formTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    formSubtitle: {
      marginTop: theme.spacing.xxs,
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
    inputWrapper: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: Platform.OS === 'ios' ? 10 : 7,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: Platform.OS === 'ios' ? theme.colors.surface : theme.colors.surfaceSecondary,
    },
    input: {
      flex: 1,
      paddingVertical: 0,
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 0,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
      backgroundColor: 'transparent',
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      ...theme.typography.buttonSmall,
      color: theme.colors.textLink,
      marginTop: theme.spacing.xxs,
      marginBottom: theme.spacing.sm,
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
