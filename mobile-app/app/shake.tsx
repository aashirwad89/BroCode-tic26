/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  Image,
  ScrollView,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Accelerometer } from 'expo-sensors'

const COLORS = {
  dark: '#0B1220',
  card: '#121A2B',
  purple: '#7C3AED',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#1E293B',
  red: '#EF4444',
  green: '#10B981',
  blue: '#3B82F6',
  yellow: '#F59E0B',
}

const ShakeDetection = () => {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [shakeCount, setShakeCount] = useState(0)
  const [lastShake, setLastShake] = useState(0)
  const scaleAnim = React.useRef(new Animated.Value(1)).current
  const pulseAnim = React.useRef(new Animated.Value(1)).current

  const SHAKE_THRESHOLD = 25
  const SHAKE_COOLDOWN = 500

  useEffect(() => {
    if (!isActive) return

    Accelerometer.setUpdateInterval(100)

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z)

      if (acceleration > SHAKE_THRESHOLD) {
        const now = Date.now()

        if (now - lastShake > SHAKE_COOLDOWN) {
          setShakeCount((prev) => {
            const newCount = prev + 1
            
            // ✅ REMOVED: Test alert
            // Trigger animation only
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start()

            return newCount
          })
          setLastShake(now)
        }
      }
    })

    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start()

    return () => subscription.remove()
  }, [isActive, lastShake])

  const features: Array<{
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
    title: string
    desc: string
  }> = [
    {
      icon: 'vibrate',
      title: 'Vibration Detection',
      desc: 'Shake your phone vigorously to trigger',
    },
    {
      icon: 'microphone',
      title: 'Audio Recording',
      desc: 'Automatically records audio when triggered',
    },
    {
      icon: 'bell-alert',
      title: 'Alert Contacts',
      desc: 'Instantly notifies your trusted contacts',
    },
    {
      icon: 'map-marker',
      title: 'Location Sharing',
      desc: 'Real-time location sent to emergency contacts',
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ============ HEADER ============ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shake Detection</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ============ STATUS CARD ============ */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isActive ? `${COLORS.green}20` : `${COLORS.red}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={isActive ? 'shield-check' : 'shield-alert'}
              size={20}
              color={isActive ? COLORS.green : COLORS.red}
            />
            <Text
              style={[
                styles.statusText,
                { color: isActive ? COLORS.green : COLORS.red },
              ]}
            >
              {isActive ? 'LISTENING' : 'READY'}
            </Text>
          </View>
        </View>

        {/* ============ MAIN VISUAL ============ */}
        <View style={styles.visualSection}>
          <Text style={styles.readyText}>Ready to Use</Text>

          {/* Animated Phone Image */}
          <Animated.View
            style={[
              styles.phoneContainer,
              { transform: [{ scale: isActive ? scaleAnim : 1 }] },
            ]}
          >
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/747/747376.png',
              }}
              style={styles.phoneImage}
            />
          </Animated.View>

          {/* Pulse Ring - Only Show When Active */}
          {isActive && (
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          )}

          {/* Shake Counter */}
          <View style={styles.counterContainer}>
            <Text style={styles.counterLabel}>Shakes Detected</Text>
            <Text style={styles.counterNumber}>{shakeCount}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((shakeCount / 5) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {isActive ? 'Listening for shakes...' : 'Tap on a feature to test'}
            </Text>
          </View>
        </View>

        {/* ============ INSTRUCTIONS ============ */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <MaterialCommunityIcons name="information" size={20} color={COLORS.blue} />
            <Text style={styles.instructionsTitle}>How to Use</Text>
          </View>
          
          <View style={styles.pointerList}>
            <View style={styles.pointer}>
              <View style={styles.pointerNumber}>
                <MaterialCommunityIcons name="numeric-1-circle" size={24} color={COLORS.text} />
              </View>
              <Text style={styles.pointerText}>Hold your phone firmly in your hand</Text>
            </View>

            <View style={styles.pointer}>
              <View style={styles.pointerNumber}>
                <MaterialCommunityIcons name="numeric-2-circle" size={24} color={COLORS.text} />
              </View>
              <Text style={styles.pointerText}>Enable shake detection from home screen</Text>
            </View>

            <View style={styles.pointer}>
              <View style={styles.pointerNumber}>
                <MaterialCommunityIcons name="numeric-3-circle" size={24} color={COLORS.text} />
              </View>
              <Text style={styles.pointerText}>Shake the phone vigorously and repeatedly</Text>
            </View>

            <View style={styles.pointer}>
              <View style={styles.pointerNumber}>
                <MaterialCommunityIcons name="numeric-4-circle" size={24} color={COLORS.text} />
              </View>
              <Text style={styles.pointerText}>Emergency recording starts automatically</Text>
            </View>

            <View style={styles.pointer}>
              <View style={styles.pointerNumber}>
                <MaterialCommunityIcons name="numeric-5-circle" size={24} color={COLORS.text} />
              </View>
              <Text style={styles.pointerText}>Trusted contacts are notified instantly</Text>
            </View>
          </View>
        </View>

        {/* ============ FEATURES ============ */}
        <View style={styles.featuresCard}>
          <View style={styles.featureHeader}>
            <MaterialCommunityIcons name="star" size={20} color={COLORS.purple} />
            <Text style={styles.featuresTitle}>Features</Text>
          </View>
          
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <MaterialCommunityIcons
                    name={feature.icon}
                    size={20}
                    color={COLORS.purple}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ============ WARNING ============ */}
        <View style={styles.warningCard}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.yellow} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningText}>
              This feature is designed for emergency situations. Use responsibly and only when
              genuinely needed.
            </Text>
          </View>
        </View>

        {/* ============ TIPS ============ */}
        <View style={styles.tipsCard}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={COLORS.yellow} />
            <Text style={styles.tipsTitle}>Pro Tips</Text>
          </View>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.green} />
              <Text style={styles.tipText}>Keep your phone in an accessible location</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.green} />
              <Text style={styles.tipText}>Test the feature regularly to ensure it works</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.green} />
              <Text style={styles.tipText}>Make sure your trusted contacts are up to date</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ✅ Add TouchableOpacity import
import { TouchableOpacity } from 'react-native'

export default ShakeDetection

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  container: {
    flex: 1,
    padding: 16,
  },

  statusCard: {
    marginBottom: 20,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  visualSection: {
    alignItems: 'center',
    marginBottom: 24,
  },

  readyText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },

  phoneContainer: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },

  phoneImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: `${COLORS.purple}50`,
    top: '50%',
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
  },

  counterContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },

  counterLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },

  counterNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.purple,
    marginBottom: 12,
  },

  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: `${COLORS.purple}20`,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 4,
  },

  progressText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  instructionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  instructionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  pointerList: {
    gap: 12,
  },

  pointer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  pointerNumber: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  pointerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    lineHeight: 18,
  },

  featuresCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  featuresTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  featuresList: {
    gap: 12,
  },

  featureItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },

  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${COLORS.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },

  featureDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  warningCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.yellow}15`,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: `${COLORS.yellow}30`,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.yellow,
    marginBottom: 4,
  },

  warningText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    lineHeight: 16,
  },

  tipsCard: {
    backgroundColor: `${COLORS.yellow}10`,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${COLORS.yellow}30`,
  },

  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  tipsList: {
    gap: 10,
  },

  tipItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  tipText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
})