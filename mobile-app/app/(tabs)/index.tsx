/* eslint-disable no-unreachable */
import useShakeAudio from '@/hooks/useShakeAudio';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
  return <Redirect href="/login" />;
  useShakeAudio();
}