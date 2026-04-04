/* eslint-disable @typescript-eslint/array-type */
import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  DrawerLayoutAndroid,
  StatusBar,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

// ─── Design tokens — Light theme with pink accents ────────────────────────────
const C = {
  bg:            '#F8FAFC',   // Clean white/light gray background
  bgLight:       '#F1F5F9',
  surface:       '#FFFFFF',   // Pure white cards
  surfaceMuted:  '#F8FAFC',   // Very subtle light tint
  pink:          '#EC4899',   // Primary pink accent (unchanged)
  pinkLight:     '#F472B6',
  pinkDeep:      '#DB2777',
  pinkGhost:     '#FCE7F3',   // Pink for icons (unchanged)
  pinkBorder:    '#FBCFE8',   // Pink borders (unchanged)
  text:          '#0F172A',
  textSub:       '#475569',
  textMuted:     '#64748B',
  red:           '#EF4444',
  redGhost:      '#FEE2E2',
  green:         '#10B981',
  greenGhost:    '#D1FAE5',
  blue:          '#3B82F6',
  blueGhost:     '#DBEAFE',
  yellow:        '#F59E0B',
  yellowGhost:   '#FEF3C7',
  border:        '#E2E8F0',   // Light gray border
  shadow:        '#D63384',   // Pink shadow (unchanged)
}

