// hooks/useShakeAudio.ts
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import axios from 'axios';

const SHAKE_THRESHOLD = 1.5;

export default function useShakeAudio() {
  const lastShake = useRef(0);
  const recordingRef = useRef<any>(null);

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
      await Audio.requestPermissionsAsync();

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await recording.startAsync();
      recordingRef.current = recording;

      setTimeout(stopRecording, 10000);

    } catch (err) {
      console.log(err);
    }
  };

  const stopRecording = async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (uri) uploadAudio(uri);
  };

  const uploadAudio = async (uri: string) => {
    const formData = new FormData();

    formData.append('audio', {
      uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    } as any);

    await axios.post("http://YOUR_IP:8000/api/audio/upload", formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };
}