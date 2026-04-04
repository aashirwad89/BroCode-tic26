/* eslint-disable @typescript-eslint/array-type */
import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Animated,
  DrawerLayoutAndroid,
} from 'react-native'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Link } from 'expo-router'
import { useRouter } from 'expo-router'

const { width, height } = Dimensions.get('window')

const COLORS = {
  dark: '#0B1220',
  card: '#121A2B',
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#1E293B',
  red: '#EF4444',
  green: '#10B981',
  blue: '#3B82F6',
  yellow: '#F59E0B',
}

const Home = () => {
  const navigation = useNavigation()
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [userName, setUserName] = useState('User')
  const drawerRef = React.useRef<DrawerLayoutAndroid>(null)
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Fetch user name from storage
    // AsyncStorage.getItem('userName').then(name => setUserName(name || 'User'))
  }, [])

  const handleActivate = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    setIsActive(!isActive)
    Alert.alert(
      isActive ? '⛔ Deactivated' : '🛡️ Activated',
      isActive
        ? 'Safety mode is now OFF'
        : 'Safety mode is now ON. Stay safe!'
    )
  }

  interface NavigationItem {
    id: number
    label: string
    icon: keyof typeof MaterialCommunityIcons.glyphMap
    screen: string
  }

  const navigationItems: NavigationItem[] = [
    { id: 1, label: 'Home', icon: 'home', screen: 'home' },
    { id: 2, label: 'Recent Records', icon: 'book', screen: 'records' },
    { id: 3, label: 'AI Assistant', icon: 'robot', screen: 'home' },
    { id: 4, label: 'Safety Tips', icon: 'shield-check', screen: 'safety' },
    { id: 5, label: 'Call Logs', icon: 'phone', screen: 'callLogs' },
    { id: 6, label: 'Trusted Contacts', icon: 'heart', screen: 'contacts' },
  ]

  const features: Array<{
    id: number
    title: string
    icon: keyof typeof MaterialCommunityIcons.glyphMap
    color: string
    count: string
    screen: string
  }> = [
    {
      id: 1,
      title: 'Trusted Contacts',
      icon: 'heart',
      color: COLORS.red,
      count: '3',
      screen: 'contacts',
    },
    {
      id: 2,
      title: 'Call Logs',
      icon: 'phone',
      color: COLORS.blue,
      count: '4',
      screen: 'callLogs',
    },
    {
      id: 3,
      title: 'GPS Location',
      icon: 'map-marker',
      color: COLORS.green,
      count: 'Active',
      screen: 'location',
    },
    {
      id: 4,
      title: 'Shake Detection',
      icon: 'alert-circle',
      color: COLORS.yellow,
      count: 'Ready',
      screen: 'shakeDetection',
    },
  ]

  const quotes = [
    "Your safety is your priority. We're here to protect you every step.",
    'A woman is the full circle. Within her is the power to create, nurture, transform and heal.',
    'Empowered women empower women. Stay strong, stay safe.',
    'Your voice matters. Your safety matters. You matter.',
    'Real strength is in knowing when to ask for help.',
  ]

  const renderDrawer = () => (
    <View style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <View style={styles.drawerProfileCircle}>
          <MaterialCommunityIcons name="account" size={32} color={COLORS.purple} />
        </View>
        <Text style={styles.drawerName}>Hello 👋</Text>
        <Text style={styles.drawerSubtitle}>ShadowSafe - AI</Text>
      </View>

    

      {navigationItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.drawerItem}
          onPress={() => {
            drawerRef.current?.closeDrawer()
            // ✅ Add routing
            if (item.screen === 'home') {
              router.push('/home')
            } else if (item.screen === 'callLogs') {
              router.push('/callLogs')
            } else if (item.screen === 'contacts') {
              router.push('/trusted')
            }
          }}
        >
          <MaterialCommunityIcons name={item.icon} size={22} color={COLORS.purple} />
          <Text style={styles.drawerItemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}

  

      <View style={styles.drawerFooter}>
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => {
            drawerRef.current?.closeDrawer()
            Alert.alert('Terms & Conditions', 'Read our terms and conditions here')
          }}
        >
          <MaterialCommunityIcons name="file-document-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.footerItemText}>Terms & Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => {
            drawerRef.current?.closeDrawer()
            Alert.alert('Privacy Policy', 'Read our privacy policy here')
          }}
        >
          <MaterialCommunityIcons name="lock-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.footerItemText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => {
            drawerRef.current?.closeDrawer()
            Alert.alert('About Us', 'Learn more about ShadowSafe AI')
          }}
        >
          <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.footerItemText}>About Us</Text>
        </TouchableOpacity>

        <View style={styles.drawerDivider} />

        <TouchableOpacity 
          style={styles.logoutItem}
          onPress={() => {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel' },
              {
                text: 'Logout',
                onPress: () => {
                  drawerRef.current?.closeDrawer()
                  router.replace('/login')
                },
                style: 'destructive',
              },
            ])
          }}
        >
          <MaterialCommunityIcons name="logout" size={18} color={COLORS.red} />
          <Text style={[styles.footerItemText, { color: COLORS.red }]}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </View>
  )

  // ============ UPDATE FEATURE BOX CLICK ============
  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={280}
      drawerPosition="left"
      renderNavigationView={renderDrawer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ============ HEADER ============ */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => drawerRef.current?.openDrawer()}
            style={styles.menuButton}
          >
            <MaterialCommunityIcons name="menu" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.appName}>ShadowSafe</Text>
            <Text style={styles.appSubtitle}>AI</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.text} />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.profileCircle}>
                <MaterialCommunityIcons name="account-circle" size={28} color={COLORS.purple} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ============ GREETING SECTION ============ */}
          <View style={styles.greetingCard}>
            <View style={styles.greetingContent}>
              <Text style={styles.greetingTitle}>👋 Welcome back, {userName}!</Text>
              <Text style={styles.greetingSubtitle}>
                Activate your safety mode to get instant alerts and emergency protection
              </Text>
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.activateButton,
                  { backgroundColor: isActive ? COLORS.green : COLORS.red },
                ]}
                onPress={handleActivate}
              >
                <MaterialCommunityIcons
                  name={isActive ? 'shield-check' : 'shield-alert'}
                  size={24}
                  color={COLORS.text}
                />
                <Text style={styles.activateButtonText}>
                  {isActive ? 'Safety Active' : 'Tap to Activate'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* ============ FEATURE BOXES ============ */}
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.featureGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureBox}
                onPress={() => {
                  // ✅ Add routing based on feature type
                  if (feature.screen === 'contacts') {
                    router.push('/trusted')
                  } else if (feature.screen === 'callLogs') {
                    router.push('/callLogs')
                  } else if (feature.screen === 'location') {
                    router.push('/location')
                  } else if (feature.screen === 'shakeDetection') {
                    router.push('/shake')
                  }
                }}
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: `${feature.color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={feature.icon}
                    size={28}
                    color={feature.color}
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureCount}>{feature.count}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ============ STATISTICS CARD ============ */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Protection</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Trusted Contacts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Private</Text>
            </View>
          </View>

          {/* ============ WOMEN SAFETY QUOTE ============ */}
          <View style={styles.quoteSection}>
            <Text style={styles.quoteTitle}>💪 Stay Empowered</Text>
            <View style={styles.quoteCard}>
              <MaterialCommunityIcons name="format-quote-open" size={28} color={COLORS.purple} />
              <Text style={styles.quoteText}>
                {quotes[Math.floor(Math.random() * quotes.length)]}
              </Text>
              <MaterialCommunityIcons
                name="format-quote-close"
                size={28}
                color={COLORS.purple}
                style={{ alignSelf: 'flex-end' }}
              />
            </View>
          </View>

          {/* ============ HELP SECTION ============ */}
          <View style={styles.helpCard}>
            <MaterialCommunityIcons name="help-circle" size={24} color={COLORS.blue} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>
                Access our safety guides and emergency resources
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.border} />
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </DrawerLayoutAndroid>
  )
}

export default Home

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
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  menuButton: {
    padding: 8,
  },

  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },

  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },

  appSubtitle: {
    fontSize: 12,
    color: COLORS.purple,
    fontWeight: '700',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  iconButton: {
    padding: 8,
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.red,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
  },

  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============ DRAWER ============
  drawer: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingTop: 20,
  },

  drawerHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  drawerProfileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${COLORS.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  drawerName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  drawerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },

  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },

  drawerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  // ============ SCROLL VIEW ============
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ============ GREETING CARD ============
  greetingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  greetingContent: {
    marginBottom: 16,
  },

  greetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },

  greetingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  activateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  // ============ SECTION TITLE ============
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },

  // ============ FEATURE GRID ============
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  featureBox: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },

  featureCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // ============ STATISTICS ============
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.purple,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },

  // ============ QUOTE SECTION ============
  quoteSection: {
    marginBottom: 20,
  },

  quoteTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },

  quoteCard: {
    backgroundColor: `${COLORS.purple}10`,
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: `${COLORS.purple}30`,
    alignItems: 'center',
  },

  quoteText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 20,
  },

  // ============ HELP CARD ============
  helpCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.blue}15`,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.blue}30`,
    marginBottom: 20,
  },

  helpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },

  helpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // ============ DRAWER FOOTER ============
  drawerFooter: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
    marginBottom: 6,
  },

  footerItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
    marginVertical: 8,
  },

  versionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
})