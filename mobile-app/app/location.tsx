/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Share,
  Pressable,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'

// ============ COLORS (Light Theme) ============
const COLORS = {
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  lightGray2: '#EEEEEE',
  darkText: '#2C2C2C',
  secondaryText: '#666666',
  darkPink: '#C2185B', // Dark Pink Primary
  lightPink: '#E91E63', // Light Pink Secondary
  darkPinkGradient: '#8B0A50', // For gradients
  success: '#4CAF50',
  error: '#F44336',
  border: '#E0E0E0',
  shadow: '#00000015',
}

const location = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sharingLocation, setSharingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [address, setAddress] = useState('')
  const [sessionId] = useState('emergency-session-' + Date.now())

  const LIVE_TRACK_URL = `http://10.252.189.103:3000/track/${sessionId}`

  // ============ GET CURRENT LOCATION ============
  const getCurrentLocation = async (): Promise<{
    latitude: number
    longitude: number
  } | null> => {
    try {
      setLoading(true)
      console.log('📍 Requesting location permission...')

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'We need location access to share your emergency location. Please enable it in settings.'
        )
        return null
      }

      console.log('📍 Getting current position...')
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        mayShowUserSettingsDialog: true,
      })

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      setCurrentLocation(coords)
      console.log('✅ Location found:', coords)

      // Get address
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync(coords)
        if (reverseGeocode.length > 0) {
          const addr = reverseGeocode[0]
          const addressText = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`
          setAddress(addressText)
          console.log('📍 Address:', addressText)
        }
      } catch (error) {
        console.log('Could not get address, showing coordinates instead')
      }

      return coords
    } catch (error) {
      console.error('❌ Location error:', error)

      // Fallback: Last known location
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          requiredAccuracy: 100,
        })
        if (lastKnown) {
          const coords = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          }
          setCurrentLocation(coords)
          return coords
        }
      } catch (_) {}

      Alert.alert('Error', 'Could not get your location. Please check permissions.')
      return null
    } finally {
      setLoading(false)
    }
  }

  // ============ CREATE EMERGENCY MESSAGE ============
  const createEmergencyMessage = async () => {
    if (!currentLocation) {
      const location = await getCurrentLocation()
      if (!location) return null
    }

    const location = currentLocation!
    const { latitude, longitude } = location

    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=17`

    const message = `🚨 EMERGENCY - PLEASE HELP ME 🚨

I'm in DANGER and need IMMEDIATE help!

📍 LIVE LOCATION TRACKING: ${LIVE_TRACK_URL}
🗺️  CURRENT LOCATION (tap to open): ${mapsLink}

📌 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
📍 Address: ${address || 'Location enabled'}
⏰ Time: ${new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    })}

Please contact authorities/police immediately!
#SOS #Emergency`

    return message
  }

  // ============ SHARE VIA WHATSAPP ============
  const shareViaWhatsApp = async (message: string) => {
    try {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`

      const supported = await Linking.canOpenURL(whatsappUrl)
      if (supported) {
        await Linking.openURL(whatsappUrl)
      } else {
        throw new Error('WhatsApp not installed')
      }
    } catch (error) {
      console.error('WhatsApp error:', error)
      throw error
    }
  }

  // ============ SHARE VIA SMS ============
  const shareViaSMS = async (message: string) => {
    try {
      const smsUrl =
        Platform.OS === 'android'
          ? `sms:?body=${encodeURIComponent(message)}`
          : `sms:&body=${encodeURIComponent(message)}`
      await Linking.openURL(smsUrl)
    } catch (error) {
      console.error('SMS error:', error)
      throw error
    }
  }

  // ============ HANDLE EMERGENCY SHARE ============
  const handleEmergencyShare = async () => {
    try {
      setSharingLocation(true)

      const message = await createEmergencyMessage()
      if (!message) return

      try {
        // Try WhatsApp first
        await shareViaWhatsApp(message)
        Alert.alert(
          '✅ Emergency Alert Sent',
          'Your location has been shared via WhatsApp'
        )
      } catch (whatsappError) {
        console.log('WhatsApp failed, trying system share')

        // Fallback to system share
        const result = await Share.share({
          message,
          title: '🚨 EMERGENCY - LIVE LOCATION',
          url: LIVE_TRACK_URL,
        })

        if (result.action === Share.sharedAction) {
          Alert.alert('✅ Emergency Alert Shared', 'Location shared successfully')
        }
      }
    } catch (error) {
      console.error('Share error:', error)
      // Last resort: Copy link to clipboard
      Alert.alert(
        '🚨 Emergency Alert',
        'Unable to share via apps. Copy this link and send to your contacts:\n\n' +
          LIVE_TRACK_URL,
        [
          {
            text: 'Copy Link',
            onPress: async () => {
              try {
                await Linking.openURL(`clipboard://${LIVE_TRACK_URL}`)
                // Fallback: Show alert with link to copy manually
                if (Platform.OS === 'web') {
                  navigator.clipboard?.writeText(LIVE_TRACK_URL)
                }
                Alert.alert('✅ Link Copied', 'Paste it in any message app')
              } catch (_) {}
            },
          },
          { text: 'Cancel' },
        ]
      )
    } finally {
      setSharingLocation(false)
    }
  }

  // Load location on mount
  useEffect(() => {
    getCurrentLocation()
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ============ HEADER ============ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={COLORS.darkText}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Location</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ============ EMERGENCY ALERT CARD ============ */}
        <View style={styles.emergencyAlertCard}>
          <View style={styles.alertIconContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color={COLORS.error}
            />
          </View>
          <Text style={styles.alertTitle}>Emergency Location Sharing</Text>
          <Text style={styles.alertDescription}>
            Tap the button below to instantly share your live location with trusted
            contacts. They will receive a link to track your location in real-time.
          </Text>
        </View>

        {/* ============ CURRENT LOCATION CARD ============ */}
        {currentLocation && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View style={styles.locationIconContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color={COLORS.darkPink}
                />
              </View>
              <Text style={styles.locationCardTitle}>Current Location</Text>
            </View>

            <View style={styles.locationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Latitude:</Text>
                <Text style={styles.detailValue}>
                  {currentLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Longitude:</Text>
                <Text style={styles.detailValue}>
                  {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.divider} />
              {address && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.detailValue}>{address}</Text>
                </View>
              )}
            </View>

            {/* Open Maps Button */}
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={() => {
                const mapsUrl = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
                Linking.openURL(mapsUrl)
              }}
            >
              <MaterialCommunityIcons
                name="google-maps"
                size={20}
                color={COLORS.darkPink}
              />
              <Text style={styles.mapsButtonText}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ============ LOADING STATE ============ */}
        {loading && !currentLocation && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.darkPink} />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        )}

        {/* ============ REFRESH LOCATION BUTTON ============ */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={20}
            color={COLORS.darkPink}
          />
          <Text style={styles.refreshButtonText}>Refresh Location</Text>
        </TouchableOpacity>

        {/* ============ INFO SECTION ============ */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={COLORS.darkPink}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoTitle}>How It Works</Text>
              <Text style={styles.infoText}>
                When you share your location, your trusted contacts will receive a
                link. They can open it to see your real-time location on a map.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="lock"
              size={20}
              color={COLORS.darkPink}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoTitle}>Privacy & Security</Text>
              <Text style={styles.infoText}>
                Your location data is encrypted and shared only with people you
                choose. You can stop sharing at any time.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ============ EMERGENCY SHARE BUTTON (Sticky) ============ */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.emergencyButton,
            sharingLocation && styles.emergencyButtonDisabled,
          ]}
          onPress={handleEmergencyShare}
          disabled={sharingLocation || loading}
        >
          <MaterialCommunityIcons
            name={sharingLocation ? 'loading' : 'alert-circle'}
            size={24}
            color={COLORS.white}
            style={sharingLocation ? { opacity: 0.7 } : {}}
          />
          <Text style={styles.emergencyButtonText}>
            {sharingLocation ? '🚨 SENDING...' : '🚨 SHARE EMERGENCY LOCATION'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default location

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // ============ HEADER ============
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginTop:42,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkText,
  },

  // ============ CONTAINER ============
  container: {
    flex: 1,
    padding: 16,
  },

  // ============ EMERGENCY ALERT CARD ============
  emergencyAlertCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    alignItems: 'center',
  },

  alertIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 8,
    textAlign: 'center',
  },

  alertDescription: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ============ LOCATION CARD ============
  locationCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${COLORS.darkPink}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  locationCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  locationDetails: {
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: `${COLORS.darkPink}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.darkPink,
  },

  mapsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkPink,
  },

  // ============ LOADING ============
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },

  // ============ REFRESH BUTTON ============
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  refreshButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkPink,
  },

  // ============ INFO SECTION ============
  infoSection: {
    gap: 12,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },

  infoText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    lineHeight: 16,
  },

  // ============ BUTTON CONTAINER ============
  buttonContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // ============ EMERGENCY BUTTON ============
  emergencyButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  emergencyButtonDisabled: {
    opacity: 0.7,
  },

  emergencyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})