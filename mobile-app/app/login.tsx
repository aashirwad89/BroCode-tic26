import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Smartphone, Phone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_URL = 'http://10.252.189.103:8000/api';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Entrance animations ───────────────────────────────────────────────
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  const scaleAnim  = useRef(new Animated.Value(0.93)).current;

  // Icon pulse (infinite subtle scale)
  const iconPulse  = useRef(new Animated.Value(1)).current;

  // Button press scale
  const btnScale   = useRef(new Animated.Value(1)).current;

  // OTP field slide-in
  const otpSlide   = useRef(new Animated.Value(20)).current;
  const otpFade    = useRef(new Animated.Value(0)).current;

  // Error shake
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  const cleanedPhone = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const cleanedOtp   = useMemo(() => otp.replace(/\D/g, ''), [otp]);

  const isPhoneValid = cleanedPhone.length === 10 || cleanedPhone.length === 12;
  const isOtpValid   = cleanedOtp.length === 4;

  // Entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 55, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();

    // Icon pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1.07, duration: 1200, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 1.00, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // OTP field entrance when step changes
  useEffect(() => {
    if (step === 'otp') {
      otpSlide.setValue(20);
      otpFade.setValue(0);
      Animated.parallel([
        Animated.timing(otpFade,  { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(otpSlide, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [step]);

  // Shake on error
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Button press feedback
  const onBtnPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onBtnPressOut = () => Animated.spring(btnScale, { toValue: 1.00, friction: 5, useNativeDriver: true }).start();

  // ─── API calls ─────────────────────────────────────────────────────────
  const requestOtp = async () => {
    if (!isPhoneValid) {
      setError('Phone number 10 ya 12 digits ka hona chahiye');
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res  = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'OTP bhejne me problem aayi');
      setStep('otp');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (data?.otp) Alert.alert('OTP Sent', `Demo OTP: ${data.otp}`);
      else           Alert.alert('OTP Sent', 'OTP successfully send ho gaya');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!isPhoneValid) { setError('Invalid phone number'); triggerShake(); return; }
    if (!isOtpValid)   { setError('OTP 4 digits ka hona chahiye'); triggerShake(); return; }
    try {
      setLoading(true);
      setError('');
      const res  = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone, otp: cleanedOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'OTP verify nahi hua');
      if (data?.token)  await SecureStore.setItemAsync('token', data.token);
      if (data?.userId) await SecureStore.setItemAsync('userId', data.userId);
      await SecureStore.setItemAsync('phone', cleanedPhone);
      Alert.alert('Success', 'Login successful');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
    Haptics.selectionAsync();
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCE4EC" />

      <LinearGradient
        colors={['#FCE4EC', '#F8BBD0', '#FCE4EC']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.centerWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Card entrance */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {/* ── Icon ── */}
            <Animated.View
              style={[styles.iconWrapper, { transform: [{ scale: iconPulse }] }]}
            >
              <LinearGradient
                colors={['#F472B6', '#EC4899', '#DB2777']}
                style={styles.iconBg}
              >
                <Smartphone size={32} color="#fff" strokeWidth={1.8} />
              </LinearGradient>
            </Animated.View>

            {/* ── Title ── */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? 'Enter your mobile number to sign in'
                : `OTP sent to +${cleanedPhone}`}
            </Text>

            {/* ── Phone field ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={[styles.inputRow, step === 'otp' && styles.inputRowDisabled]}>
                <Phone size={18} color="#EC4899" strokeWidth={1.8} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor="#C4B5C0"
                  keyboardType="phone-pad"
                  maxLength={12}
                  editable={!loading && step === 'phone'}
                  style={styles.input}
                />
              </View>
            </View>

            {/* ── OTP field (animated in) ── */}
            {step === 'otp' && (
              <Animated.View
                style={[
                  styles.fieldGroup,
                  { opacity: otpFade, transform: [{ translateY: otpSlide }] },
                ]}
              >
                <View style={styles.otpLabelRow}>
                  <Text style={styles.label}>Enter OTP</Text>
                  <Pressable onPress={goBackToPhone}>
                    <Text style={styles.changeText}>Change number?</Text>
                  </Pressable>
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="- - - -"
                    placeholderTextColor="#C4B5C0"
                    keyboardType="number-pad"
                    maxLength={4}
                    editable={!loading}
                    style={[styles.input, styles.otpInput]}
                    textAlign="center"
                  />
                </View>
              </Animated.View>
            )}

            {/* ── Error ── */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* ── Button (press scale) ── */}
            <Animated.View style={[styles.buttonWrap, { transform: [{ scale: btnScale }] }]}>
              <LinearGradient
                colors={['#F472B6', '#EC4899', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.button,
                  ((step === 'phone' ? !isPhoneValid : !isOtpValid) || loading) &&
                    styles.buttonDisabled,
                ]}
              >
                <Pressable
                  style={styles.buttonInner}
                  onPress={step === 'phone' ? requestOtp : verifyOtp}
                  onPressIn={onBtnPressIn}
                  onPressOut={onBtnPressOut}
                  disabled={(step === 'phone' ? !isPhoneValid : !isOtpValid) || loading}
                  android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {step === 'phone' ? 'Get OTP' : 'Verify & Login'}
                    </Text>
                  )}
                </Pressable>
              </LinearGradient>
            </Animated.View>

            {/* ── Footer ── */}
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms & Privacy Policy</Text>
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCE4EC',
  },
  background: {
    flex: 1,
  },

  // Centers card vertically & horizontally — no ScrollView
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  /* ── Card ── */
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#D63384',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
  },

  /* ── Icon ── */
  iconWrapper: {
    marginBottom: 22,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 8,
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Text ── */
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#EC4899',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },

  /* ── Fields ── */
  fieldGroup: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  otpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeText: {
    fontSize: 12,
    color: '#EC4899',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputRowDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    height: '100%',
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 12,
    color: '#EC4899',
    textAlign: 'center',
  },

  /* ── Error ── */
  errorBox: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* ── Button ── */
  buttonWrap: {
    width: '100%',
    marginTop: 8,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* ── Footer ── */
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#EC4899',
    fontWeight: '600',
  },
});