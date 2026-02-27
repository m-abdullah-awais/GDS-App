import React, { useMemo, useState } from 'react'
import {
  Alert,
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
import { setDevRoleOverride } from '../../navigation/devAuth'
import { useTheme } from '../../theme'
import Button from '../../components/Button'

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>

const DEV_ROLE_BUTTONS = [
  { label: 'Login as Admin', role: 'admin' as const },
  { label: 'Login as Instructor', role: 'instructor' as const },
  { label: 'Login as Student', role: 'student' as const },
]

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [devLoadingRole, setDevLoadingRole] = useState<'admin' | 'instructor' | 'student' | null>(null)
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

  const handleDevLogin = (role: 'admin' | 'instructor' | 'student') => {
    if (devLoadingRole) return

    setDevLoadingRole(role)
    setTimeout(() => {
      setDevRoleOverride(role)
      setDevLoadingRole(null)
    }, 350)
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

            <Pressable onPress={() => Alert.alert('Forgot Password', 'Connect this action to your password reset flow.')}>
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

          {__DEV__ && (
            <View style={styles.devCard}>
              <View style={styles.devHeaderRow}>
                <Ionicons name="construct-outline" size={16} color={theme.colors.warning} />
                <Text style={styles.devTitle}>Development Only</Text>
              </View>
              <Text style={styles.devSubtitle}>Use these shortcuts only for local testing. Do not use in real scenarios.</Text>

              <View style={styles.devButtonsContainer}>
                {DEV_ROLE_BUTTONS.map((option) => (
                  <Button
                    key={option.role}
                    title={option.label}
                    variant="outline"
                    onPress={() => handleDevLogin(option.role)}
                    loading={devLoadingRole === option.role}
                    disabled={!!devLoadingRole}
                    fullWidth
                    style={styles.devButton}
                  />
                ))}
              </View>
            </View>
          )}
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
