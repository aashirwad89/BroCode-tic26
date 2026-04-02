/* eslint-disable react/no-unescaped-entities */
import React, { useRef, useState, useEffect } from 'react'
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
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path } from 'react-native-svg'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

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

const SafetyAuthUI: React.FC = () => {
  const router = useRouter()
  
  // States
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.96)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const buttonAnim = useRef(new Animated.Value(1)).current
  const otpSlideAnim = useRef(new Animated.Value(50)).current
  const otpScaleAnim = useRef(new Animated.Value(0.8)).current

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

  // Generate random 4 digit OTP
  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  // Handle Send OTP
  const handleSendOtp = () => {
    if (phone.length !== 10) return
    
    setLoading(true)
    const otpCode = generateOtp()
    setGeneratedOtp(otpCode)
    
    setTimeout(() => {
      setStep('otp')
      setLoading(false)
    }, 800)
  }

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
  }

  // Handle OTP verification
  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('')
    if (enteredOtp.length !== 4) return
    
    setLoading(true)
    setTimeout(() => {
      router.replace('/home')
    }, 800)
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
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.card}>
              <ShieldIcon />

              <Text style={styles.title}>ShadowSafe - AI</Text>
              <Text style={styles.subtitle}>Your Safety Companion</Text>

              {/* Phone Number Step */}
              {step === 'phone' && (
                <View style={styles.formBlock}>
                  <Text style={styles.label}>Mobile Number</Text>

                  <View style={styles.inputWrap}>
                    <Text style={styles.inputIcon}>📞</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your mobile number"
                      placeholderTextColor={COLORS.muted}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                      autoFocus
                    />
                  </View>

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
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={loading 
                          ? [COLORS.pink, COLORS.purple] 
                          : [COLORS.pink, COLORS.purple]}
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
                    onPress={() => setStep('phone')}
                  >
                    <Text style={styles.backText}>← Back</Text>
                  </TouchableOpacity>

                  <Text style={styles.label}>Enter Verification Code</Text>
                  <Text style={styles.helper}>
                    Sent to +91 {phone.slice(0, 3)}***{phone.slice(-3)}
                  </Text>

                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        style={[
                          styles.otpInput,
                          digit && styles.otpInputActive,
                        ]}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                        autoFocus={index === 0}
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
                          ? [COLORS.success, '#059669'] 
                          : [COLORS.pink, COLORS.purple]}
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

                  <Text style={styles.terms}>
                    Didn't receive code? <Text style={styles.resend}>Resend</Text>
                  </Text>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          <View style={styles.bottomTiles}>
            {featureItems.map(item => (
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
  // ... (previous styles remain same)
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
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: '#FFFDFE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  inputIcon: {
    fontSize: 15,
    marginRight: 10,
    opacity: 0.7,
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

  otpContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 8,
  },

  otpInput: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    backgroundColor: '#FFFDFE',
    textAlign: 'center',
  },

  otpInputActive: {
    borderColor: COLORS.purple,
    backgroundColor: '#FDF2FF',
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
  },

  backText: {
    fontSize: 13,
    color: COLORS.purple,
    fontWeight: '600',
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

  resend: {
    color: COLORS.purple,
    fontWeight: '700',
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
