import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const BASE_URL = 'http://10.252.189.103:8000/api'; 
// Example:
// Android emulator -> http://10.0.2.2:5000/api/auth
// iPhone physical device -> http://192.168.1.5:5000/api/auth

const Login = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cleanedPhone = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const cleanedOtp = useMemo(() => otp.replace(/\D/g, ''), [otp]);

  const isPhoneValid = cleanedPhone.length === 10 || cleanedPhone.length === 12;
  const isOtpValid = cleanedOtp.length === 4;

  const requestOtp = async () => {
    if (!isPhoneValid) {
      setError('Phone number 10 ya 12 digits ka hona chahiye');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: cleanedPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'OTP bhejne me problem aayi');
      }

      setStep('otp');

      // Dev mode only, because backend is returning otp
      if (data?.otp) {
        Alert.alert('OTP Sent', `Demo OTP: ${data.otp}`);
      } else {
        Alert.alert('OTP Sent', 'OTP successfully send ho gaya');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!isPhoneValid) {
      setError('Invalid phone number');
      return;
    }

    if (!isOtpValid) {
      setError('OTP 4 digits ka hona chahiye');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanedPhone,
          otp: cleanedOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'OTP verify nahi hua');
      }

      if (data?.token) {
        await SecureStore.setItemAsync('token', data.token);
      }

      if (data?.userId) {
        await SecureStore.setItemAsync('userId', data.userId);
      }

      await SecureStore.setItemAsync('phone', cleanedPhone);

      Alert.alert('Success', 'Login successful');
      
      // yahan navigation laga do:
       router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OTP Login</Text>
            </View>

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Apna phone number daalo aur secure OTP se login karo.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter 10 or 12 digit phone"
                placeholderTextColor="#7C8BA1"
                keyboardType="phone-pad"
                maxLength={12}
                editable={!loading && step === 'phone'}
                style={[
                  styles.input,
                  step === 'otp' && styles.inputDisabled,
                ]}
              />

              {step === 'otp' && (
                <>
                  <View style={styles.otpHeader}>
                    <Text style={styles.label}>OTP</Text>
                    <Pressable onPress={goBackToPhone}>
                      <Text style={styles.changeText}>Change number</Text>
                    </Pressable>
                  </View>

                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter 4 digit OTP"
                    placeholderTextColor="#7C8BA1"
                    keyboardType="number-pad"
                    maxLength={4}
                    editable={!loading}
                    style={styles.input}
                  />
                </>
              )}

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              {step === 'phone' ? (
                <Pressable
                  style={[
                    styles.button,
                    (!isPhoneValid || loading) && styles.buttonDisabled,
                  ]}
                  onPress={requestOtp}
                  disabled={!isPhoneValid || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </Pressable>
              ) : (
                <Pressable
                  style={[
                    styles.button,
                    (!isOtpValid || loading) && styles.buttonDisabled,
                  ]}
                  onPress={verifyOtp}
                  disabled={!isOtpValid || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </Pressable>
              )}
            </View>

            <Text style={styles.footerText}>
              Continue karke tum OTP based authentication use kar rahe ho.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0B1220',
  },
  card: {
    backgroundColor: '#121A2B',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: '#DBEAFE',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 24,
  },
  form: {
    gap: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#F8FAFC',
    marginBottom: 4,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  otpHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changeText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    height: 54,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    marginTop: 2,
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});