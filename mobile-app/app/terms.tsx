import React, { useState, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// ─── Data ────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: '01',
    icon: 'shield-checkmark-outline' as const,
    title: 'Acceptance of Terms',
    content:
      'By downloading, installing, or using ShadowSafe ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use the App. Your continued use constitutes acceptance of any updates to these terms.',
  },
  {
    id: '02',
    icon: 'person-outline' as const,
    title: 'Eligibility & Account',
    content:
      'You must be at least 13 years of age to use ShadowSafe. By creating an account, you confirm that all information you provide is accurate and current. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.',
  },
  {
    id: '03',
    icon: 'location-outline' as const,
    title: 'Location & Data Usage',
    content:
      'ShadowSafe requests access to your device\'s GPS location to provide core safety features including real-time location sharing and SOS alerts. Location data is transmitted only to your designated trusted contacts during an active SOS event. We do not sell or share your location data with third parties.',
  },
  {
    id: '04',
    icon: 'mic-outline' as const,
    title: 'Audio Recording',
    content:
      'The App may record audio when an SOS event is triggered via shake detection or manual activation. Audio recordings are stored locally on your device and are not uploaded to our servers without your explicit consent. You are responsible for complying with local laws regarding audio recording.',
  },
  {
    id: '05',
    icon: 'people-outline' as const,
    title: 'Trusted Contacts',
    content:
      'You are solely responsible for the phone numbers you add as trusted contacts. By adding a contact, you confirm you have their consent to receive emergency alerts, WhatsApp messages, and location information from ShadowSafe on your behalf during an SOS event.',
  },
  {
    id: '06',
    icon: 'notifications-outline' as const,
    title: 'Emergency Alerts',
    content:
      'ShadowSafe provides tools to assist personal safety but is NOT a substitute for emergency services. Always contact local emergency services (such as 112 or 100) in life-threatening situations. We do not guarantee the delivery or timeliness of alerts and accept no liability for failed notifications.',
  },
  {
    id: '07',
    icon: 'lock-closed-outline' as const,
    title: 'Privacy & Security',
    content:
      'We employ industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. Please review our Privacy Policy for full details on how we collect, use, and protect your personal information.',
  },
  {
    id: '08',
    icon: 'ban-outline' as const,
    title: 'Prohibited Use',
    content:
      'You agree not to misuse the App by triggering false SOS alerts, using the App for harassment, attempting to reverse-engineer or tamper with the App, or using it in any manner that violates applicable law. Violations may result in immediate account termination.',
  },
  {
    id: '09',
    icon: 'construct-outline' as const,
    title: 'Limitation of Liability',
    content:
      'ShadowSafe and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App. Our total liability to you for any claim shall not exceed the amount you paid for the App in the past twelve months.',
  },
  {
    id: '10',
    icon: 'refresh-outline' as const,
    title: 'Changes to Terms',
    content:
      'We reserve the right to update these Terms at any time. We will notify you of significant changes via in-app notification or email. Your continued use of ShadowSafe after changes are posted constitutes your acceptance of the revised Terms.',
  },
]

// ─── Accordion Item ──────────────────────────────────────────────
const AccordionItem = ({
  section,
  index,
}: {
  section: (typeof SECTIONS)[0]
  index: number
}) => {
  const [open, setOpen] = useState(false)
  const anim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  const toggle = () => {
    const toValue = open ? 0 : 1
    Animated.parallel([
      Animated.spring(anim, { toValue, useNativeDriver: false, speed: 18, bounciness: 4 }),
      Animated.timing(rotateAnim, { toValue, duration: 200, useNativeDriver: true }),
    ]).start()
    setOpen(!open)
  }

  const maxHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 400] })
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.5, 1] })
  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })

  return (
    <View style={[styles.card, open && styles.cardOpen]}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.75} style={styles.cardHeader}>
        {/* Number + Icon */}
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, open && styles.iconWrapActive]}>
            <Ionicons
              name={section.icon}
              size={18}
              color={open ? '#fff' : '#D94F7C'}
            />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.sectionNum}>{section.id}</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        </View>
        {/* Chevron */}
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={18} color="#D94F7C" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ maxHeight, overflow: 'hidden', opacity }}>
        <View style={styles.cardBody}>
          <View style={styles.divider} />
          <Text style={styles.bodyText}>{section.content}</Text>
        </View>
      </Animated.View>
    </View>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────
