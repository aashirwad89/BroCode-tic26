/* eslint-disable @typescript-eslint/array-type */
import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Dimensions, Animated,
  StatusBar, Modal, TouchableWithoutFeedback, Platform,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')
const DRAWER_WIDTH = 285

const C = {
  bg:           '#F8FAFC',
  bgLight:      '#F1F5F9',
  surface:      '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  pink:         '#EC4899',
  pinkLight:    '#F472B6',
  pinkDeep:     '#DB2777',
  pinkGhost:    '#FCE7F3',
  pinkBorder:   '#FBCFE8',
  text:         '#0F172A',
  textSub:      '#475569',
  textMuted:    '#64748B',
  red:          '#EF4444',
  redGhost:     '#FEE2E2',
  green:        '#10B981',
  greenGhost:   '#D1FAE5',
  blue:         '#3B82F6',
  blueGhost:    '#DBEAFE',
  yellow:       '#F59E0B',
  yellowGhost:  '#FEF3C7',
  border:       '#E2E8F0',
  shadow:       '#D63384',
}

const Home = () => {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── Drawer animation ──────────────────────────────────────────
  const drawerAnim  = useRef(new Animated.Value(-DRAWER_WIDTH)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  const openDrawer = () => {
    setDrawerOpen(true)
    Animated.parallel([
      Animated.spring(drawerAnim,  { toValue: 0,   useNativeDriver: true, friction: 8, tension: 60 }),
      Animated.timing(overlayAnim, { toValue: 1,   useNativeDriver: true, duration: 250 }),
    ]).start()
  }

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(drawerAnim,  { toValue: -DRAWER_WIDTH, useNativeDriver: true, duration: 220 }),
      Animated.timing(overlayAnim, { toValue: 0,             useNativeDriver: true, duration: 220 }),
    ]).start(() => setDrawerOpen(false))
  }

  // ── Entrance animations ───────────────────────────────────────
  const headerFade  = useRef(new Animated.Value(0)).current
  const headerSlide = useRef(new Animated.Value(-20)).current
  const card1Fade   = useRef(new Animated.Value(0)).current
  const card1Slide  = useRef(new Animated.Value(24)).current
  const card2Fade   = useRef(new Animated.Value(0)).current
  const card2Slide  = useRef(new Animated.Value(24)).current
  const card3Fade   = useRef(new Animated.Value(0)).current
  const card3Slide  = useRef(new Animated.Value(24)).current
  const iconPulse   = useRef(new Animated.Value(1)).current
  const scaleAnim   = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(headerFade,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card1Fade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(card1Slide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card2Fade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(card2Slide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card3Fade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(card3Slide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1.08, duration: 1400, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 1.00, duration: 1400, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  // ── Quotes ────────────────────────────────────────────────────
  const quotes = [
    { text: "Your safety is your priority. We're here to protect you every step.", emoji: '🛡️' },
    { text: 'Empowered women empower women. Stay strong, stay safe.',               emoji: '💜' },
    { text: 'Your voice matters. Your safety matters. You matter.',                 emoji: '✨' },
  ]
  const [quoteIndex, setQuoteIndex] = useState(0)
  const quoteSlide = useRef(new Animated.Value(0)).current
  const quoteFade  = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(quoteSlide, { toValue: -30, duration: 280, useNativeDriver: true }),
        Animated.timing(quoteFade,  { toValue: 0,   duration: 280, useNativeDriver: true }),
      ]).start(() => {
        setQuoteIndex(i => (i + 1) % quotes.length)
        quoteSlide.setValue(30)
        Animated.parallel([
          Animated.spring(quoteSlide, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
          Animated.timing(quoteFade,  { toValue: 1, duration: 280,             useNativeDriver: true }),
        ]).start()
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // ── Features ──────────────────────────────────────────────────
  const features = [
    { id: 1, title: 'Trusted Contacts', icon: 'heart' as const, color: C.red,    ghost: C.redGhost,       screen: 'contacts'       },
    { id: 2, title: 'Safety Tips', icon: 'lightbulb-on'  as const, color: C.red,    ghost: C.redGhost,       screen: 'safety'  },
    { id: 3, title: 'GPS Location',     icon: 'map-marker'   as const, color: C.green,  ghost: C.greenGhost,  count: 'Active', screen: 'location'       },
    { id: 4, title: 'Shake Detection',  icon: 'alert-circle' as const, color: C.yellow, ghost: C.yellowGhost, count: 'Ready',  screen: 'shakeDetection' },
  ]

  const navItems = [
    { id: 1, label: 'Home',             icon: 'home'         as const, onPress: () => { closeDrawer(); router.push('/home')    } },
    { id: 2, label: 'Recent Records',   icon: 'book'         as const, onPress: () => { closeDrawer(); router.push('/records') } },
    { id: 3, label: 'AI Assistant',     icon: 'robot'        as const, onPress: () => { closeDrawer(); router.push('/chat')    } },
    { id: 4, label: 'Safety Tips',      icon: 'shield-check' as const, onPress: () => { closeDrawer(); router.push('/safety')  } },
    { id: 5, label: 'Trusted Contacts', icon: 'heart'        as const, onPress: () => { closeDrawer(); router.push('/trusted') } },
  ]

  // ── Activate ──────────────────────────────────────────────────
  const handleActivate = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 90, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    friction: 5,  useNativeDriver: true }),
    ]).start()
    setIsActive(v => !v)
    Alert.alert(
      isActive ? '⛔ Deactivated' : '🛡️ Activated',
      isActive ? 'Safety mode is now OFF' : 'Safety mode is now ON. Stay safe!'
    )
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <SafeAreaView style={styles.safeArea}>

        {/* ── HEADER ── */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <MaterialCommunityIcons name="menu" size={24} color={C.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.appName}>ShadowSafe</Text>
            <Text style={styles.appTag}>AI</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <LinearGradient colors={[C.pinkLight, C.pink]} style={styles.profileGradient}>
              <MaterialCommunityIcons name="account" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── BODY ── */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Greeting */}
          <Animated.View style={{ opacity: card1Fade, transform: [{ translateY: card1Slide }] }}>
            <View style={styles.greetingCard}>
              <View style={styles.greetingTop}>
                <Animated.View style={{ transform: [{ scale: iconPulse }] }}>
                  <LinearGradient colors={[C.pinkLight, C.pink, C.pinkDeep]} style={styles.shieldIcon}>
                    <MaterialCommunityIcons name={isActive ? 'shield-check' : 'shield-alert'} size={28} color="#fff" />
                  </LinearGradient>
                </Animated.View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.greetTitle}> Hii 👋 ,  </Text>
                  <Text style={styles.greetSub}>Instant alerts and emergency protection.</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Quick Access */}
          <Animated.View style={{ opacity: card2Fade, transform: [{ translateY: card2Slide }] }}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.featureGrid}>
              {features.map(f => (
                <TouchableOpacity
                  key={f.id} style={styles.featureBox} activeOpacity={0.8}
                  onPress={() => {
                    if (f.screen === 'contacts')       router.push('/trusted')
                      else if(f.screen == 'safety')     router.push('/safety')
                    else if (f.screen === 'location')  router.push('/location')
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

          {/* Stats */}
          <Animated.View style={{ opacity: card2Fade, transform: [{ translateY: card2Slide }] }}>
            <View style={styles.statsCard}>
              {[{ number: '24/7', label: 'Protection' }, { number: '3', label: 'Contacts' }, { number: '100%', label: 'Private' }].map((s, i) => (
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

          {/* Quote */}
          <Animated.View style={{ opacity: card3Fade, transform: [{ translateY: card3Slide }] }}>
            <Text style={styles.sectionTitle}>💪 Stay Empowered</Text>
            <View style={styles.quoteCard}>
              <MaterialCommunityIcons name="format-quote-open" size={24} color={C.pink} />
              <Animated.View style={{ opacity: quoteFade, transform: [{ translateX: quoteSlide }] }}>
                <Text style={styles.quoteEmoji}>{quotes[quoteIndex].emoji}</Text>
                <Text style={styles.quoteText}>{quotes[quoteIndex].text}</Text>
              </Animated.View>
              <MaterialCommunityIcons name="format-quote-close" size={24} color={C.pink} style={{ alignSelf: 'flex-end' }} />
              <View style={styles.dotRow}>
                {quotes.map((_, i) => (
                  <View key={i} style={[styles.dot, i === quoteIndex && styles.dotActive]} />
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Help */}
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

      {/* ── DRAWER OVERLAY + PANEL (outside SafeAreaView — covers full screen) ── */}
      {drawerOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Dim overlay — tap to close */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
          </TouchableWithoutFeedback>

          {/* Drawer panel slides in from left */}
          <Animated.View style={[styles.drawerPanel, { transform: [{ translateX: drawerAnim }] }]}>

            {/* Drawer Header */}
            <LinearGradient colors={[C.pinkGhost, '#F9A8D4']} style={styles.drawerHeader}>
              <View style={styles.drawerAvatarRing}>
                <LinearGradient colors={[C.pinkLight, C.pink, C.pinkDeep]} style={styles.drawerAvatar}>
                  <MaterialCommunityIcons name="account" size={30} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.drawerName}>Hello 👋</Text>
              <Text style={styles.drawerSubtitle}>ShadowSafe · AI</Text>
            </LinearGradient>

            {/* Nav Items */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {navItems.map(item => (
                <TouchableOpacity key={item.id} style={styles.drawerItem} onPress={item.onPress}>
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
                { icon: 'file-document-outline' as const, label: 'Terms & Conditions', route: '/terms'   },
                { icon: 'lock-outline'          as const, label: 'Privacy Policy',      route: '/privacy' },
                { icon: 'information-outline'   as const, label: 'About Us',            route: '/about'   },
              ].map(f => (
                <TouchableOpacity
                  key={f.label} style={styles.footerItem}
                  onPress={() => { closeDrawer(); router.push(f.route as any) }}
                >
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
                    { text: 'Logout', style: 'destructive', onPress: () => { closeDrawer(); router.replace('/login') } },
                  ])
                }
              >
                <MaterialCommunityIcons name="logout" size={17} color={C.red} />
                <Text style={[styles.footerItemText, { color: C.red, fontWeight: '700' }]}>Logout</Text>
              </TouchableOpacity>

              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    marginTop: 43,
  },
  headerBtn:    { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  appName:      { fontSize: 18, fontWeight: '800', color: C.pink },
  appTag:       { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1 },
  profileBtn:   { marginLeft: 4 },
  profileGradient: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },

  greetingCard: {
    backgroundColor: C.surface, borderRadius: 24, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  greetingTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  shieldIcon: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  greetTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 5 },
  greetSub:   { fontSize: 12, color: C.textSub, lineHeight: 18 },
  activateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 8,
  },
  activateBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 12 },

  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  featureBox: {
    width: (width - 44) / 2, backgroundColor: C.surface,
    borderRadius: 20, padding: 16, alignItems: 'center',
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

  statsCard: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 8, marginBottom: 20,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: C.pink, marginBottom: 4 },
  statLabel:  { fontSize: 11, color: C.textSub, fontWeight: '600', textAlign: 'center' },
  statDivider:{ width: 1, backgroundColor: C.border, marginHorizontal: 4 },

  quoteCard: {
    backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 16,
    borderWidth: 1.5, borderColor: C.pinkBorder,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  quoteEmoji: { fontSize: 22, textAlign: 'center', marginBottom: 6 },
  quoteText:  { fontSize: 13, fontWeight: '600', color: C.text, textAlign: 'center', marginBottom: 10, lineHeight: 21 },
  dotRow:     { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: C.pinkBorder },
  dotActive:  { width: 18, backgroundColor: C.pink },

  helpCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    borderRadius: 20, padding: 16, marginBottom: 4,
    borderWidth: 1, borderColor: C.blueGhost,
  },
  helpIconWrap: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: C.blueGhost,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  helpTitle: { fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 3 },
  helpSub:   { fontSize: 11, color: C.textSub },

  // ── Drawer ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawerPanel: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: C.surface,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18, shadowRadius: 16, elevation: 16,
  },
  drawerHeader: {
    alignItems: 'center', paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  drawerAvatarRing: {
    padding: 3, borderRadius: 40,
    borderWidth: 2, borderColor: C.pinkBorder, marginBottom: 12,
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
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8,
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