// src/hooks/useShakeDetector.ts
import { useEffect, useRef, useCallback } from 'react';
import { Accelerometer }                  from 'expo-sensors';
import * as Location                       from 'expo-location';
import { Audio }                           from 'expo-av';
import { Linking, Alert }                  from 'react-native';
import { triggerSOS }                      from '../services/api';

// ─── Constants ────────────────────────────────────────────────────
const DELTA_THRESHOLD       = 1.8;
const REQUIRED_SHAKES       = 5;
const SHAKE_WINDOW_MS       = 1500;
const SHAKE_COOLDOWN        = 5000;
const UPDATE_INTERVAL       = 80;
const RECORDING_DURATION_MS = 30_000; // ✅ 30 seconds auto-stop

export default function useShakeDetector() {
  const lastShakeTime    = useRef<number>(0);
  const isRecording      = useRef<boolean>(false);
  const audioPath        = useRef<string>('');
  const recordingRef     = useRef<Audio.Recording | null>(null);
  const recordingTimer   = useRef<ReturnType<typeof setTimeout> | null>(null); // ✅ timer ref

  // Accelerometer delta tracking
  const prevX            = useRef<number>(0);
  const prevY            = useRef<number>(0);
  const prevZ            = useRef<number>(0);
  const prevReady        = useRef<boolean>(false);

  // Shake counter
  const shakeCount       = useRef<number>(0);
  const shakeWindowStart = useRef<number>(0);

  // ── Stop Recording ─────────────────────────────────────────────
  const stopRecording = useCallback(async (): Promise<string> => {
    // Timer clear karo agar manually stop ho raha hai
    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
    }

    if (!isRecording.current || !recordingRef.current) return '';

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI() ?? '';
      recordingRef.current = null;
      isRecording.current  = false;
      audioPath.current    = uri;
      console.log('[AUDIO] ⏹️ Stopped, saved at:', uri);
      return uri;
    } catch (err) {
      console.error('[AUDIO] Stop error:', err);
      return '';
    }
  }, []);

  // ── Start Recording (with 30s auto-stop) ──────────────────────
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
      console.log('[AUDIO] ▶️ Recording started — will stop in 30s');

      // ✅ 30 seconds baad auto-stop
      recordingTimer.current = setTimeout(async () => {
        console.log('[AUDIO] ⏰ 30s complete — auto stopping...');
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
  const sendSOSWithLocation = useCallback(async (recordedAudioPath: string) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Error', 'Location permission chahiye!');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;

      const { data: res } = await triggerSOS(latitude, longitude, recordedAudioPath);
      const contacts = res.data.contacts;

      if (contacts.length === 0) {
        Alert.alert('No Contacts', 'Koi trusted contact save nahi hai!');
        return;
      }

      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message  = `🚨 *SOS Alert!*\nMujhe madad chahiye!\n📍 Location:\n${mapsLink}`;

      for (const contact of contacts) {
        const url     = `whatsapp://send?phone=${contact.phone}&text=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          await new Promise<void>((r) => setTimeout(r, 1500));
        } else {
          console.warn('[WA] Cannot open for:', contact.phone);
        }
      }
    } catch (err) {
      console.error('[SOS] Error:', err);
    }
  }, []);

  // ── SOS Trigger ────────────────────────────────────────────────
  const triggerSOSNow = useCallback(async () => {
    const now = Date.now();
    if (now - lastShakeTime.current < SHAKE_COOLDOWN) return;
    lastShakeTime.current = now;
    shakeCount.current = 0;

    console.log('[SHAKE] ✅ SOS triggering!');

    const [recordedPath] = await Promise.all([
      startRecording(),
      sendSOSWithLocation(''),
    ]);

    audioPath.current = recordedPath;
  }, [startRecording, sendSOSWithLocation]);

  // ── Delta-Based Shake Detection ────────────────────────────────
  const onAccelerometerUpdate = useCallback(
    ({ x, y, z }: { x: number; y: number; z: number }) => {
      if (!prevReady.current) {
        prevX.current = x;
        prevY.current = y;
        prevZ.current = z;
        prevReady.current = true;
        return;
      }

      const deltaX = Math.abs(x - prevX.current);
      const deltaY = Math.abs(y - prevY.current);
      const deltaZ = Math.abs(z - prevZ.current);

      prevX.current = x;
      prevY.current = y;
      prevZ.current = z;

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

      if (shakeCount.current >= REQUIRED_SHAKES) {
        triggerSOSNow();
      }
    },
    [triggerSOSNow]
  );

  // ── Accelerometer Listener ─────────────────────────────────────
  useEffect(() => {
    Accelerometer.setUpdateInterval(UPDATE_INTERVAL);
    const sub = Accelerometer.addListener(onAccelerometerUpdate);

    return () => {
      sub.remove();
      // ✅ Unmount pe timer aur recording dono clear
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      stopRecording();
    };
  }, [onAccelerometerUpdate, stopRecording]);

  return { stopRecording, isRecording };
}