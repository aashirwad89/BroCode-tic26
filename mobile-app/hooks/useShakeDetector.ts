// src/hooks/useShakeDetector.ts
import { useEffect, useRef, useCallback } from 'react';
import { Accelerometer }                  from 'expo-sensors';
import * as Location                       from 'expo-location';
import { Audio }                           from 'expo-av';
import { Linking, Alert }                  from 'react-native';
import { triggerSOS }                      from '../services/api';
import { uploadAudioToCloudinary }         from '../services/cloudinary';

const DELTA_THRESHOLD       = 1.8;
const REQUIRED_SHAKES       = 5;
const SHAKE_WINDOW_MS       = 1500;
const SHAKE_COOLDOWN        = 5000;
const UPDATE_INTERVAL       = 80;
const RECORDING_DURATION_MS = 30_000;

// ── Phone number clean karo — WhatsApp ke liye +91XXXXXXXXXX chahiye ──
const formatPhoneForWhatsApp = (phone: string): string => {
  // Sirf digits rakho
  const digits = phone.replace(/\D/g, '');

  // Already 12 digit (91XXXXXXXXXX) → bas + lagao
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  // 10 digit Indian number → +91 prefix
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  // Kuch aur → as-is with +
  return `+${digits}`;
};

export default function useShakeDetector() {
  const lastShakeTime    = useRef<number>(0);
  const isRecording      = useRef<boolean>(false);
  const audioPath        = useRef<string>('');
  const recordingRef     = useRef<Audio.Recording | null>(null);
  const recordingTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevX            = useRef<number>(0);
  const prevY            = useRef<number>(0);
  const prevZ            = useRef<number>(0);
  const prevReady        = useRef<boolean>(false);
  const shakeCount       = useRef<number>(0);
  const shakeWindowStart = useRef<number>(0);

  // ── Stop Recording + Cloudinary Upload ────────────────────────
  const stopRecording = useCallback(async (): Promise<string> => {
    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
    }
    if (!isRecording.current || !recordingRef.current) return '';
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const localUri = recordingRef.current.getURI() ?? '';
      recordingRef.current = null;
      isRecording.current  = false;
      console.log('[AUDIO] ⏹️ Stopped, local URI:', localUri);

      const cloudinaryUrl = await uploadAudioToCloudinary(localUri);
      if (cloudinaryUrl) {
        audioPath.current = cloudinaryUrl;
        console.log('[AUDIO] ☁️ Cloudinary URL:', cloudinaryUrl);
      } else {
        audioPath.current = localUri;
        console.warn('[AUDIO] ⚠️ Cloudinary upload failed, using local URI');
      }
      return audioPath.current;
    } catch (err) {
      console.error('[AUDIO] Stop error:', err);
      return '';
    }
  }, []);

  // ── Start Recording ────────────────────────────────────────────
  const startRecording = useCallback(async (): Promise<string> => {
    if (isRecording.current) return audioPath.current;
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Error', 'Microphone permission chahiye!');
        return '';
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      isRecording.current  = true;
      console.log('[AUDIO] ▶️ Recording started — auto-stop in 30s');

      recordingTimer.current = setTimeout(async () => {
        console.log('[AUDIO] ⏰ 30s complete — uploading to Cloudinary...');
        await stopRecording();
      }, RECORDING_DURATION_MS);

      return 'recording_started';
    } catch (err) {
      isRecording.current = false;
      console.error('[AUDIO] Start error:', err);
      return '';
    }
  }, [stopRecording]);

  // ── WhatsApp sender — ek contact ko message bhejo ─────────────
  // APK mein whatsapp:// scheme reliable nahi — wa.me use karo
  const openWhatsApp = useCallback(async (
    phone: string,
    message: string
  ): Promise<void> => {
    const formatted = formatPhoneForWhatsApp(phone);
    const encoded   = encodeURIComponent(message);

    // ✅ Primary: wa.me universal link — APK + iOS dono mein kaam karta hai
    const waMe = `https://wa.me/${formatted.replace('+', '')}?text=${encoded}`;

    // Fallback: intent scheme (Android only)
    const intentUrl = `intent://send/${formatted.replace('+', '')}#Intent;scheme=whatsapp;package=com.whatsapp;end`;

    console.log('[WA] Trying wa.me for:', formatted);

    try {
      const canOpenWaMe = await Linking.canOpenURL(waMe);
      console.log('[WA] canOpenURL wa.me:', canOpenWaMe);

      if (canOpenWaMe) {
        await Linking.openURL(waMe);
        console.log('[WA] ✅ Opened wa.me for:', formatted);
      } else {
        // wa.me nahi chala toh intent try karo (Android)
        console.warn('[WA] wa.me failed, trying intent...');
        const canOpenIntent = await Linking.canOpenURL(intentUrl);
        if (canOpenIntent) {
          await Linking.openURL(intentUrl);
          console.log('[WA] ✅ Opened via intent for:', formatted);
        } else {
          console.error('[WA] ❌ WhatsApp not installed for:', formatted);
        }
      }
    } catch (err) {
      console.error('[WA] Error opening WhatsApp:', err);
    }
  }, []);

  // ── Location + SOS ────────────────────────────────────────────
  const sendSOSWithLocation = useCallback(async () => {
    try {
      // Step 1: Location permission
      console.log('[SOS] 📍 Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Error', 'Location permission chahiye!');
        return;
      }

      // Step 2: Location with timeout — APK mein Balanced bhi slow hoti hai
      // Low accuracy fast milti hai, aur SOS ke liye kafi accurate hai
      console.log('[SOS] 📡 Getting location (with 10s timeout)...');
      let latitude  = 0;
      let longitude = 0;

      try {
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low, // ✅ Fast — APK mein Balanced slow hoti hai
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Location timeout')), 10_000)
          ),
        ]);
        latitude  = (loc as Location.LocationObject).coords.latitude;
        longitude = (loc as Location.LocationObject).coords.longitude;
        console.log('[SOS] 📍 Got location:', latitude, longitude);
      } catch (locErr) {
        console.warn('[SOS] ⚠️ Location failed, trying last known...');
        // Last known location fallback
        const last = await Location.getLastKnownPositionAsync();
        if (last) {
          latitude  = last.coords.latitude;
          longitude = last.coords.longitude;
          console.log('[SOS] 📍 Using last known:', latitude, longitude);
        } else {
          console.error('[SOS] ❌ No location available');
          Alert.alert('Location Error', 'Location nahi mila!');
          return;
        }
      }

      // Step 3: Backend call
      console.log('[SOS] 🌐 Calling backend...');
      let contacts: { name: string; phone: string }[] = [];
      try {
        const { data: res } = await triggerSOS(latitude, longitude, '');
        contacts = res.data.contacts;
        console.log('[SOS] ✅ Backend OK, contacts:', contacts.length);
      } catch (apiErr: any) {
        console.error('[SOS] ❌ Backend error:', apiErr?.response?.status, apiErr?.message);
        Alert.alert('No Contacts', 'Backend se contacts nahi mila!');
        return;
      }

      if (contacts.length === 0) {
        Alert.alert('No Contacts', 'Koi trusted contact save nahi hai!');
        return;
      }

      // Step 4: WhatsApp — ✅ wa.me use karo, loop avoid karo
      // APK mein ek ke baad ek open nahi hota properly
      // Pehle contact ko open karo, baaki ke liye alert
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message  = `🚨 *SOS Alert!*\nMujhe madad chahiye!\n📍 Location:\n${mapsLink}`;

      console.log('[SOS] 📲 Sending WhatsApp to', contacts.length, 'contacts...');

      if (contacts.length === 1) {
        // Sirf ek contact — seedha open karo
        await openWhatsApp(contacts[0].phone, message);
      } else {
        // ✅ Pehle wale ko open karo
        await openWhatsApp(contacts[0].phone, message);

        // Baaki contacts ke numbers console mein log karo
        // (Multiple WhatsApp windows ek saath nahi khulte APK mein)
        const remaining = contacts.slice(1).map(c =>
          formatPhoneForWhatsApp(c.phone)
        );
        console.log('[SOS] ℹ️ Remaining contacts (manual):', remaining);
      }

      console.log('[SOS] ✅ All done!');
    } catch (err: any) {
      console.error('[SOS] ❌ Unexpected error:', err?.message ?? err);
    }
  }, [openWhatsApp]);

  // ── SOS Trigger ───────────────────────────────────────────────
  const triggerSOSNow = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeTime.current < SHAKE_COOLDOWN) return;
    lastShakeTime.current = now;
    shakeCount.current    = 0;
    console.log('[SHAKE] 🚨 Triggering — parallel tasks starting...');

    startRecording()
      .then(() => console.log('[PARALLEL] ✅ Recording task done'))
      .catch((e) => console.error('[PARALLEL] ❌ Recording error:', e));

    sendSOSWithLocation()
      .then(() => console.log('[PARALLEL] ✅ SOS task done'))
      .catch((e) => console.error('[PARALLEL] ❌ SOS error:', e));

  }, [startRecording, sendSOSWithLocation]);

  // ── Shake Detection ────────────────────────────────────────────
  const onAccelerometerUpdate = useCallback(
    ({ x, y, z }: { x: number; y: number; z: number }) => {
      if (!prevReady.current) {
        prevX.current = x; prevY.current = y; prevZ.current = z;
        prevReady.current = true;
        return;
      }
      const deltaX = Math.abs(x - prevX.current);
      const deltaY = Math.abs(y - prevY.current);
      const deltaZ = Math.abs(z - prevZ.current);
      prevX.current = x; prevY.current = y; prevZ.current = z;

      const isSpiked =
        deltaX > DELTA_THRESHOLD ||
        deltaY > DELTA_THRESHOLD ||
        deltaZ > DELTA_THRESHOLD;
      if (!isSpiked) return;

      const now = Date.now();
      if (now - lastShakeTime.current < SHAKE_COOLDOWN) return;

      if (now - shakeWindowStart.current > SHAKE_WINDOW_MS) {
        shakeCount.current       = 0;
        shakeWindowStart.current = now;
      }
      shakeCount.current += 1;
      console.log(`[SHAKE] Spike #${shakeCount.current} / ${REQUIRED_SHAKES}`);
      if (shakeCount.current >= REQUIRED_SHAKES) triggerSOSNow();
    },
    [triggerSOSNow]
  );

  useEffect(() => {
    Accelerometer.setUpdateInterval(UPDATE_INTERVAL);
    const sub = Accelerometer.addListener(onAccelerometerUpdate);
    return () => {
      sub.remove();
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      stopRecording();
    };
  }, [onAccelerometerUpdate, stopRecording]);

  return { stopRecording, isRecording };
}