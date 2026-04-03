import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import axios from 'axios';

const SHAKE_THRESHOLD = 1.5;

export default function useShakeAudio() {
  const lastShake = useRef(0);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const sub = Accelerometer.addListener(async ({ x, y, z }) => {
      const force = Math.sqrt(x*x + y*y + z*z);

      if (force > SHAKE_THRESHOLD) {
        const now = Date.now();

        if (now - lastShake.current > 5000) {
          lastShake.current = now;
          startRecording();
        }
      }
    });

    return () => sub.remove();
  }, []);

  const startRecording = async () => {
    try {
      if (recordingRef.current) return; // prevent duplicate

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
        "http://10.252.189.103:8000/api/aud/audio/upload", // FIXED URL
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