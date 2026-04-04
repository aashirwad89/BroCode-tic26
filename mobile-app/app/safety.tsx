/* eslint-disable react/no-unescaped-entities */
import React, { useRef, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

// ============ COLORS (Light Theme + Pink Gradient) ============
const COLORS = {
  bg:          '#FFFFFF',
  bgSoft:      '#FFF5F7',
  surface:     '#FFFFFF',
  card:        '#FFFFFF',

  // Pink gradient palette
  pinkDeep:    '#E11D6A',
  pink:        '#F43F8E',
  pinkMid:     '#FB7EB8',
  pinkLight:   '#FFD6E8',
  pinkGhost:   '#FFF0F6',

  // Accents
  coral:       '#FF6B6B',
  amber:       '#F59E0B',
  amberGhost:  '#FEF3C7',
  blue:        '#3B82F6',
  blueGhost:   '#EFF6FF',
  green:       '#10B981',
  greenGhost:  '#ECFDF5',
  purple:      '#8B5CF6',
  purpleGhost: '#F5F3FF',

  // Text
  text:        '#1A1A2E',
  textSub:     '#4A4A6A',
  textMute:    '#9CA3AF',

  // Border & Shadow
  border:      '#F0E6ED',
  shadow:      '#E11D6A',
} as const

// ============ TYPES ============
interface EmergencyContact {
  id: number
  name: string
  number: string
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  color: string
  ghost: string
  description: string
}

interface Helpline {
  id: number
  name: string
  number: string
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  color: string
  ghost: string
  description: string
}

interface SafetyTip {
  id: number
  title: string
  description: string
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
}

interface ContactCardProps {
  item: EmergencyContact | Helpline
  isEmergency?: boolean
}

interface SafetyTipCardProps {
  item: SafetyTip
  index: number
}

// ============ EMERGENCY CONTACTS ============
const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 1,
    name: 'Police',
    number: '100',
    icon: 'police-badge',
    color: COLORS.blue,
    ghost: COLORS.blueGhost,
    description: 'Emergency police assistance',
  },
  {
    id: 2,
    name: 'Ambulance',
    number: '102',
    icon: 'hospital-box',
    color: COLORS.coral,
    ghost: '#FFF1F1',
    description: 'Medical emergency services',
  },
  {
    id: 3,
    name: 'Fire Service',
    number: '101',
    icon: 'fire-truck',
    color: COLORS.amber,
    ghost: COLORS.amberGhost,
    description: 'Fire emergency response',
  },
  {
    id: 4,
    name: 'Women Helpline',
    number: '1091',
    icon: 'heart',
    color: COLORS.pink,
    ghost: COLORS.pinkGhost,
    description: '24/7 women safety support',
  },
]

// ============ HELPLINES ============
const HELPLINES: Helpline[] = [
  {
    id: 1,
    name: 'PM Helpline',
    number: '1800-111-555',
    icon: 'phone-outline',
    color: COLORS.purple,
    ghost: COLORS.purpleGhost,
    description: 'National citizen service',
  },
  {
    id: 2,
    name: 'AADHAR Helpline',
    number: '1800-300-1947',
    icon: 'card-account-details',
    color: COLORS.green,
    ghost: COLORS.greenGhost,
    description: 'AADHAR related support',
  },
  {
    id: 3,
    name: 'Gender Helpline',
    number: '1800-233-3330',
    icon: 'phone-in-talk',
    color: COLORS.pinkDeep,
    ghost: COLORS.pinkGhost,
    description: 'Gender-based violence support',
  },
  {
    id: 4,
    name: 'Cyber Crime Helpline',
    number: '1930',
    icon: 'security',
    color: COLORS.blue,
    ghost: COLORS.blueGhost,
    description: 'Cyber safety assistance',
  },
]

// ============ SAFETY TIPS ============
const SAFETY_TIPS: SafetyTip[] = [
  {
    id: 1,
    title: 'Trust Your Instinct',
    description: 'If something feels wrong, it probably is. Leave the situation immediately.',
    icon: 'lightbulb-on',
  },
  {
    id: 2,
    title: 'Share Your Location',
    description: 'Always share your live location with trusted contacts when going out.',
    icon: 'map-marker',
  },
  {
    id: 3,
    title: 'Stay Connected',
    description: 'Keep your phone charged and maintain contact with friends/family.',
    icon: 'wifi-alert',
  },
  {
    id: 4,
    title: 'Know Your Rights',
    description: 'Be aware of your legal rights and resources available to you.',
    icon: 'scale-balance',
  },
  {
    id: 5,
    title: 'Plan Your Route',
    description: 'Always plan your route beforehand and let someone know.',
    icon: 'road-variant',
  },
  {
    id: 6,
    title: 'Keep Emergency Cash',
    description: 'Always carry some cash for emergencies when you are alone.',
    icon: 'cash',
  },
]

// ============ CONTACT CARD ============
const ContactCard: React.FC<ContactCardProps> = ({ item, isEmergency = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start()
  }
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start()
  }

  const handleCall = (): void => {
    const phoneNumber = item.number.replace(/\D/g, '')
    const url = `tel:${phoneNumber}`
    Linking.canOpenURL(url)
      .then((supported: boolean) => {
        if (supported) return Linking.openURL(url)
        else Alert.alert('Error', 'Cannot make phone calls on this device')
      })
      .catch(() => Alert.alert('Error', 'Failed to initiate call'))
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 12 }}>
      <TouchableOpacity
        onPress={handleCall}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.contactCard,
          isEmergency && {
            borderColor: `${item.color}30`,
            borderWidth: 1.5,
          },
        ]}
      >
        {/* Left color strip */}
        <View style={[styles.colorStrip, { backgroundColor: item.color }]} />

        <View style={styles.cardContent}>
          {/* Icon */}
          <View style={[styles.iconBox, { backgroundColor: item.ghost }]}>
            <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={[styles.contactNumber, { color: item.color }]}>{item.number}</Text>
            <Text style={styles.contactDesc}>{item.description}</Text>
          </View>

          {/* Call button */}
          <LinearGradient
            colors={[COLORS.pink, COLORS.pinkDeep]}
            style={styles.callButton}
          >
            <MaterialCommunityIcons name="phone" size={18} color="#fff" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ============ SAFETY TIP CARD ============
