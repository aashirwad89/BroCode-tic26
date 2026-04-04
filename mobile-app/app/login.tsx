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
const BASE_URL = 'https://brocode-tic26.onrender.com/api';

// ✅ Match Home ki light design + purple‑bubbles accent
const C = {
  bg:        '#F8FAFC',        // White/light background
  surface:   '#FFFFFF',        // Card
  pink:      '#EC4899',
  pinkLight: '#F472B6',
  pinkDeep:  '#DB2777',
  purple:    '#A855F7',        // Light purple for bubbles
  text:      '#111827',
  textSub:   '#64748B',
  border:    '#E2E8F0',
  shadow:    '#D63384',
};

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  const scaleAnim  = useRef(new Animated.Value(0.93)).current;

  const iconPulse  = useRef(new Animated.Value(1)).current;
  const btnScale   = useRef(new Animated.Value(1)).current;
  const otpSlide   = useRef(new Animated.Value(20)).current;
  const otpFade    = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  const cleanedPhone = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const cleanedOtp   = useMemo(() => otp.replace(/\D/g, ''), [otp]);

  const isPhoneValid = cleanedPhone.length === 10 || cleanedPhone.length === 12;
  const isOtpValid   = cleanedOtp.length === 4;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 55, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1.07, duration: 1200, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 1.00, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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

  const onBtnPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onBtnPressOut = () => Animated.spring(btnScale, { toValue: 1.00, friction: 5, useNativeDriver: true }).start();

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
      console.log('📱 Requesting OTP for:', cleanedPhone);
      
      const res  = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone }),
      });
      const data = await res.json();
      
      console.log('📱 Complete OTP Response:', data);
      
      if (!res.ok) throw new Error(data?.message || 'OTP bhejne me problem aayi');

      setStep('otp');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // ✅ Extract OTP from backend response - check all possible locations
      let otpValue = null;
      
      // Check nested data object
      if (data?.data?.otp) {
        otpValue = data.data.otp;
        console.log('✅ OTP found in data.data.otp:', otpValue);
      }
      // Check direct otp field
      else if (data?.otp) {
        otpValue = data.otp;
        console.log('✅ OTP found in data.otp:', otpValue);
      }
      
      if (otpValue) {
        // ✅ Show OTP in beautiful pop-up
        Alert.alert(
          '✅ OTP Sent Successfully',
          `Your OTP is:\n\n🔐 ${otpValue}\n\nThis will expire in 5 minutes.\nDo not share this with anyone!`,
          [
            { 
              text: 'Got it', 
              onPress: () => {
                console.log('✅ User acknowledged OTP:', otpValue);
              },
              style: 'default'
            }
          ]
        );
      } else {
        console.log('⚠️ OTP not found in response, showing generic message');
        Alert.alert(
          '✅ OTP Sent Successfully',
          `OTP bhej diya gaya +91${cleanedPhone} pe.\n\nPlease check your phone and enter the OTP.`,
          [
            { 
              text: 'OK', 
              onPress: () => {}
            }
          ]
        );
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('❌ OTP Request Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!isPhoneValid) { 
      setError('Invalid phone number'); 
      triggerShake(); 
      return; 
    }
    if (!isOtpValid) { 
      setError('OTP 4 digits ka hona chahiye'); 
      triggerShake(); 
      return; 
    }
    try {
      setLoading(true);
      setError('');
      console.log('🔐 Verifying OTP for:', cleanedPhone);
      console.log('🔐 OTP entered:', cleanedOtp);
      
      const res  = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone, otp: cleanedOtp }),
      });
      const data = await res.json();
      
      console.log('✅ Verification Response:', data);
      
      if (!res.ok) throw new Error(data?.message || 'OTP verify nahi hua');

      // ✅ Save token and phone - check all possible locations
      if (data?.data?.authToken) {
        await SecureStore.setItemAsync('authToken', data.data.authToken);
        console.log('✅ Saved authToken from data.data.authToken');
      }
      if (data?.data?.phone) {
        await SecureStore.setItemAsync('userPhone', data.data.phone);
        console.log('✅ Saved userPhone from data.data.phone');
      }
      
      if (data?.authToken) {
        await SecureStore.setItemAsync('authToken', data.authToken);
        console.log('✅ Saved authToken from data.authToken');
      }
      if (data?.phone) {
        await SecureStore.setItemAsync('userPhone', data.phone);
        console.log('✅ Saved userPhone from data.phone');
      }

      console.log('✅ Login successful for phone:', cleanedPhone);
      
      Alert.alert('✅ Success', 'Login successful! Welcome to ShadowSafe 🛡️', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/home');
          }
        }
      ]);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('❌ Verification Error:', err);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ✅ White background + light purple bubbles layer (60% opacity) */}
      <View style={styles.background}>
        {/* Light purple bubbles */}
        <View style={styles.bubbles}>
          <View style={[styles.bubble, { backgroundColor: `${C.purple}66` }]} />
          <View style={[styles.bubble, { backgroundColor: `${C.purple}66`, width: 40, height: 40 }]} />
          <View style={[styles.bubble, { backgroundColor: `${C.purple}66`, width: 60, height: 60 }]} />
          <View style={[styles.bubble, { backgroundColor: `${C.purple}66`, width: 50, height: 50 }]} />
          <View style={[styles.bubble, { backgroundColor: `${C.purple}66`, width: 30, height: 30 }]} />
        </View>

        <KeyboardAvoidingView
          style={styles.centerWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
            <Animated.View style={[styles.iconWrapper, { transform: [{ scale: iconPulse }] }]}>
              <LinearGradient
                colors={[C.pinkLight, C.pink, C.pinkDeep]}
                style={styles.iconBg}
              >
                <Smartphone size={32} color="#fff" strokeWidth={1.8} />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.title}>Welcome ✨</Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? 'Enter your mobile number to sign in'
                : `OTP sent to +91${cleanedPhone}`}
            </Text>

            {/* Phone field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={[styles.inputRow, step === 'otp' && styles.inputRowDisabled]}>
                <Phone size={18} color={C.pink} strokeWidth={1.8} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 12345 67890"
                  placeholderTextColor="#C4B5C0"
                  keyboardType="phone-pad"
                  maxLength={12}
                  editable={!loading && step === 'phone'}
                  style={styles.input}
                />
              </View>
            </View>

            {/* OTP field */}
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

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Button */}
            <Animated.View style={[styles.buttonWrap, { transform: [{ scale: btnScale }] }]}>
              <LinearGradient
                colors={[C.pinkLight, C.pink, C.pinkDeep]}
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

            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms & Privacy Policy</Text>
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};


