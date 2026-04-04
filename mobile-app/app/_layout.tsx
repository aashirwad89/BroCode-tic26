/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView  } from "react-native-gesture-handler";

import useShakeAudio from "@/hooks/useShakeAudio";
import useTapSOS from "@/hooks/useTapSOS";
import { startSharing } from "../hooks/useLocationShare";
import React from "react";

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
   <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={tapGesture}>
        <View style={{ flex: 1 }}>
          <Stack />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}