const SafetyTipCard: React.FC<SafetyTipCardProps> = ({ item, index }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(16)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 350, delay: index * 70, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, friction: 10, delay: index * 70, useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View style={[styles.tipCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.tipIcon}>
        <MaterialCommunityIcons name={item.icon} size={22} color={COLORS.pinkDeep} />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipDesc}>{item.description}</Text>
      </View>
    </Animated.View>
  )
}

// ============ MAIN COMPONENT ============
const Safety: React.FC = () => {
  const router = useRouter()
  const headerFade  = useRef(new Animated.Value(0)).current
  const headerSlide = useRef(new Animated.Value(-16)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 10,  useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <SafeAreaView style={styles.safeArea}>

        {/* ============ HEADER ============ */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Safety & Emergency</Text>
            <View style={styles.headerPill}>
              <View style={styles.headerPillDot} />
              <Text style={styles.headerPillText}>Always available</Text>
            </View>
          </View>

          <View style={{ width: 36 }} />
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ============ HERO BANNER ============ */}
          <LinearGradient
            colors={['#F43F8E', '#E11D6A', '#C2185B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            {/* Decorative circles */}
            <View style={[styles.heroBubble, { width: 180, height: 180, top: -60, right: -50, opacity: 0.12 }]} />
            <View style={[styles.heroBubble, { width: 100, height: 100, bottom: -30, left: -20, opacity: 0.10 }]} />

            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="shield-check" size={32} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>In Case of Emergency</Text>
            <Text style={styles.heroSub}>
              Tap any contact to call instantly. All numbers are direct.
            </Text>

            {/* Quick stats row */}
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>24/7</Text>
                <Text style={styles.heroStatLabel}>Available</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>Free</Text>
                <Text style={styles.heroStatLabel}>All calls</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>Fast</Text>
                <Text style={styles.heroStatLabel}>Response</Text>
              </View>
            </View>
          </LinearGradient>

          {/* ============ EMERGENCY CONTACTS ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={[COLORS.pink, COLORS.pinkDeep]} style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Emergency Services</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{EMERGENCY_CONTACTS.length}</Text>
              </View>
            </View>
            {EMERGENCY_CONTACTS.map((c) => <ContactCard key={c.id} item={c} isEmergency />)}
          </View>

          {/* ============ HELPLINES ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={[COLORS.pink, COLORS.pinkDeep]} style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Helplines & Support</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{HELPLINES.length}</Text>
              </View>
            </View>
            {HELPLINES.map((h) => <ContactCard key={h.id} item={h} />)}
          </View>

          {/* ============ SAFETY TIPS ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={[COLORS.pink, COLORS.pinkDeep]} style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Safety Tips</Text>
            </View>
            {SAFETY_TIPS.map((tip, i) => <SafetyTipCard key={tip.id} item={tip} index={i} />)}
          </View>

          {/* ============ INFO CARD ============ */}
          <LinearGradient
            colors={[COLORS.pinkGhost, '#FFF8FA']}
            style={styles.infoCard}
          >
            <MaterialCommunityIcons name="heart-circle" size={28} color={COLORS.pink} style={{ marginBottom: 10 }} />
            <Text style={styles.infoTitle}>You Are Never Alone</Text>
            <Text style={styles.infoText}>
              Help is always available. Don't hesitate to reach out to authorities
              or trusted contacts. Your safety and well-being are the priority.
            </Text>
          </LinearGradient>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

export default Safety

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── HEADER ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 43,          // ✅ marginTop 43 as requested
    paddingBottom: 14,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.pinkGhost,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
  },

  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },

  headerPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },

  headerPillText: {
    fontSize: 10,
    color: COLORS.green,
    fontWeight: '600',
  },

  // ── SCROLL ────────────────────────────────────────────────
  scroll: { flex: 1, backgroundColor: COLORS.bgSoft },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },

  // ── HERO BANNER ───────────────────────────────────────────
  heroBanner: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },

  heroBubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#fff',
  },

  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },

  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },

  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 0,
  },

  heroStat: {
    flex: 1,
    alignItems: 'center',
  },

  heroStatNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },

  heroStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '500',
  },

  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },

  // ── SECTION ───────────────────────────────────────────────
  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  sectionBadge: {
    backgroundColor: COLORS.pinkLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.pinkDeep,
  },

  // ── CONTACT CARD ──────────────────────────────────────────
  contactCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#E11D6A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  colorStrip: {
    width: 4,
    borderRadius: 2,
    margin: 12,
    marginRight: 0,
  },

  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardInfo: {
    flex: 1,
  },

  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },

  contactNumber: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },

  contactDesc: {
    fontSize: 11,
    color: COLORS.textMute,
    lineHeight: 15,
  },

  callButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── SAFETY TIP CARD ───────────────────────────────────────
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.pinkGhost,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tipContent: { flex: 1 },

  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  tipDesc: {
    fontSize: 11,
    color: COLORS.textSub,
    lineHeight: 16,
  },

  // ── INFO CARD ─────────────────────────────────────────────
  infoCard: {
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.pinkLight,
    marginBottom: 10,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },

  infoText: {
    fontSize: 12,
    color: COLORS.textSub,
    lineHeight: 20,
    textAlign: 'center',
  },
})