import React, { useState, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  StatusBar,
  Animated,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { LinearGradient } from 'expo-linear-gradient'

// ─── Design tokens — same as Login & Home ────────────────────────────────────
const C = {
  bg:           '#FFFFFF',
  bgGradStart:  '#FCE4EC',
  bgGradMid:    '#F8BBD0',
  surface:      '#FFFFFF',
  pink:         '#EC4899',
  pinkLight:    '#F472B6',
  pinkDeep:     '#DB2777',
  pinkGhost:    '#FCE7F3',
  pinkBorder:   '#FBCFE8',
  text:         '#111827',
  textSub:      '#6B7280',
  textMuted:    '#9CA3AF',
  red:          '#EF4444',
  redGhost:     '#FEE2E2',
  green:        '#10B981',
  greenGhost:   '#D1FAE5',
  border:       '#FBCFE8',
  shadow:       '#D63384',
}

// ─── Avatar options ───────────────────────────────────────────────────────────
const AVATAR_OPTIONS = [
  { id: 1,  icon: 'account-circle',  name: 'Circle'    },
  { id: 2,  icon: 'account',         name: 'Account'   },
  { id: 3,  icon: 'face-man',        name: 'Man'       },
  { id: 4,  icon: 'face-woman',      name: 'Woman'     },
  { id: 5,  icon: 'dumbbell',        name: 'Dumbbell'  },
  { id: 6,  icon: 'soccer',          name: 'Soccer'    },
  { id: 7,  icon: 'basketball',      name: 'Basketball'},
  { id: 8,  icon: 'music',           name: 'Music'     },
  { id: 9,  icon: 'heart',           name: 'Heart'     },
  { id: 10, icon: 'star',            name: 'Star'      },
  { id: 11, icon: 'lightning-bolt',  name: 'Lightning' },
  { id: 12, icon: 'shield-check',    name: 'Shield'    },
]

interface UserDataType { phone: string; avatar: string }

const Profile = () => {
  const router = useRouter()
  const [loading, setLoading]       = useState(true)
  const [userData, setUserData]     = useState<UserDataType>({ phone: '', avatar: 'account-circle' })
  const [modalVisible, setModalVisible] = useState(false)

  // ── Entrance animations ──────────────────────────────────────────────────
  const headerFade  = useRef(new Animated.Value(0)).current
  const headerSlide = useRef(new Animated.Value(-16)).current
  const avatarScale = useRef(new Animated.Value(0.85)).current
  const avatarFade  = useRef(new Animated.Value(0)).current
  const cardFade    = useRef(new Animated.Value(0)).current
  const cardSlide   = useRef(new Animated.Value(24)).current
  // Avatar ring pulse
  const ringPulse   = useRef(new Animated.Value(1)).current

  const runEntrance = () => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(headerFade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(avatarFade,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(avatarScale, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
    ]).start()

    // Pulse ring loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1.06, duration: 1300, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 1.00, duration: 1300, useNativeDriver: true }),
      ])
    ).start()
  }

  // ── Load data ────────────────────────────────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      loadUserData()
    }, [])
  )

  const loadUserData = async () => {
    try {
      setLoading(true)
      const storedPhone    = await SecureStore.getItemAsync('userPhone')
      const storedUserData = await SecureStore.getItemAsync('userData')
      let phone  = storedPhone || ''
      let avatar = 'account-circle'
      if (storedUserData) {
        try {
          const parsed = JSON.parse(storedUserData) as UserDataType
          avatar = parsed.avatar || 'account-circle'
        } catch (_) {}
      }
      setUserData({ phone, avatar })
    } catch {
      Alert.alert('Error', 'Failed to load profile data')
    } finally {
      setLoading(false)
      runEntrance()
    }
  }

  // ── Save avatar ──────────────────────────────────────────────────────────
  const handleSelectAvatar = async (iconName: string) => {
    try {
      const newData: UserDataType = { phone: userData.phone, avatar: iconName }
      await SecureStore.setItemAsync('userData', JSON.stringify(newData))
      setUserData(newData)
      setModalVisible(false)
      Alert.alert('✅ Success', 'Avatar updated successfully!')
    } catch {
      Alert.alert('❌ Error', 'Failed to update avatar. Please try again.')
    }
  }

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          try {
            await Promise.all([
              SecureStore.deleteItemAsync('userData'),
              SecureStore.deleteItemAsync('userPhone'),
              SecureStore.deleteItemAsync('authToken'),
              SecureStore.deleteItemAsync('isVerified'),
            ])
            router.replace('/login')
          } catch {
            Alert.alert('❌ Error', 'Failed to logout')
          }
        },
      },
    ])
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── HEADER ── */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* ── BODY ── */}
      <LinearGradient colors={[C.bg, C.bgGradStart, C.bgGradMid, C.bgGradStart, C.bg]} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={C.pink} />
              <Text style={styles.loadingText}>Loading profile…</Text>
            </View>
          ) : (
            <>
              {/* ── AVATAR ── */}
              <Animated.View style={[styles.avatarSection, { opacity: avatarFade, transform: [{ scale: avatarScale }] }]}>
                <Animated.View style={{ transform: [{ scale: ringPulse }] }}>
                  <TouchableOpacity
                    style={styles.avatarRing}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[C.pinkLight, C.pink, C.pinkDeep]}
                      style={styles.avatarGradient}
                    >
                      <MaterialCommunityIcons
                        name={userData.avatar as any}
                        size={64}
                        color="#fff"
                      />
                    </LinearGradient>

                    {/* Edit badge */}
                    <View style={styles.editBadge}>
                      <LinearGradient colors={[C.pinkLight, C.pinkDeep]} style={styles.editBadgeInner}>
                        <MaterialCommunityIcons name="pencil" size={13} color="#fff" />
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
                <Text style={styles.avatarLabel}>Tap to change avatar</Text>
              </Animated.View>

              {/* ── INFO CARD ── */}
              <Animated.View style={{ opacity: cardFade, transform: [{ translateY: cardSlide }] }}>

                {/* Phone number */}
                <View style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={styles.cardIconWrap}>
                      <MaterialCommunityIcons name="phone" size={22} color={C.pink} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardLabel}>Phone Number</Text>
                      <Text style={styles.cardValue}>
                        {userData.phone ? `+91 ${userData.phone}` : 'Not registered'}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={C.textMuted} />
                  </View>
                </View>

                {/* Secure storage info */}
                <View style={styles.secureCard}>
                  <View style={styles.secureHeader}>
                    <MaterialCommunityIcons name="shield-lock" size={18} color={C.pink} />
                    <Text style={styles.secureTitle}>Secure Storage</Text>
                  </View>
                  <View style={styles.secureRow}>
                    <Text style={styles.secureKey}>Phone</Text>
                    <Text style={styles.secureVal}>{userData.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.secureDivider} />
                  <View style={styles.secureRow}>
                    <Text style={styles.secureKey}>Avatar</Text>
                    <Text style={styles.secureVal}>{userData.avatar}</Text>
                  </View>
                  <Text style={styles.secureNote}>🔒 Data is encrypted and stored securely on device</Text>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                  <View style={styles.logoutIcon}>
                    <MaterialCommunityIcons name="logout" size={18} color={C.red} />
                  </View>
                  <Text style={styles.logoutText}>Logout</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={C.red} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

              </Animated.View>
              <View style={{ height: 32 }} />
            </>
          )}
        </ScrollView>
      </LinearGradient>

      {/* ── AVATAR MODAL ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Sheet handle */}
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={C.textSub} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={AVATAR_OPTIONS}
              numColumns={4}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled
              contentContainerStyle={styles.avatarGrid}
              renderItem={({ item }) => {
                const active = userData.avatar === item.icon
                return (
                  <TouchableOpacity
                    style={[styles.avatarOption, active && styles.avatarOptionActive]}
                    onPress={() => handleSelectAvatar(item.icon)}
                    activeOpacity={0.75}
                  >
                    {active ? (
                      <LinearGradient colors={[C.pinkLight, C.pink]} style={styles.avatarOptionGrad}>
                        <MaterialCommunityIcons name={item.icon as any} size={34} color="#fff" />
                      </LinearGradient>
                    ) : (
                      <MaterialCommunityIcons name={item.icon as any} size={34} color={C.textMuted} />
                    )}
                    {active && (
                      <View style={styles.checkmark}>
                        <MaterialCommunityIcons name="check" size={11} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default Profile

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginTop:42,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.pinkGhost,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.pink },

  // ── Scroll ──
  scroll: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 20 },

  // ── Loading ──
  loadingBox: { paddingVertical: 120, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 13, color: C.textSub, marginTop: 12, fontWeight: '500' },

  // ── Avatar ──
  avatarSection: { alignItems: 'center', marginBottom: 36 },
  avatarRing: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 3, borderColor: C.pinkBorder,
    padding: 4,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  avatarGradient: {
    flex: 1, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
  },
  editBadge: {
    position: 'absolute', bottom: 4, right: 4,
    borderWidth: 2, borderColor: C.bg,
    borderRadius: 16,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  editBadgeInner: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLabel: { fontSize: 13, color: C.textSub, fontWeight: '600', marginTop: 12 },

  // ── Cards ──
  card: {
    backgroundColor: C.surface,
    borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardIconWrap: {
    width: 46, height: 46, borderRadius: 13,
    backgroundColor: C.pinkGhost,
    justifyContent: 'center', alignItems: 'center',
  },
  cardLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 4 },
  cardValue: { fontSize: 15, fontWeight: '700', color: C.text },

  // ── Secure card ──
  secureCard: {
    backgroundColor: C.surface,
    borderRadius: 20, padding: 16, marginBottom: 20,
    borderWidth: 1.5, borderColor: C.pinkBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
  },
  secureHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  secureTitle: { fontSize: 13, fontWeight: '800', color: C.pink },
  secureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  secureKey: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  secureVal: { fontSize: 12, color: C.text, fontWeight: '700' },
  secureDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  secureNote: { fontSize: 11, color: C.textMuted, marginTop: 12, lineHeight: 17 },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.redGhost,
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  logoutIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: C.red },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 32,
    maxHeight: '80%',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 12,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.pinkBorder,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
    marginBottom: 8,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: C.pink },
  modalClose: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.pinkGhost,
    justifyContent: 'center', alignItems: 'center',
  },

  avatarGrid: { paddingBottom: 16 },
  avatarOption: {
    flex: 1, aspectRatio: 1,
    backgroundColor: C.pinkGhost,
    borderRadius: 16, margin: 6,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border,
    position: 'relative', overflow: 'hidden',
  },
  avatarOptionActive: {
    borderColor: C.pink,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  avatarOptionGrad: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  checkmark: {
    position: 'absolute', top: 5, right: 5,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.pink,
    justifyContent: 'center', alignItems: 'center',
  },
})