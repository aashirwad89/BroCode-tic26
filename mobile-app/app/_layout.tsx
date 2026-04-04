/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { StatusBar } from 'expo-status-bar';
import useShakeDetector from "@/hooks/useShakeDetector";

export default function RootLayout() {

  useShakeDetector();
    
  return (
    <>
   
      <StatusBar style="light" hidden={false} />
      <View style={{ flex: 1 }}>
        <Stack  screenOptions={{ headerShown: false }}/>
      </View>
       </>
  );

}