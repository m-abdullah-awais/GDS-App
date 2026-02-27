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
import { useTheme } from '../../theme'
import Button from '../../components/Button'

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>
type SignupRole = 'admin' | 'instructor' | 'student'

const ROLE_OPTIONS: Array<{ label: string; value: SignupRole; icon: string }> = [
  { label: 'Admin', value: 'admin', icon: 'shield-checkmark-outline' },
  { label: 'Instructor', value: 'instructor', icon: 'school-outline' },
  { label: 'Student', value: 'student', icon: 'person-outline' },
]

const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const { theme } = useTheme()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<SignupRole | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const styles = useMemo(() => createStyles(theme), [theme])

  const formState = useMemo(() => {
    const hasName = fullName.trim().length >= 2
    const hasValidEmail = /\S+@\S+\.\S+/.test(email.trim())
    const hasStrongPassword = password.trim().length >= 6
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
    const hasRole = !!role

    return {
      hasName,
      hasValidEmail,
      hasStrongPassword,
      passwordsMatch,
      hasRole,
      isValid: hasName && hasValidEmail && hasStrongPassword && passwordsMatch && hasRole,
    }
  }, [fullName, email, password, confirmPassword, role])

  const handleSignup = () => {
    if (!formState.isValid) {
      Alert.alert('Incomplete form', 'Please complete all fields, select a role, and make sure passwords match.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      Alert.alert('Sign up request', `Connect this action to your registration API. Selected role: ${role}.`)
    }, 450)
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
              <Ionicons name="sparkles-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.brandText}>Create your profile</Text>
            </View>
            <Text style={styles.pageTitle}>Get started</Text>
            <Text style={styles.pageSubtitle}>Create an account to access the GDS platform</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.formTitle}>Sign up</Text>
            <Text style={styles.formSubtitle}>Complete your details to continue</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Doe"
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="words"
                  textContentType="name"
                  keyboardAppearance={theme.dark ? 'dark' : 'light'}
                  selectionColor={theme.colors.primary}
                  style={styles.input}
                />
              </View>
            </View>

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
                  textContentType="emailAddress"
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
                  placeholder="At least 6 characters"
                  placeholderTextColor={theme.colors.placeholder}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                  keyboardAppearance={theme.dark ? 'dark' : 'light'}
                  selectionColor={theme.colors.primary}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sign up as</Text>
              <View style={styles.roleOptions}>
                {ROLE_OPTIONS.map(option => {
                  const isSelected = role === option.value
                  return (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.roleOption,
                        {
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.surface,
                        },
                      ]}
                      onPress={() => setRole(option.value)}
                    >
                      <Ionicons
                        name={option.icon}
                        size={16}
                        color={isSelected ? theme.colors.primary : theme.colors.textTertiary}
                      />
                      <Text
                        style={[
                          styles.roleOptionText,
                          { color: isSelected ? theme.colors.primary : theme.colors.textPrimary },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <Button
              title={isSubmitting ? 'Creating account...' : 'Create Account'}
              onPress={handleSignup}
              disabled={!formState.isValid || isSubmitting}
              loading={isSubmitting}
              size="lg"
              fullWidth
              style={styles.primaryButton}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}> Sign in</Text>
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
    roleOptions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    roleOption: {
      flex: 1,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
    },
    roleOptionText: {
      ...theme.typography.buttonSmall,
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

export default SignupScreen
