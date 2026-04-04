// src/hooks/useShakeDetector.ts
import { useEffect, useRef, useCallback } from 'react';
import { Accelerometer }                  from 'expo-sensors';
import * as Location                       from 'expo-location';
import { Audio }                           from 'expo-av';
import { Linking, Alert }                  from 'react-native';
import { triggerSOS }                      from '../services/api';

const SHAKE_THRESHOLD = 1.8;
const SHAKE_COOLDOWN  = 3000;

export default function useShakeDetector() {
  const lastShakeTime  = useRef<number>(0);
  const isRecording    = useRef<boolean>(false);
  const audioPath      = useRef<string>('');
  const recordingRef   = useRef<Audio.Recording | null>(null);

  // ── Audio Recording ────────────────────────────────────────
  const startRecording = useCallback(async (): Promise<string> => {
    if (isRecording.current) return audioPath.current;
    try {
      // Permission lo
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

      console.log('[AUDIO] Recording started');
      return 'recording_started';
    } catch (err) {
      isRecording.current = false;
      console.error('[AUDIO] Start error:', err);
      return '';
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    if (!isRecording.current || !recordingRef.current) return '';
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI() ?? '';
      recordingRef.current = null;
      isRecording.current  = false;
      audioPath.current    = uri;

      console.log('[AUDIO] Stopped, saved at:', uri);
      return uri;
    } catch (err) {
      console.error('[AUDIO] Stop error:', err);
      return '';
    }
  }, []);

  // ── Location + WhatsApp ────────────────────────────────────
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

      // Backend ko SOS log karo + contacts fetch karo
      const { data: res } = await triggerSOS(latitude, longitude, recordedAudioPath);
      const contacts = res.data.contacts;

      if (contacts.length === 0) {
        Alert.alert('No Contacts', 'Koi trusted contact save nahi hai!');
        return;
      }

      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message  = `🚨 *SOS Alert!*\nMujhe madad chahiye!\n📍 Location:\n${mapsLink}`;

      // Har contact ko WhatsApp pe bhejo
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

  // ── Shake Handler ──────────────────────────────────────────
  const handleShake = useCallback(async () => {
    const now = Date.now();
    if (now - lastShakeTime.current < SHAKE_COOLDOWN) return;
    lastShakeTime.current = now;
    console.log('[SHAKE] Detected!');

    // PARALLEL: dono ek saath
    const [recordedPath] = await Promise.all([
      startRecording(),
      sendSOSWithLocation(''),
    ]);

    audioPath.current = recordedPath;
  }, [startRecording, sendSOSWithLocation]);

  // ── Accelerometer Listener ─────────────────────────────────
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const force = Math.sqrt(x * x + y * y + z * z);
      if (force > SHAKE_THRESHOLD) handleShake();
    });

    return () => {
      sub.remove();
      stopRecording();
    };
  }, [handleShake, stopRecording]);

  return { stopRecording, isRecording };
}