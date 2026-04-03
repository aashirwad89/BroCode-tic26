/* eslint-disable react/no-unescaped-entities */
import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator,
  Easing,
  Alert,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Circle } from 'react-native-svg'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

// ============ API CONFIG ============
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.252.189.103:8000/api'

// Add this validation
if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('⚠️ EXPO_PUBLIC_API_URL not set, using localhost fallback')
}

const COLORS = {
  bgTop: '#FDF6FB',
  bgBottom: '#EEF3FF',
  card: '#FFFFFF',
  text: '#1F2A44',
  subText: '#7C8192',
  muted: '#A4A9B6',
  border: '#E7E8F0',
  pink: '#FF7CCB',
  purple: '#B06CFF',
  iconPink: '#FF69C7',
  iconPurple: '#A855F7',
  tileBg: '#FFFFFF',
  tileBorder: '#ECECF4',
  shadow: '#C9BEDD',
  success: '#10B981',
  error: '#EF4444',
  gradientPink: '#FF80C4',
  gradientPurple: '#A870FF',
}

const featureItems = [
  { emoji: '🆘', label: 'SOS Alert' },
  { emoji: '📍', label: 'Live Location' },
  { emoji: '👥', label: 'Trusted Circle' },
]

const ShieldIcon = () => (
  <View style={styles.logoOuter}>
    <LinearGradient
      colors={[COLORS.iconPink, COLORS.iconPurple]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.logoGradient}
    >
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3L18 5.5V10.8C18 14.7 15.45 18.15 12 19.5C8.55 18.15 6 14.7 6 10.8V5.5L12 3Z"
          stroke="#FFFFFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </LinearGradient>
  </View>
)

