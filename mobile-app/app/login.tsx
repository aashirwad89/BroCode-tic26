import React, { useState, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#0066FF',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  error: '#DC2626',
  border: '#E2E8F0',
  success: '#10B981',
}

type Step = 'phone' | 'otp'

const AuthPage: React.FC = () => {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState<string[]>(['', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const otpRefs = useRef<Array<TextInput | null>>([null, null, null, null])

  // Generate random 4-digit OTP
  const generateOtp = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newOtp = generateOtp()
      setGeneratedOtp(newOtp)
      setStep('otp')
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input
  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return

    const updated = [...otp]
    updated[idx] = val
    setOtp(updated)

    // Auto-focus next field
    if (val && idx < 3) {
      otpRefs.current[idx + 1]?.focus()
    }

    // Auto-focus previous field on delete
    if (!val && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('')

    if (enteredOtp.length !== 4) {
      setError('Please enter all 4 digits')
      return
    }

    if (enteredOtp !== generatedOtp) {
      setError('Incorrect OTP. Please try again.')
      setOtp(['', '', '', ''])
      otpRefs.current[0]?.focus()
      return
    }

    setError('')
    setLoading(true)

    try {
      // Save to storage
      await AsyncStorage.setItem(
        'auth_user',
        JSON.stringify({
          phone,
          verified: true,
          timestamp: Date.now(),
        })
      )

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      // Navigate to home
      router.replace('/home')
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    const newOtp = generateOtp()
    setGeneratedOtp(newOtp)
    setOtp(['', '', '', ''])
    setError('')
    otpRefs.current[0]?.focus()
  }

  const handleChangeNumber = () => {
    setStep('phone')
    setPhone('')
    setOtp(['', '', '', ''])
    setError('')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️</Text>
          <Text style={styles.title}>ShadowSafe Auth</Text>
          <Text style={styles.subtitle}>
            {step === 'phone' ? 'Login with your phone number' : 'Verify your identity'}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {step === 'phone' ? (
            <>
              {/* Phone Input */}
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="98765 43210"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={text => {
                    setPhone(text)
                    setError('')
                  }}
                  autoFocus
                />
              </View>

              {/* Error Message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Send OTP Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>

              {/* Demo Login */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
                onPress={async () => {
                  setLoading(true)
                  await new Promise(r => setTimeout(r, 600))
                  await AsyncStorage.setItem(
                    'auth_user',
                    JSON.stringify({
                      phone: '9999999999',
                      verified: true,
                      timestamp: Date.now(),
                    })
                  )
                  setLoading(false)
                  router.replace('/home')
                }}
                disabled={loading}
              >
                <Text style={styles.buttonSecondaryText}>Quick Demo Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* OTP Info */}
              <View style={styles.otpInfo}>
                <Text style={styles.otpInfoLabel}>Demo OTP Code:</Text>
                <Text style={styles.otpInfoValue}>{generatedOtp}</Text>
              </View>

              {/* OTP Input */}
              <Text style={styles.label}>Enter 4-Digit Code</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={ref => {
                      otpRefs.current[idx] = ref
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null,
                    ]}
                    value={digit}
                    onChangeText={val => handleOtpChange(val, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    autoFocus={idx === 0}
                  />
                ))}
              </View>

              {/* Error Message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              {/* Action Links */}
              <View style={styles.actionLinks}>
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.actionLink}>↺ Resend OTP</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChangeNumber}>
                  <Text style={styles.actionLink}>✎ Change Number</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>🛡️ Secure Authentication</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  logo: {
    fontSize: 48,
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 16,
    overflow: 'hidden',
  },

  countryCode: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },

  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  otpInput: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: COLORS.background,
    textAlign: 'center',
  },

  otpInputFilled: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#F0F4FF',
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  buttonSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  buttonSecondaryText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  otpInfo: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },

  otpInfoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
    fontWeight: '600',
  },

  otpInfoValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
  },

  actionLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },

  actionLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },

  footer: {
    marginTop: 32,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
})

export default AuthPage