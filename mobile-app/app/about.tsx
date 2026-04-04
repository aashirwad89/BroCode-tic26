import React, { useRef, useEffect } from 'react'
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Animated, StatusBar,
  Platform, Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

const C = {
  bg:       '#FFF8F0',
  dark:     '#0D0A06',
  surface:  '#FFFFFF',
  amber:    '#F59E0B',
  amberD:   '#D97706',
  amberG:   '#FEF3C7',
  rose:     '#F43F5E',
  roseG:    '#FFE4E6',
  teal:     '#0D9488',
  tealG:    '#CCFBF1',
  violet:   '#7C3AED',
  violetG:  '#EDE9FE',
  sky:      '#0EA5E9',
  skyG:     '#E0F2FE',
  text:     '#1C1917',
  textSub:  '#78716C',
  textMute: '#A8A29E',
  border:   '#E7E5E4',
}

// ── Story chapters ─────────────────────────────────────────────────────────
const STORY = [
  {
    chapter: 'Chapter 01',
    title:   'The Problem We Saw',
    icon:    'eye-outline' as const,
    color:   C.rose,
    ghost:   C.roseG,
    grad:    ['#F43F5E', '#FB7185'] as const,
    story:
      'Every 3 minutes, a woman in India faces a safety threat. We saw our friends, sisters, and mothers walk home with keys between their fingers — afraid. The fear was real. The solutions were not enough.',
  },
  {
    chapter: 'Chapter 02',
    title:   'The Spark',
    icon:    'bulb-outline' as const,
    color:   C.amber,
    ghost:   C.amberG,
    grad:    ['#F59E0B', '#FCD34D'] as const,
    story:
      'In 2024, a small team of engineers and designers came together with one question: what if your phone could be your guardian? Not just a phone — a silent protector that acts the moment you need help, without you having to do anything.',
  },
  {
    chapter: 'Chapter 03',
    title:   'What We Built',
    icon:    'construct-outline' as const,
    color:   C.teal,
    ghost:   C.tealG,
    grad:    ['#0D9488', '#2DD4BF'] as const,
    story:
      'We built ShadowSafe — an app that listens for a shake, finds your location, records your surroundings, and instantly alerts your trusted people via WhatsApp. Three shakes. That\'s all it takes. No unlocking. No dialing. Just shake.',
  },
  {
    chapter: 'Chapter 04',
    title:   'Our Mission',
    icon:    'shield-half-outline' as const,
    color:   C.violet,
    ghost:   C.violetG,
    grad:    ['#7C3AED', '#A78BFA'] as const,
    story:
      'We believe safety is a right, not a privilege. Our mission is to make every woman feel protected — whether she\'s walking to her car at night, travelling alone, or simply needs someone to know where she is.',
  },
  {
    chapter: 'Chapter 05',
    title:   'How It Works',
    icon:    'flash-outline' as const,
    color:   C.sky,
    ghost:   C.skyG,
    grad:    ['#0EA5E9', '#38BDF8'] as const,
    story:
      'Shake your phone 3 times → ShadowSafe detects it instantly → Grabs your GPS → Starts audio recording → Sends your location to all trusted contacts on WhatsApp — all within seconds. No internet needed for the shake. No unlock needed. Just shake.',
  },
  {
    chapter: 'Chapter 06',
    title:   'Privacy First',
    icon:    'lock-closed-outline' as const,
    color:   C.teal,
    ghost:   C.tealG,
    grad:    ['#0D9488', '#14B8A6'] as const,
    story:
      'We never track you in the background. We never sell your data. Location is shared only when you trigger SOS. Audio stays on your device. Your contacts are yours. Privacy isn\'t a feature — it\'s the foundation we built on.',
  },
  {
    chapter: 'Chapter 07',
    title:   'For Every Woman',
    icon:    'heart-outline' as const,
    color:   C.rose,
    ghost:   C.roseG,
    grad:    ['#F43F5E', '#FB923C'] as const,
    story:
      'ShadowSafe is for the college student heading home late. For the professional working night shifts. For the traveller exploring solo. For every daughter, sister, mother, and friend who deserves to feel safe — always.',
  },
]

