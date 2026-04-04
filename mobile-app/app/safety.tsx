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

// ============ COLORS (Dark Theme) ============
const COLORS = {
  dark: '#0D0A06',
  darkCard: '#1A1410',
  surface: '#2A2420',
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  red: '#F43F5E',
  redGhost: '#FFE4E6',
  green: '#10B981',
  greenGhost: '#D1FAE5',
  amber: '#F59E0B',
  amberGhost: '#FEF3C7',
  blue: '#0EA5E9',
  blueGhost: '#E0F2FE',
  text: '#F5F5F0',
  textSub: '#D4CEC3',
  textMute: '#A8A29E',
  border: '#3E3A35',
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
    color: COLORS.red,
    ghost: COLORS.redGhost,
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
    color: COLORS.red,
    ghost: COLORS.redGhost,
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
    ghost: `${COLORS.purple}20`,
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
    color: COLORS.red,
    ghost: COLORS.redGhost,
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
  const handleCall = (): void => {
    const phoneNumber = item.number.replace(/\D/g, '')
    const url = `tel:${phoneNumber}`

    Linking.canOpenURL(url)
      .then((supported: boolean) => {
        if (supported) {
          return Linking.openURL(url)
        } else {
          Alert.alert('Error', 'Cannot make phone calls on this device')
        }
      })
      .catch((err: Error) => {
        console.error('Error:', err)
        Alert.alert('Error', 'Failed to initiate call')
      })
  }

  return (
    <TouchableOpacity
      style={[
        styles.contactCard,
        isEmergency && styles.emergencyCard,
      ]}
      onPress={handleCall}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[item.ghost, `${item.color}15`]}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
            <MaterialCommunityIcons
              name={item.icon}
              size={28}
              color={item.color}
            />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactNumber}>{item.number}</Text>
            <Text style={styles.contactDesc}>{item.description}</Text>
          </View>

          <View style={styles.callButton}>
            <MaterialCommunityIcons
              name="phone"
              size={20}
              color="#fff"
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

// ============ SAFETY TIP CARD ============
const SafetyTipCard: React.FC<SafetyTipCardProps> = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start()
  }, [index, fadeAnim, slideAnim])

  return (
    <Animated.View
      style={[
        styles.tipCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.tipIcon}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={COLORS.purple}
        />
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

  const headerFade = useRef(new Animated.Value(0)).current
  const headerSlide = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start()
  }, [headerFade, headerSlide])

  const handleBackPress = (): void => {
    router.back()
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <SafeAreaView style={styles.safeArea}>
        {/* ============ HEADER ============ */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFade,
              transform: [{ translateY: headerSlide }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety & Emergency</Text>
          <View style={{ width: 28 }} />
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ============ HERO ALERT ============ */}
          <LinearGradient
            colors={[COLORS.red, '#E11D48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroAlert}
          >
            <View style={styles.heroDeco} />
            <MaterialCommunityIcons
              name="alert-circle"
              size={40}
              color="#fff"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.heroTitle}>In Case of Emergency</Text>
            <Text style={styles.heroSub}>
              Tap any contact below to call immediately. All calls are direct.
            </Text>
          </LinearGradient>

          {/* ============ EMERGENCY CONTACTS ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Emergency Services</Text>
            </View>

            {EMERGENCY_CONTACTS.map((contact) => (
              <ContactCard
                key={contact.id}
                item={contact}
                isEmergency={true}
              />
            ))}
          </View>

          {/* ============ HELPLINES ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Helplines & Support</Text>
            </View>

            {HELPLINES.map((helpline) => (
              <ContactCard key={helpline.id} item={helpline} />
            ))}
          </View>

          {/* ============ SAFETY TIPS ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Safety Tips</Text>
            </View>

            {SAFETY_TIPS.map((tip, index) => (
              <SafetyTipCard key={tip.id} item={tip} index={index} />
            ))}
          </View>

          {/* ============ INFO CARD ============ */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={COLORS.blue}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.infoTitle}>Always Remember</Text>
            <Text style={styles.infoText}>
              You are never alone. Help is always available. Don't hesitate to
              reach out to authorities or trusted contacts. Your safety and
              well-being are the priority.
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

export default Safety

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  // ============ HEADER ============
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.darkCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backBtn: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  // ============ SCROLL ============
  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },

  // ============ HERO ALERT ============
  heroAlert: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },

  heroDeco: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -60,
    right: -40,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },

  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ============ SECTION ============
  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.amber,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSub,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ============ CONTACT CARD ============
  contactCard: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
  },

  emergencyCard: {
    borderWidth: 1.5,
    borderColor: `${COLORS.red}40`,
  },

  cardGradient: {
    padding: 0,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },

  iconBox: {
    width: 48,
    height: 48,
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
    marginBottom: 4,
  },

  contactNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.purple,
    marginBottom: 4,
  },

  contactDesc: {
    fontSize: 11,
    color: COLORS.textMute,
  },

  callButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============ SAFETY TIP CARD ============
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },

  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tipContent: {
    flex: 1,
  },

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

  // ============ INFO CARD ============
  infoCard: {
    backgroundColor: `${COLORS.blueGhost}20`,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.blue}40`,
    marginBottom: 16,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },

  infoText: {
    fontSize: 12,
    color: COLORS.textSub,
    lineHeight: 20,
    textAlign: 'center',
  },
})