import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import axios from 'axios';

const SHAKE_THRESHOLD = 1.5;
const REQUIRED_SHAKES = 4;
const TIME_WINDOW = 4000; // 4 sec

export default function useShakeAudio() {
  const recordingRef = useRef<Audio.Recording | null>(null);

  const shakeCount = useRef(0);
  const firstShakeTime = useRef(0);
  const lastShakeTime = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const force = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (force > SHAKE_THRESHOLD) {

        // 🔥 debounce (avoid multiple counts in same shake)
        if (now - lastShakeTime.current < 500) return;
        lastShakeTime.current = now;

        // first shake
        if (shakeCount.current === 0) {
          firstShakeTime.current = now;
        }

        shakeCount.current += 1;

        console.log("📳 Shake count:", shakeCount.current);

        // check within time window
        if (now - firstShakeTime.current <= TIME_WINDOW) {

          if (shakeCount.current >= REQUIRED_SHAKES) {
            console.log("🔥 Valid shake pattern detected");

            // reset before recording
            shakeCount.current = 0;
            firstShakeTime.current = 0;

            startRecording();
          }

        } else {
          // ⏱ reset if time exceeded
          console.log("⏱ Reset shake count");

          shakeCount.current = 1;
          firstShakeTime.current = now;
        }
      }
    });

    return () => sub.remove();
  }, []);

  const startRecording = async () => {
    try {
      if (recordingRef.current) return;

      console.log("🎤 Starting recording...");

      await Audio.requestPermissionsAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();

      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await recording.startAsync();

      recordingRef.current = recording;

      console.log("✅ Recording started");

      setTimeout(stopRecording, 10000);

    } catch (err) {
      console.log("❌ Start error:", err);
    }
  };

  const stopRecording = async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      console.log("⏹ Stopping recording...");

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();

      console.log("📁 Saved URI:", uri);

      recordingRef.current = null;

      if (uri) uploadAudio(uri);

    } catch (err) {
      console.log("❌ Stop error:", err);
    }
  };

  const uploadAudio = async (uri: string) => {
    try {
      console.log("📡 Uploading audio...");

      const formData = new FormData();

      formData.append('audio', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);

      const res = await axios.post(
        "http://10.252.189.103:8000/api/aud/audio/upload", // ✅ FIXED
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log("🔥 Upload success:", res.data);

    } catch (err) {
      console.log("❌ Upload error:", err);
    }
  };
}