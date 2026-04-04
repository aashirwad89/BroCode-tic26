/* eslint-disable react-hooks/rules-of-hooks */
import { useRef } from "react";

const TAP_LIMIT = 7;
const TIME_WINDOW = 5000; // 🔥 5 sec
const lastTriggered = useRef(0);
const COOLDOWN = 3000;

export default function useTapSOS(onTrigger: () => void) {
  const taps = useRef<number[]>([]);

  const handleTap = () => {
    const now = Date.now();

    taps.current.push(now);

    // sirf last 7 sec wale taps rakho
    taps.current = taps.current.filter(
      (t) => now - t <= TIME_WINDOW
    );

    // 🔍 DEBUG LOGS
    console.log("🖐 Tap registered at:", now);
    console.log("📊 Current taps in window:", taps.current.length);
    console.log("🕒 Tap timestamps:", taps.current);

    if (taps.current.length >= TAP_LIMIT && now-lastTriggered.current > COOLDOWN) {
      console.log("🚨 7 taps detected within 5 seconds!");

      taps.current = []; // reset
      lastTriggered.current = now;
      
      onTrigger();
    }
  };

  return { handleTap };
}