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

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>
type SignupRole = 'admin' | 'instructor' | 'student'

const ROLE_OPTIONS: Array<{ label: string; value: SignupRole }> = [
    { label: 'Admin', value: 'admin' },
    { label: 'Instructor', value: 'instructor' },
    { label: 'Student', value: 'student' },
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
                        <Text style={styles.title}>Create account</Text>
                        <Text style={styles.subtitle}>Join and start booking your lessons</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full name</Text>
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="John Doe"
                                placeholderTextColor={theme.colors.placeholder}
                                autoCapitalize="words"
                                textContentType="name"
                                style={styles.input}
                            />
                        </View>

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
                                textContentType="emailAddress"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="At least 6 characters"
                                placeholderTextColor={theme.colors.placeholder}
                                secureTextEntry
                                autoCapitalize="none"
                                textContentType="newPassword"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirm password</Text>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter your password"
                                placeholderTextColor={theme.colors.placeholder}
                                secureTextEntry
                                autoCapitalize="none"
                                textContentType="password"
                                style={styles.input}
                            />
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
                            title={isSubmitting ? 'Creating account...' : 'Sign Up'}
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
        },
        roleOptionText: {
            ...theme.typography.buttonMedium,
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

export default SignupScreen