import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')

const COLORS = {
  bgTop: '#FDF6FB',
  bgBottom: '#EEF3FF',
  
  card: '#FFFFFF',
  text: '#1F2A44',
  subText: '#7C8192',
  green: '#10B981',
  red: '#EF4444',
  pink: '#FF7CCB',
  purple: '#B06CFF',
  border: '#E7E8F0',
  shadow: '#C9BEDD',
}

const statusItems = [
  { label: 'Safety Status', value: 'Shared', state: 'active', color: COLORS.green },
  { label: 'Trusted Circle', value: 'All features active', color: COLORS.green },
]

const sosActions = [
  { icon: '📞', label: 'Quick Call', sub: 'Emergency Helpline' },
  { icon: '📍', label: 'Share Location', sub: 'Real-time tracking' },
]

const features = [
  { icon: '🎥', label: 'Record Video', sub: 'Evidence recording' },
  { icon: '🗺️', label: 'Safe Route', sub: 'Navigate safely' },
]

const tabs = [
  { icon: '🛡️', label: 'Safety Alerts' },
  { icon: '👥', label: 'Trusted Contacts' },
]

const SafeGuardHome: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgTop} />
      
      <LinearGradient
        colors={[COLORS.bgTop, COLORS.bgBottom]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.pink, COLORS.purple]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerIcon}>🛡️</Text>
              <Text style={styles.headerTitle}>ShadowSafe - AI</Text>
            </View>
          </LinearGradient>
          <Text style={styles.headerSubtitle}>Stay Safe connected</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Status Cards */}
          <View style={styles.section}>
            {statusItems.map((item, index) => (
              <View key={index} style={styles.statusCard}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{item.label}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.color + '20' }
                  ]}>
                    <Text style={[styles.statusValue, { color: item.color }]}>
                      {item.value}
                    </Text>
                  </View>
                </View>
                <Text style={styles.statusDesc}>
                  Your safety features are being shared with your trusted circle
                </Text>
              </View>
            ))}
          </View>

          {/* SOS Emergency */}
          <View style={styles.sosSection}>
            <View style={styles.sosHeader}>
              <View style={styles.sosIconWrap}>
                <Text style={styles.sosIcon}>🚨</Text>
              </View>
              <Text style={styles.sosTitle}>SOS Emergency</Text>
            </View>
            <Text style={styles.sosDesc}>
              Press to send alert to your trusted contacts
            </Text>
            
            <View style={styles.sosActions}>
              {sosActions.map((action, index) => (
                <TouchableOpacity key={index} style={styles.actionCard}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.label}</Text>
                  <Text style={styles.actionSub}>{action.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Quick Features</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <TouchableOpacity key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.label}</Text>
                  <Text style={styles.featureSub}>{feature.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Tabs */}
        <View style={styles.bottomTabs}>
          {tabs.map((tab, index) => (
            <TouchableOpacity key={index} style={styles.tab}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={styles.tabLabel}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgTop,
  },

  background: {
    flex: 1,
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  headerGradient: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#DDA0DD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  headerIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontSize: 14,
    color: COLORS.subText,
    fontWeight: '600',
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  section: {
    gap: 12,
    marginBottom: 20,
  },

  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusValue: {
    fontSize: 11,
    fontWeight: '800',
  },

  statusDesc: {
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 18,
  },

  sosSection: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },

  sosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sosIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.red + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  sosIcon: {
    fontSize: 18,
  },

  sosTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },

  sosDesc: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 16,
  },

  sosActions: {
    flexDirection: 'row',
    gap: 12,
  },

  actionCard: {
    flex: 1,
    backgroundColor: '#FFF8FE',
    borderWidth: 1,
    borderColor: COLORS.pink + '30',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },

  actionSub: {
    fontSize: 11,
    color: COLORS.subText,
  },

  featuresSection: {
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },

  featuresGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  featureCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },

  featureIcon: {
    fontSize: 22,
    marginBottom: 8,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },

  featureSub: {
    fontSize: 11,
    color: COLORS.subText,
    textAlign: 'center',
  },

  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 40,
  },

  tab: {
    alignItems: 'center',
  },

  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.subText,
  },
})

export default SafeGuardHome