const Home = () => {
  const router      = useRouter()
  const [isActive, setIsActive]   = useState(false)
  const [userName, setUserName]   = useState('User')
  const drawerRef   = useRef<DrawerLayoutAndroid>(null)

  // ── Animations ──────────────────────────────────────────────────────────
  const scaleAnim   = useRef(new Animated.Value(1)).current

  // Card stagger entrance
  const headerFade  = useRef(new Animated.Value(0)).current
  const headerSlide = useRef(new Animated.Value(-20)).current
  const card1Fade   = useRef(new Animated.Value(0)).current
  const card1Slide  = useRef(new Animated.Value(24)).current
  const card2Fade   = useRef(new Animated.Value(0)).current
  const card2Slide  = useRef(new Animated.Value(24)).current
  const card3Fade   = useRef(new Animated.Value(0)).current
  const card3Slide  = useRef(new Animated.Value(24)).current

  // Icon pulse
  const iconPulse   = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Stagger entrance
    Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(headerFade,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card1Fade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(card1Slide, { toValue: 0, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card2Fade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(card2Slide, { toValue: 0, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card3Fade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(card3Slide, { toValue: 0, friction: 9, useNativeDriver: true }),
      ]),
    ]).start()

    // Pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1.08, duration: 1400, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 1.00, duration: 1400, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  // ── Feature data ────────────────────────────────────────────────────────
  interface NavigationItem {
    id: number; label: string
    icon: keyof typeof MaterialCommunityIcons.glyphMap; screen: string
  }

  const navigationItems: NavigationItem[] = [
    { id: 1, label: 'Home',              icon: 'home',         screen: 'home' },
    { id: 2, label: 'Recent Records',    icon: 'book',         screen: 'records' },
    { id: 3, label: 'AI Assistant',      icon: 'robot',        screen: 'home' },
    { id: 4, label: 'Safety Tips',       icon: 'shield-check', screen: 'safety' },
    { id: 6, label: 'Trusted Contacts',  icon: 'heart',        screen: 'contacts' },
  ]

  const features: Array<{
    id: number; title: string
    icon: keyof typeof MaterialCommunityIcons.glyphMap
    color: string; ghost: string; count: string; screen: string
  }> = [
    { id: 1, title: 'Trusted Contacts', icon: 'heart',        color: C.red,    ghost: C.redGhost,    count: '3',      screen: 'contacts'       },
    { id: 3, title: 'GPS Location',     icon: 'map-marker',   color: C.green,  ghost: C.greenGhost,  count: 'Active', screen: 'location'       },
    { id: 4, title: 'Shake Detection',  icon: 'alert-circle', color: C.yellow, ghost: C.yellowGhost, count: 'Ready',  screen: 'shakeDetection' },
  ]

  const quotes = [
    { text: "Your safety is your priority. We're here to protect you every step.", emoji: '🛡️' },
    { text: 'Empowered women empower women. Stay strong, stay safe.',               emoji: '💜' },
    { text: 'Your voice matters. Your safety matters. You matter.',                 emoji: '✨' },
  ]
  const [quoteIndex, setQuoteIndex]   = useState(0)
  const quoteSlide = useRef(new Animated.Value(0)).current
  const quoteFade  = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const interval = setInterval(() => {
      // Slide out to left + fade
      Animated.parallel([
        Animated.timing(quoteSlide, { toValue: -30, duration: 280, useNativeDriver: true }),
        Animated.timing(quoteFade,  { toValue: 0,   duration: 280, useNativeDriver: true }),
      ]).start(() => {
        setQuoteIndex(i => (i + 1) % quotes.length)
        quoteSlide.setValue(30)   // reset to right
        // Slide in from right + fade in
        Animated.parallel([
          Animated.spring(quoteSlide, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
          Animated.timing(quoteFade,  { toValue: 1, duration: 280, useNativeDriver: true }),
        ]).start()
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // ── Activate handler ────────────────────────────────────────────────────
  const handleActivate = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 90, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5,   useNativeDriver: true }),
    ]).start()
    setIsActive(v => !v)
    Alert.alert(
      isActive ? '⛔ Deactivated' : '🛡️ Activated',
      isActive ? 'Safety mode is now OFF' : 'Safety mode is now ON. Stay safe!'
    )
  }

  // ── Drawer ──────────────────────────────────────────────────────────────
  const renderDrawer = () => (
    <View style={styles.drawer}>
      {/* Drawer header */}
      <LinearGradient colors={[C.pinkGhost, '#F9A8D4']} style={styles.drawerHeader}>
        <View style={styles.drawerAvatarRing}>
          <LinearGradient colors={[C.pinkLight, C.pink, C.pinkDeep]} style={styles.drawerAvatar}>
            <MaterialCommunityIcons name="account" size={30} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={styles.drawerName}>Hello 👋</Text>
        <Text style={styles.drawerSubtitle}>ShadowSafe · AI</Text>
      </LinearGradient>

      {/* Nav items */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.drawerItem}
            onPress={() => {
              drawerRef.current?.closeDrawer()
              if (item.screen === 'home')     router.push('/home')
              else if (item.screen === 'contacts') router.push('/trusted')
            }}
          >
            <View style={styles.drawerItemIcon}>
              <MaterialCommunityIcons name={item.icon} size={20} color={C.pink} />
            </View>
            <Text style={styles.drawerItemText}>{item.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={C.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        {[
          { icon: 'file-document-outline' as const, label: 'Terms & Conditions', onPress: () => Alert.alert('Terms & Conditions', 'Read our terms here') },
          { icon: 'lock-outline'          as const, label: 'Privacy Policy',      onPress: () => Alert.alert('Privacy Policy', 'Read our privacy policy here') },
          { icon: 'information-outline'   as const, label: 'About Us',            onPress: () => Alert.alert('About Us', 'Learn more about ShadowSafe AI') },
        ].map((f) => (
          <TouchableOpacity key={f.label} style={styles.footerItem} onPress={() => { drawerRef.current?.closeDrawer(); f.onPress() }}>
            <MaterialCommunityIcons name={f.icon} size={17} color={C.textSub} />
            <Text style={styles.footerItemText}>{f.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert('Logout', 'Are you sure?', [
              { text: 'Cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => { drawerRef.current?.closeDrawer(); router.replace('/login') } },
            ])
          }
        >
          <MaterialCommunityIcons name="logout" size={17} color={C.red} />
          <Text style={[styles.footerItemText, { color: C.red, fontWeight: '700' }]}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </View>
  )

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <DrawerLayoutAndroid ref={drawerRef} drawerWidth={285} drawerPosition="left" renderNavigationView={renderDrawer}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <SafeAreaView style={styles.safeArea}>

        {/* ── HEADER ── */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <TouchableOpacity onPress={() => drawerRef.current?.openDrawer()} style={styles.headerBtn}>
            <MaterialCommunityIcons name="menu" size={22} color={C.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.appName}>ShadowSafe</Text>
            <Text style={styles.appTag}>AI</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
              <LinearGradient colors={[C.pinkLight, C.pink]} style={styles.profileGradient}>
                <MaterialCommunityIcons name="account" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── SCROLL BODY ── */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >

          {/* ── GREETING CARD ── */}
          <Animated.View style={{ opacity: card1Fade, transform: [{ translateY: card1Slide }] }}>
            <View style={styles.greetingCard}>
              <View style={styles.greetingTop}>
                <Animated.View style={{ transform: [{ scale: iconPulse }] }}>
                  <LinearGradient colors={[C.pinkLight, C.pink, C.pinkDeep]} style={styles.shieldIcon}>
                    <MaterialCommunityIcons
                      name={isActive ? 'shield-check' : 'shield-alert'}
                      size={28} color="#fff"
                    />
                  </LinearGradient>
                </Animated.View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.greetTitle}>👋 Welcome back, {userName}!</Text>
                  <Text style={styles.greetSub}>
                    Activate safety mode for instant alerts and emergency protection.
                  </Text>
                </View>
              </View>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.activateBtn, { backgroundColor: isActive ? C.green : C.pink }]}
                  onPress={handleActivate}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons
                    name={isActive ? 'shield-check' : 'shield-alert'}
                    size={20} color="#fff"
                  />
                  <Text style={styles.activateBtnText}>
                    {isActive ? 'Safety Active' : 'Tap to Activate'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>

          {/* ── QUICK ACCESS ── */}
          <Animated.View style={{ opacity: card2Fade, transform: [{ translateY: card2Slide }] }}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.featureGrid}>
              {features.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={styles.featureBox}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (f.screen === 'contacts')       router.push('/trusted')
                    else if (f.screen === 'location')       router.push('/location')
                    else if (f.screen === 'shakeDetection') router.push('/shake')
                  }}
                >
                  <View style={[styles.featureIconWrap, { backgroundColor: f.ghost }]}>
                    <MaterialCommunityIcons name={f.icon} size={26} color={f.color} />
                  </View>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={[styles.featureCount, { color: f.color }]}>{f.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* ── STATS ── */}
          <Animated.View style={{ opacity: card2Fade, transform: [{ translateY: card2Slide }] }}>
            <View style={styles.statsCard}>
              {[
                { number: '24/7', label: 'Protection' },
                { number: '3',    label: 'Trusted Contacts' },
                { number: '100%', label: 'Private' },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && <View style={styles.statDivider} />}
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{s.number}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </Animated.View>

          {/* ── QUOTE ── */}
          <Animated.View style={{ opacity: card3Fade, transform: [{ translateY: card3Slide }] }}>
            <Text style={styles.sectionTitle}>💪 Stay Empowered</Text>
            <View style={styles.quoteCard}>
              <MaterialCommunityIcons name="format-quote-open" size={24} color={C.pink} />
              <Animated.View style={{ opacity: quoteFade, transform: [{ translateX: quoteSlide }] }}>
                <Text style={styles.quoteEmoji}>{quotes[quoteIndex].emoji}</Text>
                <Text style={styles.quoteText}>{quotes[quoteIndex].text}</Text>
              </Animated.View>
              <MaterialCommunityIcons name="format-quote-close" size={24} color={C.pink} style={{ alignSelf: 'flex-end' }} />
              {/* Dot indicators */}
              <View style={styles.dotRow}>
                {quotes.map((_, i) => (
                  <View key={i} style={[styles.dot, i === quoteIndex && styles.dotActive]} />
                ))}
              </View>
            </View>
          </Animated.View>

          {/* ── HELP ── */}
          <Animated.View style={{ opacity: card3Fade, transform: [{ translateY: card3Slide }] }}>
            <TouchableOpacity style={styles.helpCard} activeOpacity={0.85}>
              <View style={styles.helpIconWrap}>
                <MaterialCommunityIcons name="help-circle" size={22} color={C.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.helpTitle}>Need Help?</Text>
                <Text style={styles.helpSub}>Access safety guides and emergency resources</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={C.textMuted} />
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </DrawerLayoutAndroid>
  )
}

export default Home

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginTop:43,
  },
  headerBtn: { padding: 8, position: 'relative' },
  headerCenter: { flex: 1, alignItems: 'center' },
  appName: { fontSize: 18, fontWeight: '800', color: C.pink },
  appTag:  { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: C.red, width: 16, height: 16,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  notifText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  profileBtn: { marginLeft: 4 },
  profileGradient: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Scroll ──
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },

  // ── Greeting Card ──
  greetingCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  greetingTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  shieldIcon: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.pink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  greetTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 5 },
  greetSub:   { fontSize: 12, color: C.textSub, lineHeight: 18 },

  activateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 8,
    shadowColor: C.pink, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.38, shadowRadius: 10, elevation: 6,
  },
  activateBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  // ── Section title ──
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 12 },

  // ── Feature grid ──
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  featureBox: {
    width: (width - 44) / 2,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  featureIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  featureTitle: { fontSize: 12, fontWeight: '700', color: C.text, textAlign: 'center', marginBottom: 4 },
  featureCount: { fontSize: 11, fontWeight: '700' },

  // ── Stats ──
  statsCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: C.pink, marginBottom: 4 },
  statLabel:  { fontSize: 11, color: C.textSub, fontWeight: '600', textAlign: 'center' },
  statDivider:{ width: 1, backgroundColor: C.border, marginHorizontal: 4 },

  // ── Quote ──
  quoteCard: {
    backgroundColor: C.surface,
    borderRadius: 20, padding: 18, marginBottom: 16,
    borderWidth: 1.5, borderColor: C.pinkBorder,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  quoteEmoji: { fontSize: 22, textAlign: 'center', marginBottom: 6 },
  quoteText: {
    fontSize: 13, fontWeight: '600', color: C.text,
    textAlign: 'center', marginBottom: 10, lineHeight: 21,
  },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.pinkBorder,
  },
  dotActive: { width: 18, backgroundColor: C.pink },

  // ── Help ──
  helpCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 20, padding: 16, marginBottom: 4,
    borderWidth: 1, borderColor: C.blueGhost,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  helpIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.blueGhost,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  helpTitle: { fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 3 },
  helpSub:   { fontSize: 11, color: C.textSub },

  // ── Drawer ──
  drawer: { flex: 1, backgroundColor: C.surface },
  drawerHeader: {
    alignItems: 'center', paddingTop: 40, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  drawerAvatarRing: {
    padding: 3, borderRadius: 40,
    borderWidth: 2, borderColor: C.pinkBorder, marginBottom: 12,
    shadowColor: C.pink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  drawerAvatar: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  drawerName:     { fontSize: 17, fontWeight: '800', color: C.text },
  drawerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 4, fontWeight: '600' },

  drawerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 20, gap: 14,
  },
  drawerItemIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.pinkGhost,
    justifyContent: 'center', alignItems: 'center',
  },
  drawerItemText: { fontSize: 14, fontWeight: '600', color: C.text },

  drawerFooter: {
    paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  footerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 11, paddingHorizontal: 8, borderRadius: 10,
  },
  footerItemText: { fontSize: 13, fontWeight: '600', color: C.textSub },
  divider:        { height: 1, backgroundColor: C.border, marginVertical: 8 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 11, paddingHorizontal: 8, borderRadius: 10,
    backgroundColor: C.redGhost,
  },
  versionText: { fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 10, opacity: 0.7 },
})