/* eslint-disable @typescript-eslint/array-type */
import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import axios from 'axios'

const COLORS = {
  dark: '#0B1220',
  card: '#121A2B',
  purple: '#7C3AED',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#1E293B',
  red: '#EF4444',
  green: '#10B981',
}

// ============ API BASE URL ============
const API_BASE_URL = 'http://10.252.189.103:8000/api'

const TrustedContacts = () => {
  const router = useRouter()
  const [contacts, setContacts] = useState<Array<{ _id: string; name: string; phone: string }>>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '' })
  const [addingContact, setAddingContact] = useState(false)

  // ============ FETCH CONTACTS ============
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/trusted-contacts`)
      if (response.data.success) {
        setContacts(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      Alert.alert('Error', 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }, [])

  // ============ REFRESH CONTACTS ============
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const response = await axios.get(`${API_BASE_URL}/trusted-contacts`)
      if (response.data.success) {
        setContacts(response.data.data)
      }
    } catch (error) {
      console.error('Error refreshing contacts:', error)
      Alert.alert('Error', 'Failed to refresh contacts')
    } finally {
      setRefreshing(false)
    }
  }

  // ============ LOAD CONTACTS ON SCREEN FOCUS ============
  useFocusEffect(
    useCallback(() => {
      fetchContacts()
    }, [fetchContacts])
  )

  // ============ ADD CONTACT ============
  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(newContact.phone.replace(/\D/g, ''))) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number')
      return
    }

    try {
      setAddingContact(true)
      const response = await axios.post(`${API_BASE_URL}/trusted-contacts`, {
        name: newContact.name.trim(),
        phone: newContact.phone.trim(),
      })

      if (response.data.success) {
        setContacts([response.data.data, ...contacts])
        setNewContact({ name: '', phone: '' })
        setModalVisible(false)
        Alert.alert('Success', 'Contact added successfully')
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      const errorMessage =
        (error as any).response?.data?.message || 'Failed to add contact'
      Alert.alert('Error', errorMessage)
    } finally {
      setAddingContact(false)
    }
  }

  // ============ DELETE CONTACT ============
  const handleDeleteContact = (id: string, contactName: string) => {
    Alert.alert('Delete Contact', `Are you sure you want to delete ${contactName}?`, [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const response = await axios.delete(
              `${API_BASE_URL}/trusted-contacts/${id}`
            )
            if (response.data.success) {
              setContacts(contacts.filter((c) => c._id !== id))
              Alert.alert('Success', 'Contact deleted successfully')
            }
          } catch (error) {
            console.error('Error deleting contact:', error)
            Alert.alert('Error', 'Failed to delete contact')
          }
        },
        style: 'destructive',
      },
    ])
  }

  // ============ CALL CONTACT - Open Dialer ============
  const handleCallContact = async (phoneNumber: string, contactName: string) => {
    try {
      // ✅ Format phone number with country code
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`
      
      const dialerUrl = `tel:${formattedNumber}`
      
      // Check if the device can open the tel: URI
      const canOpen = await Linking.canOpenURL(dialerUrl)
      
      if (canOpen) {
        await Linking.openURL(dialerUrl)
      } else {
        Alert.alert('Error', 'Unable to open dialer on this device')
      }
    } catch (error) {
      console.error('Error opening dialer:', error)
      Alert.alert('Error', 'Failed to open dialer')
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ============ HEADER ============ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trusted Contacts</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* ============ LOADING STATE ============ */}
        {loading && contacts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : (
          <>
            {/* ============ ADD BUTTON ============ */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <MaterialCommunityIcons name="plus" size={24} color={COLORS.text} />
              <Text style={styles.addButtonText}>Add New Contact</Text>
            </TouchableOpacity>

            {/* ============ CONTACTS LIST ============ */}
            <View style={styles.contactsList}>
              {contacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={48}
                    color={COLORS.purple}
                  />
                  <Text style={styles.emptyText}>No trusted contacts yet</Text>
                  <Text style={styles.emptySubtext}>Add your first trusted contact</Text>
                </View>
              ) : (
                contacts.map((contact) => (
                  <View key={contact._id} style={styles.contactCard}>
                    <View style={styles.contactInfo}>
                      <View style={styles.contactAvatar}>
                        <MaterialCommunityIcons
                          name="account-circle"
                          size={40}
                          color={COLORS.purple}
                        />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactPhone}>{contact.phone}</Text>
                      </View>
                    </View>

                    <View style={styles.contactActions}>
                      {/* ✅ CALL BUTTON - Opens Dialer */}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleCallContact(contact.phone, contact.name)}
                      >
                        <MaterialCommunityIcons
                          name="phone"
                          size={20}
                          color={COLORS.green}
                        />
                      </TouchableOpacity>
                      
                      {/* ✅ REMOVED: Message button */}
                      
                      {/* ✅ DELETE BUTTON */}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteContact(contact._id, contact.name)}
                      >
                        <MaterialCommunityIcons
                          name="delete"
                          size={20}
                          color={COLORS.red}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* ============ ADD CONTACT MODAL ============ */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Trusted Contact</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={COLORS.textSecondary}
              value={newContact.name}
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              editable={!addingContact}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              value={newContact.phone}
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
              editable={!addingContact}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.border }]}
                onPress={() => {
                  setModalVisible(false)
                  setNewContact({ name: '', phone: '' })
                }}
                disabled={addingContact}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: COLORS.purple, opacity: addingContact ? 0.6 : 1 },
                ]}
                onPress={handleAddContact}
                disabled={addingContact}
              >
                {addingContact ? (
                  <ActivityIndicator color={COLORS.text} size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default TrustedContacts

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },

  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.purple,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  contactsList: {
    gap: 12,
  },

  contactCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contactDetails: {
    flex: 1,
  },

  contactName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  contactPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  contactActions: {
    flexDirection: 'row',
    gap: 10,
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.border}`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    width: '85%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },

  input: {
    backgroundColor: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    marginBottom: 12,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
})