// ── Stats ──────────────────────────────────────────────────────────────────
const STATS = [
  { value: '10K+', label: 'Women Protected',  icon: 'people-outline'       as const, color: C.rose   },
  { value: '3',    label: 'Seconds to Alert', icon: 'timer-outline'        as const, color: C.amber  },
  { value: '100%', label: 'Data Private',     icon: 'lock-closed-outline'  as const, color: C.teal   },
  { value: '24/7', label: 'Always On',        icon: 'shield-checkmark-outline' as const, color: C.violet },
]

// ── Team ───────────────────────────────────────────────────────────────────
const TEAM = [
  { name: 'Aarav Shah',   role: 'Founder & CEO',      emoji: '👨‍💻', color: C.violet },
  { name: 'Priya Nair',  role: 'Head of Safety UX',   emoji: '👩‍🎨', color: C.rose   },
  { name: 'Rohini Mehta', role: 'Lead Engineer',        emoji: '👨‍🔧', color: C.teal   },
  { name: 'Sneha Patel', role: 'Community & Outreach', emoji: '👩‍❤️‍👩', color: C.amber  },
]

// ── Story Card ─────────────────────────────────────────────────────────────
const StoryCard = ({ item, index }: { item: typeof STORY[0]; index: number }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, delay: index * 80, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.storyCard}>
        {/* Left accent bar */}
        <LinearGradient colors={item.grad} style={styles.accentBar} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />

        <View style={styles.storyContent}>
          {/* Chapter tag + icon */}
          <View style={styles.storyTop}>
            <View style={[styles.chapterTag, { backgroundColor: item.ghost }]}>
              <Ionicons name={item.icon} size={13} color={item.color} />
              <Text style={[styles.chapterText, { color: item.color }]}>{item.chapter}</Text>
            </View>
          </View>

          <Text style={styles.storyTitle}>{item.title}</Text>
          <Text style={styles.storyBody}>{item.story}</Text>
        </View>
      </View>
    </Animated.View>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
