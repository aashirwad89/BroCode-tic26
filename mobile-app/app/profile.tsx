import React, { useState, useEffect } from 'react'
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
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

const COLORS = {
  dark: '#0B1220',
  card: '#121A2B',
  purple: '#7C3AED',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#1E293B',
  red: '#EF4444',
}

// ============ AVATAR ICONS ============
const AVATAR_OPTIONS = [
  { id: 1, icon: 'account-circle', name: 'Circle' },
  { id: 2, icon: 'account', name: 'Account' },
  { id: 3, icon: 'face-man', name: 'Man' },
  { id: 4, icon: 'face-woman', name: 'Woman' },
  { id: 5, icon: 'dumbbell', name: 'Dumbbell' },
  { id: 6, icon: 'soccer', name: 'Soccer' },
  { id: 7, icon: 'basketball', name: 'Basketball' },
  { id: 8, icon: 'music', name: 'Music' },
  { id: 9, icon: 'heart', name: 'Heart' },
  { id: 10, icon: 'star', name: 'Star' },
  { id: 11, icon: 'zap', name: 'Lightning' },
  { id: 12, icon: 'shield', name: 'Shield' },
]

interface UserDataType {
  phone: string
  avatar: string
}

const Profile = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserDataType>({
    phone: '',
    avatar: 'account-circle',
  })
  const [modalVisible, setModalVisible] = useState(false)

  // ✅ USE FOCUSEFFECT TO RELOAD DATA WHEN SCREEN IS FOCUSED
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Profile screen focused, loading data...')
      loadUserData()
    }, [])
  )

  // ============ LOAD USER DATA ============
  const loadUserData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading user data from SecureStore...')

      // ✅ GET PHONE NUMBER FROM SECURESTORE
      const storedPhone = await SecureStore.getItemAsync('userPhone')
      console.log('📱 Retrieved phone from SecureStore:', storedPhone)

      // ✅ GET USER DATA (AVATAR) FROM SECURESTORE
      const storedUserData = await SecureStore.getItemAsync('userData')
      console.log('📦 Retrieved userData from SecureStore:', storedUserData)

      let phone = storedPhone || ''
      let avatar = 'account-circle'

      // ✅ PARSE USER DATA
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData) as UserDataType
          console.log('✅ Parsed userData:', parsedData)
          avatar = parsedData.avatar || 'account-circle'
        } catch (parseError) {
          console.error('❌ Error parsing userData:', parseError)
        }
      }

      // ✅ SET COMBINED DATA
      const finalData: UserDataType = {
        phone: phone,
        avatar: avatar,
      }

      console.log('✅ Final userData set:', finalData)
      setUserData(finalData)
    } catch (error) {
      console.error('❌ Error loading user data:', error)
      Alert.alert('Error', 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  // ============ SAVE AVATAR ============
  const handleSelectAvatar = async (iconName: string) => {
    try {
      console.log('🎨 Changing avatar to:', iconName)

      // ✅ CREATE NEW USER DATA OBJECT
      const newUserData: UserDataType = {
        phone: userData.phone, // Keep existing phone
        avatar: iconName, // New avatar
      }

      console.log('💾 About to save to SecureStore:', newUserData)

      // ✅ SAVE TO SECURESTORE
      const jsonString = JSON.stringify(newUserData)
      await SecureStore.setItemAsync('userData', jsonString)
      console.log('✅ Successfully saved to SecureStore')

      // ✅ VERIFY IT WAS SAVED
      const verify = await SecureStore.getItemAsync('userData')
      console.log('✅ Verification - Retrieved from SecureStore:', verify)

      // ✅ UPDATE STATE
      setUserData(newUserData)
      console.log('✅ State updated with new avatar')

      // Close modal
      setModalVisible(false)

      // Show success alert
      Alert.alert('✅ Success', 'Avatar updated successfully!')
    } catch (error) {
      console.error('❌ Error saving avatar:', error)
      Alert.alert('❌ Error', 'Failed to update avatar. Please try again.')
    }
  }

  // ============ LOGOUT ============
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            console.log('🔄 Clearing SecureStore...')

            // ✅ CLEAR ALL DATA FROM SECURESTORE
            await Promise.all([
              SecureStore.deleteItemAsync('userData'),
              SecureStore.deleteItemAsync('userPhone'),
              SecureStore.deleteItemAsync('authToken'),
              SecureStore.deleteItemAsync('isVerified'),
            ])

            console.log('✅ Data cleared from SecureStore')

            // Navigate to login
            router.replace('/login')
          } catch (error) {
            console.error('❌ Error logging out:', error)
            Alert.alert('❌ Error', 'Failed to logout')
          }
        },
        style: 'destructive',
      },
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ============ HEADER ============ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            {/* ============ AVATAR SECTION ============ */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => {
                  console.log('📸 Opening avatar modal')
                  setModalVisible(true)
                }}
              >
                <MaterialCommunityIcons
                  name={userData.avatar as any}
                  size={100}
                  color={COLORS.purple}
                />
                <View style={styles.changeAvatarBadge}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={16}
                    color={COLORS.text}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarLabel}>Tap to change avatar</Text>
            </View>

            {/* ============ PHONE NUMBER SECTION ============ */}
            <View style={styles.infoCard}>
              <View style={styles.phoneSection}>
                <View style={styles.phoneIconContainer}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={24}
                    color={COLORS.purple}
                  />
                </View>
                <View style={styles.phoneInfo}>
                  <Text style={styles.phoneLabel}>Phone Number</Text>
                  {userData.phone ? (
                    <Text style={styles.phoneNumber}>+91 {userData.phone}</Text>
                  ) : (
                    <Text style={[styles.phoneNumber, { color: COLORS.textSecondary }]}>
                      Not registered
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* ============ DEBUG INFO ============ */}
            <View style={styles.debugCard}>
              <Text style={styles.debugTitle}>🔐 SecureStore Info</Text>
              <Text style={styles.debugText}>Phone: {userData.phone || 'N/A'}</Text>
              <Text style={styles.debugText}>Avatar: {userData.avatar}</Text>
              <Text style={styles.debugSubText}>
                Data is encrypted and stored securely
              </Text>
            </View>

            {/* ============ LOGOUT BUTTON ============ */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={COLORS.text}
              />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>

      {/* ============ AVATAR SELECTION MODAL ============ */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          console.log('📸 Closing avatar modal')
          setModalVisible(false)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('❌ Closing modal')
                  setModalVisible(false)
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={AVATAR_OPTIONS}
              numColumns={4}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={true}
              contentContainerStyle={styles.avatarGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.avatarOption,
                    userData.avatar === item.icon && styles.avatarOptionActive,
                  ]}
                  onPress={() => {
                    console.log('✅ Selected avatar:', item.icon)
                    handleSelectAvatar(item.icon)
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={40}
                    color={
                      userData.avatar === item.icon
                        ? COLORS.purple
                        : COLORS.textSecondary
                    }
                  />
                  {userData.avatar === item.icon && (
                    <View style={styles.checkmark}>
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color={COLORS.text}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

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

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  container: {
    flex: 1,
    padding: 16,
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },

  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },

  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${COLORS.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.purple,
    position: 'relative',
  },

  changeAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  avatarLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },

  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  phoneSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  phoneIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: `${COLORS.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  phoneInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  phoneLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },

  phoneNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  debugCard: {
    backgroundColor: `${COLORS.purple}10`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.purple,
    marginBottom: 8,
  },

  debugText: {
    fontSize: 11,
    color: COLORS.text,
    marginBottom: 4,
  },

  debugSubText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.red,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '85%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  avatarGrid: {
    paddingBottom: 20,
  },

  avatarOption: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.dark,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    margin: 8,
    position: 'relative',
  },

  avatarOptionActive: {
    borderColor: COLORS.purple,
    backgroundColor: `${COLORS.purple}20`,
  },

  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
})