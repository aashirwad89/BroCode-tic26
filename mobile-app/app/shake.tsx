/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Accelerometer } from 'expo-sensors'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

const C = {
  bg:          '#F8FAFC',
  surface:     '#FFFFFF',
  pink:        '#DB2777',
  pinkLight:   '#F472B6',
  pinkDeep:    '#9D174D',
  pinkGlow:    '#EC4899',
  text:        '#111827',
  textSub:     '#64748B',
  border:      '#F1F5F9',
  borderMid:   '#E2E8F0',
  green:       '#10B981',
  greenLight:  '#D1FAE5',
  red:         '#EF4444',
  redLight:    '#FEE2E2',
  yellow:      '#F59E0B',
  yellowLight: '#FEF3C7',
  blue:        '#3B82F6',
  blueLight:   '#DBEAFE',
}

const SHAKE_THRESHOLD = 25
const SHAKE_COOLDOWN  = 500

export default function ShakeDetection() {
  const router = useRouter()
  const [isActive, setIsActive]   = useState(false)
  const [lastShake, setLastShake] = useState(0)

  const scaleAnim  = useRef(new Animated.Value(1)).current
  const pulseAnim  = useRef(new Animated.Value(1)).current
  const glowAnim   = useRef(new Animated.Value(0)).current
  const btnScale   = useRef(new Animated.Value(1)).current
  const ringAnim   = useRef(new Animated.Value(0.8)).current
  const ring2Anim  = useRef(new Animated.Value(0.6)).current

  // Pulse loop when active
  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      )
      const ring = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim,  { toValue: 1.4, duration: 1200, useNativeDriver: true }),
          Animated.timing(ringAnim,  { toValue: 0.8, duration: 1200, useNativeDriver: true }),
        ])
      )
      const ring2 = Animated.loop(
        Animated.sequence([
          Animated.timing(ring2Anim, { toValue: 1.6, duration: 1600, useNativeDriver: true }),
          Animated.timing(ring2Anim, { toValue: 0.6, duration: 1600, useNativeDriver: true }),
        ])
      )
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      )
      pulse.start(); ring.start(); ring2.start(); glow.start()
      return () => { pulse.stop(); ring.stop(); ring2.stop(); glow.stop() }
    } else {
      pulseAnim.setValue(1)
      glowAnim.setValue(0)
      ringAnim.setValue(0.8)
      ring2Anim.setValue(0.6)
    }
  }, [isActive])

  // Accelerometer
  useEffect(() => {
    if (!isActive) return
    Accelerometer.setUpdateInterval(100)
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const acc = Math.sqrt(x * x + y * y + z * z)
      if (acc > SHAKE_THRESHOLD) {
        const now = Date.now()
        if (now - lastShake > SHAKE_COOLDOWN) {
          setLastShake(now)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.25, duration: 80, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
          ]).start()
        }
      }
    })
    return () => sub.remove()
  }, [isActive, lastShake])

  const toggleActive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start()
    setIsActive(prev => !prev)
  }

  const steps = [
    { icon: 'smartphone' as const,  label: 'Hold phone firmly in hand' },
    { icon: 'zap' as const,         label: 'Shake vigorously & repeatedly' },
    { icon: 'mic' as const,         label: 'Recording starts automatically' },
    { icon: 'users' as const,       label: 'Contacts notified instantly' },
    { icon: 'map-pin' as const,     label: 'Location sent in real-time' },
  ]

  const features: Array<{
    icon: React.ComponentProps<typeof Feather>['name']
    label: string
    desc: string
    color: string
    bg: string
  }> = [
    { icon: 'mic',      label: 'Auto Recording',     desc: 'Records audio when triggered',         color: C.pink,   bg: '#FDF2F8' },
    { icon: 'bell',     label: 'Alert Contacts',     desc: 'Notifies your trusted contacts',       color: C.blue,   bg: C.blueLight },
    { icon: 'map-pin',  label: 'Live Location',      desc: 'Real-time GPS to emergency contacts',  color: C.green,  bg: C.greenLight },
    { icon: 'shield',   label: 'Always On Guard',    desc: 'Works even in background',             color: C.yellow, bg: C.yellowLight },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={26} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shake Detection</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HERO VISUAL ── */}
        <View style={styles.heroSection}>

          {/* Status pill */}
          <View style={[
            styles.statusPill,
            { backgroundColor: isActive ? C.greenLight : C.redLight,
              borderColor:      isActive ? `${C.green}40` : `${C.red}20` }
          ]}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? C.green : C.red }]} />
            <Text style={[styles.statusLabel, { color: isActive ? C.green : C.red }]}>
              {isActive ? 'LISTENING' : 'INACTIVE'}
            </Text>
          </View>

          {/* Animated rings + icon */}
          <View style={styles.ringWrapper}>
            {isActive && (
              <>
                <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2Anim }], opacity: ring2Anim.interpolate({ inputRange: [0.6, 1.6], outputRange: [0.3, 0] }) }]} />
                <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ringAnim }],  opacity: ringAnim.interpolate({ inputRange: [0.8, 1.4], outputRange: [0.5, 0] }) }]} />
              </>
            )}
            <Animated.View style={{ transform: [{ scale: isActive ? pulseAnim : scaleAnim }] }}>
              <LinearGradient
                colors={[C.pinkLight, C.pink, C.pinkDeep]}
                style={styles.iconCircle}
              >
                <Feather name="smartphone" size={46} color="#fff" strokeWidth={1.5} />
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.heroTitle}>
            {isActive ? 'Shake your phone!' : 'Ready to protect you'}
          </Text>
          <Text style={styles.heroSub}>
            {isActive
              ? 'Shake vigorously to trigger emergency mode'
              : 'Activate shake detection to get started'}
          </Text>

          {/* ACTIVATE BUTTON */}
          <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%', marginTop: 24 }}>
            {isActive ? (
              <Pressable onPress={toggleActive} style={styles.deactivateBtn}>
                <Feather name="square" size={16} color={C.red} />
                <Text style={[styles.deactivateBtnText]}>Deactivate</Text>
              </Pressable>
            ) : (
              <TouchableOpacity onPress={toggleActive} activeOpacity={0.88}>
                <LinearGradient
                  colors={[C.pinkLight, C.pink, C.pinkDeep]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.activateBtn}
                >
                  <Feather name="shield" size={18} color="#fff" />
                  <Text style={styles.activateBtnText}>Active Protection</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: C.blueLight }]}>
              <Feather name="info" size={15} color={C.blue} />
            </View>
            <Text style={styles.cardTitle}>How It Works</Text>
          </View>

          <View style={styles.stepsList}>
            {steps.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <LinearGradient
                    colors={[C.pinkLight, C.pink]}
                    style={styles.stepNum}
                  >
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </LinearGradient>
                  {i < steps.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepIconBox}>
                    <Feather name={s.icon} size={15} color={C.pink} />
                  </View>
                  <Text style={styles.stepLabel}>{s.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── FEATURES ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: '#FDF2F8' }]}>
              <Feather name="star" size={15} color={C.pink} />
            </View>
            <Text style={styles.cardTitle}>Features</Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((f, i) => (
              <View key={i} style={[styles.featureBox, { backgroundColor: f.bg }]}>
                <View style={[styles.featureIcon, { backgroundColor: `${f.color}20` }]}>
                  <Feather name={f.icon} size={18} color={f.color} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── WARNING ── */}
        <View style={styles.warningCard}>
          <Feather name="alert-triangle" size={18} color={C.yellow} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Use Responsibly</Text>
            <Text style={styles.warningText}>
              Designed for emergency situations only. Avoid accidental triggers in daily use.
            </Text>
          </View>
        </View>

        {/* ── TIPS ── */}
        <View style={styles.tipsCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: C.yellowLight }]}>
              <Ionicons name="bulb-outline" size={15} color={C.yellow} />
            </View>
            <Text style={styles.cardTitle}>Pro Tips</Text>
          </View>
          {[
            'Keep your phone in an accessible location',
            'Test the feature regularly to ensure it works',
            'Make sure your trusted contacts are up to date',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Feather name="check-circle" size={15} color={C.green} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginTop:42,
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.text },

  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  /* ── Hero ── */
  heroSection: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 99, borderWidth: 1,
    marginBottom: 28,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },

  ringWrapper: {
    width: 160, height: 160,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: C.pink,
  },
  ring1: { width: 130, height: 130 },
  ring2: { width: 160, height: 160 },
  iconCircle: {
    width: 100, height: 100,
    borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },

  heroTitle: {
    fontSize: 20, fontWeight: '800', color: C.text,
    textAlign: 'center', marginBottom: 6,
  },
  heroSub: {
    fontSize: 13, color: C.textSub, textAlign: 'center',
    lineHeight: 19, paddingHorizontal: 8,
  },

  activateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 52, borderRadius: 14,
    shadowColor: C.pink, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38, shadowRadius: 14, elevation: 8,
  },
  activateBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  deactivateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 52, borderRadius: 14,
    backgroundColor: C.redLight,
    borderWidth: 1.5, borderColor: `${C.red}30`,
  },
  deactivateBtnText: { fontSize: 16, fontWeight: '700', color: C.red },

  /* ── Cards ── */
  card: {
    backgroundColor: C.surface,
    borderRadius: 20, padding: 18,
    marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardHeaderIcon: {
    width: 30, height: 30, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.text },

  /* Steps */
  stepsList: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: 14, minHeight: 52 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  stepLine: {
    flex: 1, width: 2,
    backgroundColor: `${C.pink}20`,
    marginVertical: 3,
  },
  stepContent: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, flex: 1, paddingBottom: 18,
  },
  stepIconBox: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center', alignItems: 'center',
  },
  stepLabel: { fontSize: 13, fontWeight: '600', color: C.text, flex: 1 },

  /* Features grid */
  featuresGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  featureBox: {
    width: '47%', borderRadius: 14,
    padding: 14, gap: 8,
  },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  featureLabel: { fontSize: 13, fontWeight: '700', color: C.text },
  featureDesc:  { fontSize: 11, color: C.textSub, fontWeight: '500', lineHeight: 15 },

  /* Warning */
  warningCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: C.yellowLight,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: `${C.yellow}40`,
    marginBottom: 16,
  },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 3 },
  warningText:  { fontSize: 12, color: '#78350F', fontWeight: '500', lineHeight: 17 },

  /* Tips */
  tipsCard: {
    backgroundColor: C.surface,
    borderRadius: 20, padding: 18,
    marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  tipText: { fontSize: 12, color: C.textSub, fontWeight: '600', flex: 1 },
})