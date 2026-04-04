import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Share,
} from 'react-native';
import * as Location from 'expo-location';

interface ShareButtonProps {
  sessionId: string;
}

export default function EmergencyShareButton({ sessionId }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const LIVE_TRACK_URL = `http://10.252.189.103:3000/track/${sessionId}`;

  const getCurrentLocation = async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Emergency location sharing needs location access. Please enable it.',
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation, // ✅ Max GPS accuracy
        mayShowUserSettingsDialog: true,               // ✅ Android GPS dialog
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Location error:', error);

      // ✅ Fallback: Last known location try karo
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          requiredAccuracy: 100, // 100 meters ke andar
        });
        if (lastKnown) {
          return {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
        }
      } catch (_) {}

      Alert.alert('Error', 'Could not get your location');
      return null;
    }
  };

  const createEmergencyMessage = async () => {
    const location = await getCurrentLocation();
    if (!location) return;

    const { latitude, longitude } = location;

    // ✅ Seedha pin drop — Google Maps pe open hoga exact location pe
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=17`;

    // ✅ Backup: geo: URI (Android apps jaise Maps, WhatsApp maps support karte hain)
    const geoLink = `geo:${latitude},${longitude}?q=${latitude},${longitude}(My+Location)`;

    const message = `🚨 EMERGENCY - PLEASE HELP ME 🚨

I'm in DANGER and need IMMEDIATE help!

📍 LIVE LOCATION TRACKING: ${LIVE_TRACK_URL}
🗺️  CURRENT LOCATION (tap to open): ${mapsLink}

📌 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
⏰ Time: ${new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    })}

Please contact authorities/police immediately!
#SOS #Emergency`;

    return message;
  };

  const shareViaWhatsApp = async (message: string) => {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    if (Platform.OS === 'android') {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        throw new Error('WhatsApp not installed');
      }
    } else {
      await Linking.openURL(whatsappUrl);
    }
  };

  const shareViaSMS = async (message: string) => {
    const phoneNumber = '';
    const smsUrl =
      Platform.OS === 'android'
        ? `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
        : `sms:${phoneNumber}&body=${encodeURIComponent(message)}`;
    await Linking.openURL(smsUrl);
  };

  const handleEmergencyShare = async () => {
    setLoading(true);

    try {
      const message = await createEmergencyMessage();
      if (!message) return;

      try {
        await shareViaWhatsApp(message);
        Alert.alert('✅ Emergency Alert Sent', 'Location shared via WhatsApp');
      } catch (whatsappError) {
        console.log('WhatsApp failed, trying system share:', whatsappError);

        const result = await Share.share({
          message,
          title: '🚨 EMERGENCY - LIVE LOCATION',
          url: LIVE_TRACK_URL,
        });

        if (result.action === Share.sharedAction) {
          Alert.alert('✅ Emergency Alert Shared', 'Location shared successfully');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert(
        '🚨 Emergency Alert',
        'Copy this link and send to contacts:\n\n' + LIVE_TRACK_URL,
        [
          {
            text: 'Copy Link',
            onPress: () => {
              navigator.clipboard?.writeText(LIVE_TRACK_URL);
              Alert.alert('Link copied to clipboard');
            },
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={[styles.emergencyButton, loading && styles.emergencyButtonDisabled]}
      onPress={handleEmergencyShare}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Share Emergency Location"
    >
      <Text style={styles.emergencyButtonText}>
        {loading ? '🚨 SENDING...' : '🚨 SHARE EMERGENCY LOCATION'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emergencyButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonDisabled: {
    opacity: 0.7,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});