export default Login;


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  // ✅ White background + purple bubbles on top
  background: { flex: 1 },

  // Purple bubbles overlay (60% opacity due to `purple66` color)
  bubbles: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.6,
  },
  // Positions of bubbles
  // Top‑left
  'bubble-1': { width: 30, height: 30, left: 40, top: 80 },
  // Bottom‑right
  'bubble-2': { width: 60, height: 60, right: 30, bottom: 100 },
  // Center‑top
  'bubble-3': { width: 40, height: 40, left: 20, top: 140 },
  // Center‑bottom
  'bubble-4': { width: 50, height: 50, right: 40, bottom: 80 },
  // Small one
  'bubble-5': { width: 30, height: 30, left: 60, bottom: 120 },

  // Centers card vertically & horizontally
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
   buttonWrap: {
    width: '100%',
    marginTop: 8,
  },

  /* ── Card ── */
  card: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
  },

  /* ── Icon ── */
  iconWrapper: {
    marginBottom: 22,
    shadowColor: C.pink,
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
    color: C.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: C.textSub,
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
    color: C.text,
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
    color: C.pink,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
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
    color: C.text,
    height: '100%',
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 12,
    color: C.pink,
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
  button: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: C.pink,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* ── Footer ── */
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: C.pink,
    fontWeight: '600',
  },
});