const AnimatedPulse = ({ size = 24, color = COLORS.purple }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  })

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  })

  return (
    <Animated.View
      style={[
        styles.pulseContainer,
        {
          transform: [{ scale: pulseScale }],
          opacity: pulseOpacity,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={color} opacity="0.3" />
      </Svg>
    </Animated.View>
  )
}

const OTPInputBox = ({
  digit,
  index,
  isFocused,
  onChange,
  onKeyPress,
  inputRef,
  hasDigit,
}: {
  digit: string
  index: number
  isFocused: boolean
  onChange: (value: string, index: number) => void
  onKeyPress: (event: any, index: number) => void
  inputRef: (ref: TextInput | null) => void
  hasDigit: boolean
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const borderAnim = useRef(new Animated.Value(0)).current

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        friction: 6,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start()
    })
  }, [])

  const animateOut = useCallback(() => {
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start()
  }, [])

  useEffect(() => {
    if (isFocused) animateIn()
    else animateOut()
  }, [isFocused])

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2.5],
  })

  return (
    <Animated.View
      style={[
        styles.otpInputContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.otpInputAnimated,
          {
            borderWidth,
            shadowOpacity: hasDigit ? 0.3 : 0.1,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.otpInput}
          value={digit}
          onChangeText={(value) => onChange(value, index)}
          onKeyPress={(e) => onKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          showSoftInputOnFocus={true}
          selectTextOnFocus={true}
          autoFocus={index === 0}
        />
        {hasDigit && <AnimatedPulse size={20} />}
      </Animated.View>
    </Animated.View>
  )
}

const SafetyAuthUI: React.FC = () => {
  const router = useRouter()
  
  // States
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedOtpIndex, setFocusedOtpIndex] = useState(0)
  const [resendTimer, setResendTimer] = useState(0)
  
  // Refs for OTP inputs
  const otpInputRefs = useRef<(TextInput | null)[]>([])

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.96)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const buttonAnim = useRef(new Animated.Value(1)).current
  const otpSlideAnim = useRef(new Animated.Value(50)).current
  const otpScaleAnim = useRef(new Animated.Value(0.8)).current
  const phonePulse = useRef(new Animated.Value(0)).current
  const errorShake = useRef(new Animated.Value(0)).current

  // Initial animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 45,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start()

    // Phone input pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(phonePulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(phonePulse, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    )
    pulseLoop.start()
  }, [])

  // OTP slide in animation
  useEffect(() => {
    if (step === 'otp') {
      Animated.parallel([
        Animated.spring(otpScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(otpSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [step])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [resendTimer])

  // Error shake animation
  const triggerErrorShake = () => {
    Animated.sequence([
      Animated.timing(errorShake, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start()
  }

  // ============ PHONE VALIDATION ============
  const validatePhone = (phoneNum: string) => {
    if (!phoneNum || phoneNum.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      triggerErrorShake()
      return false
    }
    if (!/^\d+$/.test(phoneNum)) {
      setError('Phone number should contain only digits')
      triggerErrorShake()
      return false
    }
    return true
  }

  // ============ SEND OTP - Backend Integration ============
  const handleSendOtp = async () => {
    try {
      setError('')
      
      if (!validatePhone(phone)) return
      
      setLoading(true)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/jsorn',
        },
        body: JSON.stringify({
          phone: `91${phone}`, // Indian country code
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `HTTP Error: ${response.status}`)
      }

      const data = await response.json()
      
      setStep('otp')
      setResendTimer(60) // 60 seconds resend timer
      
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 300)

      Alert.alert('Success', 'OTP sent successfully!')

    } catch (err: any) {
      const errorMsg = err.message?.includes('Network') 
        ? 'Network error. Check your internet connection & API URL.'
        : err.message || 'Failed to send OTP. Please try again.'
    
      setError(errorMsg)
      triggerErrorShake()
      Alert.alert('Error', errorMsg)
      
      console.error('Send OTP Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ============ VERIFY OTP - Backend Integration ============
  const handleVerifyOtp = async () => {
    try {
      setError('')
      
      const enteredOtp = otp.join('')
      if (enteredOtp.length !== 4) {
        setError('Please enter all 4 digits')
        triggerErrorShake()
        return
      }

      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `91${phone}`,
          otp: enteredOtp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP')
      }

      // ============ STORE AUTH TOKEN ============
      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token)
      }
      if (data.userId) {
        await AsyncStorage.setItem('userId', data.userId)
      }

      Alert.alert('Success', 'Logged in successfully!')
      
      // Navigate to home
      setTimeout(() => {
        router.replace('/home')
      }, 500)

    } catch (err: any) {
      const errorMsg = err.message || 'Verification failed. Please try again.'
      setError(errorMsg)
      triggerErrorShake()
      Alert.alert('Error', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // ============ RESEND OTP ============
  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    
    await handleSendOtp()
  }

  // ============ GO BACK ============
  const handleGoBack = () => {
    setStep('phone')
    setOtp(['', '', '', ''])
    setError('')
    setResendTimer(0)
  }

  // Handle OTP input change with auto-focus next
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    
    // Auto focus next input if current has value and not last
    if (value && index < 3) {
      setFocusedOtpIndex(index + 1)
      otpInputRefs.current[index + 1]?.focus()
    }
    
    // Auto verify if all 4 digits filled
    if (newOtp.join('').length === 4) {
      setTimeout(() => {
        handleVerifyOtp()
      }, 100)
    }
  }

  // Handle backspace to move to previous input
  const handleOtpKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      setFocusedOtpIndex(index - 1)
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Button press animations
  const onPressIn = () => {
    Animated.spring(buttonAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start()
  }

  const onPressOut = () => {
    Animated.spring(buttonAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start()
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[COLORS.bgTop, COLORS.bgBottom]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.background}
      >
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        <View style={styles.screen}>
          <Animated.View
            style={[
              styles.cardWrap,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateX: errorShake }
                ],
              },
            ]}
          >
            <View style={styles.card}>
              <ShieldIcon />

              <Text style={styles.title}>ShadowSafe - AI</Text>
              <Text style={styles.subtitle}>Your Safety Companion</Text>

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              {/* Phone Number Step */}
              {step === 'phone' && (
                <View style={styles.formBlock}>
                  <Text style={styles.label}>Mobile Number</Text>

                  <Animated.View
                    style={[
                      styles.inputWrap,
                      {
                        borderWidth: phonePulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.8],
                        }),
                      },
                    ]}
                  >
                    <Text style={styles.inputIcon}>📞</Text>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your mobile number"
                      placeholderTextColor={COLORS.muted}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text)
                        setError('')
                      }}
                      autoFocus
                      editable={!loading}
                    />
                  </Animated.View>

                  <Text style={styles.helper}>
                    We'll send you a verification code
                  </Text>

                  <Animated.View
                    style={{
                      transform: [{ scale: buttonAnim }],
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleSendOtp}
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      style={styles.buttonTouch}
                      disabled={loading || phone.length !== 10}
                    >
                      <LinearGradient
                        colors={loading || phone.length !== 10
                          ? [COLORS.muted, COLORS.muted] 
                          : [COLORS.gradientPink, COLORS.gradientPurple]}
                        start={{ x: 0, y: 0.2 }}
                        end={{ x: 1, y: 0.8 }}
                        style={styles.button}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={styles.buttonText}>Send OTP</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  <Text style={styles.terms}>
                    By continuing, you agree to our Terms of Service and{'\n'}
                    Privacy Policy
                  </Text>
                </View>
              )}

              {/* OTP Step */}
              {step === 'otp' && (
                <Animated.View
                  style={[
                    styles.formBlock,
                    {
                      transform: [
                        { translateY: otpSlideAnim },
                        { scale: otpScaleAnim },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={handleGoBack}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.backIcon}>
                      <Path
                        d="M15 18L9 12L15 6"
                        stroke={COLORS.purple}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>

                  <Text style={styles.label}>Enter Verification Code</Text>
                  <Text style={styles.helper}>
                    Sent to +91 {phone.slice(0, 3)}***{phone.slice(-3)}
                  </Text>

                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <OTPInputBox
                        key={index}
                        digit={digit}
                        index={index}
                        isFocused={focusedOtpIndex === index}
                        onChange={handleOtpChange}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                        inputRef={(ref) => {
                          otpInputRefs.current[index] = ref
                        }}
                        hasDigit={!!digit}
                      />
                    ))}
                  </View>

                  <Animated.View
                    style={{
                      transform: [{ scale: buttonAnim }],
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleVerifyOtp}
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      style={styles.buttonTouch}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={loading 
                          ? [COLORS.muted, COLORS.muted]
                          : [COLORS.gradientPink, COLORS.gradientPurple]}
                        start={{ x: 0, y: 0.2 }}
                        end={{ x: 1, y: 0.8 }}
                        style={styles.button}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={styles.buttonText}>Verify & Continue</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  <TouchableOpacity 
                    style={styles.resendContainer}
                    onPress={handleResendOtp}
                    disabled={resendTimer > 0}
                  >
                    <Text style={[
                      styles.resend,
                      resendTimer > 0 && styles.resendDisabled
                    ]}>
                      {resendTimer > 0 
                        ? `Resend in ${resendTimer}s`
                        : "Didn't receive? Resend"
                      }
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          <View style={styles.bottomTiles}>
            {featureItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.85}
                style={styles.tile}
              >
                <Text style={styles.tileEmoji}>{item.emoji}</Text>
                <Text style={styles.tileText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgTop,
  },
  background: {
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 24,
  },
  topGlow: {
    position: 'absolute',
    top: 80,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFD8F0',
    opacity: 0.28,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 110,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#DDE7FF',
    opacity: 0.45,
  },
  cardWrap: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: COLORS.card,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignSelf: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 10,
  },
  logoOuter: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CF7BEF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 7,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subText,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  formBlock: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4C556A',
  },
  inputWrap: {
    height: 48,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: '#FFFDFE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    fontSize: 15,
    marginRight: 10,
    opacity: 0.7,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  helper: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  otpInputContainer: {
    flex: 1,
  },
  otpInputAnimated: {
    flex: 1,
    height: 60,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#FFFDFE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    textAlignVertical: 'center',
  },
  pulseContainer: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  backIcon: {
    marginRight: 6,
  },
  backText: {
    fontSize: 14,
    color: COLORS.purple,
    fontWeight: '700',
  },
  buttonTouch: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  button: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  terms: {
    marginTop: 16,
    fontSize: 11.5,
    lineHeight: 18,
    color: COLORS.subText,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  resend: {
    fontSize: 13,
    color: COLORS.purple,
    fontWeight: '700',
  },
  resendDisabled: {
    color: COLORS.muted,
  },
  bottomTiles: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  tile: {
    flex: 1,
    minHeight: 74,
    backgroundColor: COLORS.tileBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D6D9E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },
  tileEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  tileText: {
    fontSize: width < 360 ? 10.5 : 11.5,
    color: '#4A5368',
    fontWeight: '600',
    textAlign: 'center',
  },
})

export default SafetyAuthUI