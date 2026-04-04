// src/hooks/useShakeDetector.ts
import { useEffect, useRef, useCallback }  from 'react';
import { Accelerometer }                   from 'expo-sensors';
import * as Location                        from 'expo-location';
import { Audio }                            from 'expo-av';
import { Linking, Alert }                   from 'react-native';
import { triggerSOS }                       from '../services/api';
import { uploadAudioToCloudinary }          from '../services/cloudinary';

const DELTA_THRESHOLD       = 1.8;
const REQUIRED_SHAKES       = 5;
const SHAKE_WINDOW_MS       = 1500;
const SHAKE_COOLDOWN        = 5000;
const UPDATE_INTERVAL       = 80;
const RECORDING_DURATION_MS = 30_000;

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
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
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

  // ── Location + WhatsApp ────────────────────────────────────────
  const sendSOSWithLocation = useCallback(async () => {
    try {
      // Step 1: Location permission
      console.log('[SOS] 📍 Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[SOS] Permission status:', status);
      if (status !== 'granted') {
        Alert.alert('Permission Error', 'Location permission chahiye!');
        return;
      }

      // Step 2: Current location — Balanced use karo, High slow hota hai
      console.log('[SOS] 📡 Getting location...');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      console.log('[SOS] 📍 Got location:', latitude, longitude);

      // Step 3: Backend call — fail ho toh bhi WhatsApp chalega
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

      // Step 4: WhatsApp
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message  = `🚨 *SOS Alert!*\nMujhe madad chahiye!\n📍 Location:\n${mapsLink}`;
      console.log('[SOS] 📲 Sending WhatsApp to', contacts.length, 'contacts...');

      for (const contact of contacts) {
        const url     = `whatsapp://send?phone=${contact.phone}&text=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(url);
        console.log('[WA] Can open for', contact.phone, ':', canOpen);
        if (canOpen) {
          await Linking.openURL(url);
          await new Promise<void>((r) => setTimeout(r, 1500));
        } else {
          console.warn('[WA] ❌ Cannot open for:', contact.phone);
        }
      }
      console.log('[SOS] ✅ All done!');
    } catch (err: any) {
      console.error('[SOS] ❌ Unexpected error:', err?.message ?? err);
    }
  }, []);

  // ── SOS Trigger — INDEPENDENT parallel (ek fail toh doosra chale) ──
  const triggerSOSNow = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeTime.current < SHAKE_COOLDOWN) return;
    lastShakeTime.current = now;
    shakeCount.current    = 0;
    console.log('[SHAKE] 🚨 Triggering — parallel tasks starting...');

    // ✅ .then/.catch use karo — await nahi — dono independent chalenge
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

      const isSpiked = deltaX > DELTA_THRESHOLD || deltaY > DELTA_THRESHOLD || deltaZ > DELTA_THRESHOLD;
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