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
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../navigation/AuthStack'

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>

const SignupScreen = ({ navigation }: SignupScreenProps) => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const formState = useMemo(() => {
        const hasName = fullName.trim().length >= 2
        const hasValidEmail = /\S+@\S+\.\S+/.test(email.trim())
        const hasStrongPassword = password.trim().length >= 6
        const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

        return {
            hasName,
            hasValidEmail,
            hasStrongPassword,
            passwordsMatch,
            isValid: hasName && hasValidEmail && hasStrongPassword && passwordsMatch,
        }
    }, [fullName, email, password, confirmPassword])

    const handleSignup = () => {
        if (!formState.isValid) {
            Alert.alert('Incomplete form', 'Please complete all fields and make sure passwords match.')
            return
        }

        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            Alert.alert('Sign up request', 'Connect this action to your registration API.')
        }, 450)
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <StatusBar barStyle="dark-content" />
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
                                secureTextEntry
                                autoCapitalize="none"
                                textContentType="password"
                                style={styles.input}
                            />
                        </View>

                        <Pressable
                            onPress={handleSignup}
                            disabled={!formState.isValid || isSubmitting}
                            style={[styles.primaryButton, (!formState.isValid || isSubmitting) && styles.primaryButtonDisabled]}
                        >
                            <Text style={styles.primaryButtonText}>{isSubmitting ? 'Creating account...' : 'Sign Up'}</Text>
                        </Pressable>

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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    flex: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E7E8EC',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#101828',
    },
    subtitle: {
        marginTop: 6,
        marginBottom: 20,
        color: '#475467',
        fontSize: 14,
    },
    formGroup: {
        marginBottom: 14,
    },
    label: {
        marginBottom: 8,
        fontSize: 13,
        fontWeight: '600',
        color: '#344054',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        fontSize: 15,
        color: '#101828',
        backgroundColor: '#FFFFFF',
    },
    primaryButton: {
        marginTop: 8,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        backgroundColor: '#2563EB',
    },
    primaryButtonDisabled: {
        backgroundColor: '#9BB5F5',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    footerRow: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#475467',
        fontSize: 14,
    },
    footerLink: {
        color: '#1D4ED8',
        fontSize: 14,
        fontWeight: '700',
    },
})

export default SignupScreen