const About = () => {
  const router = useRouter()

  const headerFade  = useRef(new Animated.Value(0)).current
  const headerSlide = useRef(new Animated.Value(-24)).current
  const heroFade    = useRef(new Animated.Value(0)).current
  const heroScale   = useRef(new Animated.Value(0.92)).current

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerFade,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, friction: 8,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(heroScale, { toValue: 1, friction: 7,   useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* ── HEADER ── */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FCD34D" />
          </TouchableOpacity>
          <View style={styles.badgeRow}>
            <Ionicons name="shield-half-outline" size={22} color={C.amber} />
            <Text style={styles.appLabel}>ShadowSafe</Text>
          </View>
        </View>

        <Animated.View style={{ opacity: heroFade, transform: [{ scale: heroScale }] }}>
          <Text style={styles.heroTitle}>Our Story</Text>
          <Text style={styles.heroSub}>
            Built with love, driven by purpose — for every woman who deserves to feel safe.
          </Text>
        </Animated.View>

        {/* Mission pill */}
        <View style={styles.missionPill}>
          <Ionicons name="heart" size={14} color={C.rose} />
          <Text style={styles.missionText}>Safety is a right, not a privilege</Text>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── STATS GRID ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.labelDot} />
          <Text style={styles.labelText}>By the numbers</Text>
        </View>

        <View style={styles.statsGrid}>
          {STATS.map(s => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── STORY CARDS ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.labelDot} />
          <Text style={styles.labelText}>Our journey</Text>
        </View>

        {STORY.map((item, index) => (
          <StoryCard key={item.chapter} item={item} index={index} />
        ))}

        {/* ── TEAM ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.labelDot} />
          <Text style={styles.labelText}>The people behind ShadowSafe</Text>
        </View>

        <View style={styles.teamGrid}>
          {TEAM.map(member => (
            <View key={member.name} style={styles.teamCard}>
              <View style={[styles.teamAvatar, { backgroundColor: member.color + '18' }]}>
                <Text style={styles.teamEmoji}>{member.emoji}</Text>
              </View>
              <Text style={styles.teamName}>{member.name}</Text>
              <Text style={styles.teamRole}>{member.role}</Text>
            </View>
          ))}
        </View>

        {/* ── CLOSING CARD ── */}
        <LinearGradient
          colors={[C.dark, '#1C0A2E']}
          style={styles.closingCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.closingDeco} />
          <Ionicons name="shield-checkmark" size={36} color={C.amber} style={{ marginBottom: 14 }} />
          <Text style={styles.closingTitle}>Thank you for trusting us.</Text>
          <Text style={styles.closingBody}>
            Every time you use ShadowSafe, you remind us why we built it.
            Stay safe. Stay strong. You are never alone.
          </Text>
          <View style={styles.closingDivider} />
          <Text style={styles.closingTag}>— Team ShadowSafe 💛</Text>
        </LinearGradient>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

export default About

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    backgroundColor: C.dark,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingHorizontal: 24,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: C.amber, opacity: 0.07, top: -70, right: -70,
  },
  decoCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: C.rose, opacity: 0.06, top: 30, right: 60,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(252,211,77,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(252,211,77,0.25)',
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appLabel: {
    fontSize: 15, fontWeight: '700', color: C.amber,
    letterSpacing: 1.4, textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 42, fontWeight: '800', color: '#fff',
    letterSpacing: -1, marginBottom: 10,
  },
  heroSub: {
    fontSize: 14, color: 'rgba(255,255,255,0.55)',
    lineHeight: 22, marginBottom: 20, maxWidth: width * 0.82,
  },
  missionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(244,63,94,0.12)',
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.25)',
  },
  missionText: { fontSize: 12, fontWeight: '600', color: '#FDA4AF' },

  scroll: { paddingHorizontal: 16, paddingTop: 24 },

  // Section label
  sectionLabel: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 14, marginTop: 4,
  },
  labelDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },
  labelText: { fontSize: 12, fontWeight: '700', color: C.textSub, letterSpacing: 1, textTransform: 'uppercase' },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28,
  },
  statCard: {
    width: (width - 42) / 2,
    backgroundColor: C.surface, borderRadius: 18,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: C.textSub, fontWeight: '600', textAlign: 'center' },

  // Story card
  storyCard: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderRadius: 20, marginBottom: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  accentBar:    { width: 5 },
  storyContent: { flex: 1, padding: 18 },
  storyTop:     { marginBottom: 10 },
  chapterTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingVertical: 4,
    paddingHorizontal: 10, borderRadius: 20,
  },
  chapterText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  storyTitle:  { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 8, letterSpacing: -0.3 },
  storyBody:   { fontSize: 13, color: C.textSub, lineHeight: 21 },

  // Team
  teamGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28,
  },
  teamCard: {
    width: (width - 42) / 2, backgroundColor: C.surface,
    borderRadius: 18, padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  teamAvatar: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  teamEmoji: { fontSize: 26 },
  teamName:  { fontSize: 13, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 4 },
  teamRole:  { fontSize: 11, color: C.textSub, textAlign: 'center', lineHeight: 16 },

  // Closing card
  closingCard: {
    borderRadius: 24, padding: 28, alignItems: 'center',
    marginBottom: 8, overflow: 'hidden',
  },
  closingDeco: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: C.amber, opacity: 0.05, top: -60, right: -40,
  },
  closingTitle: {
    fontSize: 22, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 12, letterSpacing: -0.3,
  },
  closingBody: {
    fontSize: 14, color: 'rgba(255,255,255,0.55)',
    textAlign: 'center', lineHeight: 22, maxWidth: width * 0.78,
  },
  closingDivider: {
    width: 40, height: 1.5, backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 18,
  },
  closingTag: { fontSize: 14, fontWeight: '700', color: C.amber },
})