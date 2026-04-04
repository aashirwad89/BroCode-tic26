/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureHandlerRootView  } from "react-native-gesture-handler";
import { StatusBar } from 'expo-status-bar';
import useShakeAudio from "@/hooks/useShakeAudio";
import useTapSOS from "@/hooks/useTapSOS";
import { startSharing } from "../hooks/useLocationShare";

export default function RootLayout() {

  useShakeAudio();

  const startLocationSharing = () => {
    console.log("📍 SOS Triggered");
    startSharing("session_123");
  };

  const { handleTap } = useTapSOS(startLocationSharing);

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      handleTap();
    });
    
  return (
    <GestureHandlerRootView>
      <StatusBar style="light" hidden={false} />
      <View style={{ flex: 1 }}>
        <Stack  screenOptions={{ headerShown: false }}/>
      </View>
    </GestureHandlerRootView>
  );
}