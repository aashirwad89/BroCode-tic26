import React, { useState, useRef } from 'react'
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Animated, StatusBar, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const SECTIONS = [
  {
    id: '01',
    icon: 'person-outline' as const,
    title: 'Information We Collect',
    content:
      'We collect information you provide directly: your name, phone number, and emergency contacts. We also collect device data such as accelerometer readings (for shake detection), GPS coordinates during SOS events, and microphone audio when an SOS is triggered. We do not collect data in the background unless an SOS event is active.',
  },
  {
    id: '02',
    icon: 'location-outline' as const,
    title: 'Location Data',
    content:
      'ShadowSafe accesses your precise GPS location only when an SOS event is triggered. Location coordinates are shared exclusively with your trusted contacts via WhatsApp message. We do not store your location history on our servers. Location access stops as soon as the SOS event ends.',
  },
  {
    id: '03',
    icon: 'mic-outline' as const,
    title: 'Audio Recording',
    content:
      'Audio recording is initiated only upon an SOS trigger (shake detection or manual activation). Recordings are stored locally on your device for up to 30 seconds. Audio files are not uploaded to our servers without your explicit action. You may delete recordings at any time from your device storage.',
  },
  {
    id: '04',
    icon: 'people-outline' as const,
    title: 'Trusted Contacts',
    content:
      'Contact names and phone numbers you add are stored securely in our database and linked to your account. This data is used solely to send SOS alerts on your behalf. We do not share your contacts list with any third party or use it for marketing purposes.',
  },
  {
    id: '05',
    icon: 'share-social-outline' as const,
    title: 'How We Share Data',
    content:
      'We do not sell, rent, or trade your personal information. Your data is shared only with your designated trusted contacts during an active SOS event. We may share data with law enforcement if required by applicable law or to protect safety. All third-party services we use are bound by strict data protection agreements.',
  },
  {
    id: '06',
    icon: 'lock-closed-outline' as const,
    title: 'Data Security',
    content:
      'We use industry-standard encryption (TLS/HTTPS) for all data transmitted between the app and our servers. Passwords are hashed using bcrypt. We conduct regular security audits. However, no system is completely secure — please use a strong password and keep your app updated.',
  },
  {
    id: '07',
    icon: 'time-outline' as const,
    title: 'Data Retention',
    content:
      'Account data is retained for as long as your account is active. SOS event logs are kept for 90 days for your review, after which they are permanently deleted. Audio recordings on our servers (if uploaded by you) are deleted after 30 days. You may request immediate deletion at any time.',
  },
  {
    id: '08',
    icon: 'phone-portrait-outline' as const,
    title: 'Your Rights',
    content:
      'You have the right to access, correct, or delete your personal data at any time. You may export your data in a machine-readable format. You can withdraw consent for data processing by deleting your account. To exercise any of these rights, contact us at privacy@ShadowSafe.app.',
  },
  {
    id: '09',
    icon: 'globe-outline' as const,
    title: 'Cookies & Analytics',
    content:
      'The ShadowSafe mobile app does not use browser cookies. We use anonymous crash reporting (via Expo) to improve app stability. These reports contain no personally identifiable information. You may opt out of analytics in the app settings at any time.',
  },
  {
    id: '10',
    icon: 'refresh-outline' as const,
    title: 'Policy Updates',
    content:
      'We may update this Privacy Policy from time to time. We will notify you of significant changes via in-app notification at least 7 days before the changes take effect. Continued use of ShadowSafe after changes take effect constitutes acceptance of the revised policy.',
  },
]

const AccordionItem = ({ section }: { section: typeof SECTIONS[0] }) => {
  const [open, setOpen] = useState(false)
  const anim      = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  const toggle = () => {
    const toValue = open ? 0 : 1
    Animated.parallel([
      Animated.spring(anim,       { toValue, useNativeDriver: false, speed: 18, bounciness: 4 }),
      Animated.timing(rotateAnim, { toValue, duration: 200, useNativeDriver: true }),
    ]).start()
    setOpen(!open)
  }

  const maxHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 420] })
  const opacity   = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.5, 1] })
  const rotate    = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })

  return (
    <View style={[styles.card, open && styles.cardOpen]}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.75} style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, open && styles.iconWrapActive]}>
            <Ionicons name={section.icon} size={18} color={open ? '#fff' : '#7C3AED'} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.sectionNum}>{section.id}</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={18} color="#7C3AED" />
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

const Privacy = () => {
  const router = useRouter()

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0A1A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.deco1} />
        <View style={styles.deco2} />

        {/* Back button + app name */}
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#A78BFA" />
          </TouchableOpacity>
          <View style={styles.shieldBadge}>
            <Ionicons name="lock-closed-outline" size={22} color="#7C3AED" />
          </View>
          <Text style={styles.appName}>ShadowSafe</Text>
        </View>

        <Text style={styles.headerTitle}>Privacy{'\n'}Policy</Text>
        <Text style={styles.headerSub}>Last updated · June 2025</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>10</Text>
            <Text style={styles.statLabel}>Sections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>~4 min</Text>
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
        <Ionicons name="shield-checkmark-outline" size={18} color="#7C3AED" />
        <Text style={styles.introText}>
          Your data stays private. We never sell your information.
        </Text>
      </View>

      {/* Accordion */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map(section => (
          <AccordionItem key={section.id} section={section} />
        ))}

        {/* Contact block */}
        <View style={styles.contactCard}>
          <Ionicons name="mail-outline" size={20} color="#7C3AED" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.contactTitle}>Privacy concerns or data requests?</Text>
            <Text style={styles.contactEmail}>privacy@shadowsafe.app</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

export default Privacy

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F3FF' },

  // Header
  header: {
    backgroundColor: '#0F0A1A',
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingHorizontal: 24,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  deco1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#7C3AED', opacity: 0.1, top: -60, right: -60,
  },
  deco2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#7C3AED', opacity: 0.07, top: 40, right: 80,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 20, gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(167,139,250,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)',
    marginRight: 4,
  },
  shieldBadge: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)',
  },
  appName: {
    fontSize: 15, fontWeight: '600', color: '#A78BFA',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 38, fontWeight: '800', color: '#fff',
    lineHeight: 44, letterSpacing: -0.5, marginBottom: 6,
  },
  headerSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)',
    marginBottom: 24, letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statNum:    { fontSize: 16, fontWeight: '700', color: '#A78BFA', marginBottom: 2 },
  statLabel:  { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.3 },
  statDivider:{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Banner
  introBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(124,58,237,0.08)',
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#7C3AED',
  },
  introText: {
    fontSize: 13, color: '#5B21B6', flex: 1, lineHeight: 18, fontWeight: '500',
  },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#EDE9FE', overflow: 'hidden',
  },
  cardOpen: {
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 16,
  },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: '#7C3AED' },
  titleBlock:     { flex: 1 },
  sectionNum: {
    fontSize: 10, fontWeight: '700', color: '#7C3AED',
    letterSpacing: 1.2, marginBottom: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A0A12', letterSpacing: -0.2 },

  divider:  { height: 1, backgroundColor: '#EDE9FE', marginBottom: 14 },
  cardBody: { paddingHorizontal: 16, paddingBottom: 18 },
  bodyText: { fontSize: 14, color: '#4C1D95', lineHeight: 22, letterSpacing: 0.1 },

  // Contact
  contactCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F0A1A', borderRadius: 16, padding: 18, marginTop: 8,
  },
  contactTitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 3 },
  contactEmail: { fontSize: 15, fontWeight: '700', color: '#A78BFA' },
})