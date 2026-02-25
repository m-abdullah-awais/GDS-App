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

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
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
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={!isFormValid || isSubmitting}
              style={[styles.primaryButton, (!isFormValid || isSubmitting) && styles.primaryButtonDisabled]}
            >
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Signing in...' : 'Sign In'}</Text>
            </Pressable>

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

export default LoginScreen