const Terms = () => {
  const scrollRef = useRef<ScrollView>(null)
  const [accepted, setAccepted] = useState(false)

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A12" />

      {/* Header */}
      <View style={styles.header}>
        {/* Decorative circles */}
        <View style={styles.deco1} />
        <View style={styles.deco2} />

        <View style={styles.headerTop}>
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-half-outline" size={28} color="#D94F7C" />
          </View>
          <Text style={styles.appName}>ShadowSafe</Text>
        </View>

        <Text style={styles.headerTitle}>Terms &{'\n'}Conditions</Text>
        <Text style={styles.headerSub}>Last updated · June 2025</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>10</Text>
            <Text style={styles.statLabel}>Sections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>~3 min</Text>
            <Text style={styles.statLabel}>Read time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>v2.1</Text>
            <Text style={styles.statLabel}>Version</Text>
          </View>
        </View>
      </View>

      {/* Intro banner */}
      <View style={styles.introBanner}>
        <Ionicons name="information-circle-outline" size={18} color="#D94F7C" />
        <Text style={styles.introText}>
          Please read all sections carefully before using the app.
        </Text>
      </View>

      {/* Accordion list */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section, index) => (
          <AccordionItem key={section.id} section={section} index={index} />
        ))}

        {/* Contact block */}
        <View style={styles.contactCard}>
          <Ionicons name="mail-outline" size={20} color="#D94F7C" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.contactTitle}>Questions about these terms?</Text>
            <Text style={styles.contactEmail}>support@shadowsafe.app</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Accept footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.acceptBtn, accepted && styles.acceptedBtn]}
          activeOpacity={0.85}
          onPress={() => setAccepted(!accepted)}
        >
          <Ionicons
            name={accepted ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={accepted ? '#fff' : '#D94F7C'}
          />
          <Text style={[styles.acceptText, accepted && styles.acceptedText]}>
            {accepted ? 'Terms Accepted!' : 'I Agree to the Terms & Conditions'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Terms

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7EFF3',
  },

  // Header
  header: {
    backgroundColor: '#1A0A12',
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingHorizontal: 24,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  deco1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#D94F7C',
    opacity: 0.08,
    top: -60,
    right: -60,
  },
  deco2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D94F7C',
    opacity: 0.06,
    top: 40,
    right: 80,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  shieldBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(217,79,124,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217,79,124,0.3)',
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D94F7C',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D94F7C',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Intro banner
  introBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(217,79,124,0.08)',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#D94F7C',
  },
  introText: {
    fontSize: 13,
    color: '#7A3350',
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Accordion card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDD9E6',
    overflow: 'hidden',
  },
  cardOpen: {
    borderColor: '#D94F7C',
    shadowColor: '#D94F7C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(217,79,124,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#D94F7C',
  },
  titleBlock: {
    flex: 1,
  },
  sectionNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D94F7C',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A0A12',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E0EA',
    marginBottom: 14,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  bodyText: {
    fontSize: 14,
    color: '#5A3348',
    lineHeight: 22,
    letterSpacing: 0.1,
  },

  // Contact card
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A0A12',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 3,
  },
  contactEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D94F7C',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7EFF3',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 20 : 34,
    borderTopWidth: 1,
    borderTopColor: '#EDD9E6',
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#D94F7C',
  },
  acceptedBtn: {
    backgroundColor: '#D94F7C',
    borderColor: '#D94F7C',
  },
  acceptText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D94F7C',
    letterSpacing: 0.2,
  },
  acceptedText: {
    color: '#fff',
  },
})