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
  Platform
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import axios, { AxiosError } from 'axios'

// ✅ Match Home’s light theme, secondary pink gradient
const C = {
  bg:           '#F8FAFC',   // White/light background
  surface:      '#FFFFFF',   // Card background
  surfaceMuted: '#F8FAFC',
  border:       '#E2E8F0',
  pink:         '#EC4899',
  pinkLight:    '#F472B6',
  pinkDeep:     '#DB2777',
  pinkGhost:    '#FCE7F3',
  pinkBorder:   '#FBCFE8',
  text:         '#0F172A',
  textSub:      '#475569',
  textMuted:    '#64748B',
  red:          '#EF4444',
  green:        '#10B981',
  purple:       '#7C3AED',
}


const API_BASE_URL = 'http://10.252.189.103:8000/api'


const TrustedContacts = () => {
  const router = useRouter()
  const [contacts, setContacts] = useState<Array<{ _id: string; name: string; phone: string }>>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '' })
  const [addingContact, setAddingContact] = useState(false)


  useFocusEffect(
    useCallback(() => {
      fetchContacts()
    }, [])
  )


  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/trusted-contacts`)
      if (res.data.success) setContacts(res.data.data)
      else throw new Error(res.data?.message || 'Failed to fetch contacts')
    } catch (err) {
      console.error('Error fetching contacts:', err)
      Alert.alert('Error', 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }, [])


  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const res = await axios.get(`${API_BASE_URL}/trusted-contacts`)
      if (res.data.success) setContacts(res.data.data)
    } catch (err) {
      console.error('Error refreshing:', err)
      Alert.alert('Error', 'Failed to refresh')
    } finally {
      setRefreshing(false)
    }
  }


  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    const cleanPhone = newContact.phone.replace(/\D/g, '')
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert('Error', 'Please enter a valid 10‑digit phone number')
      return
    }

    try {
      setAddingContact(true)
      const res = await axios.post(`${API_BASE_URL}/trusted-contacts`, {
        name: newContact.name.trim(),
        phone: cleanPhone,
      })

      if (res.data.success) {
        setContacts([res.data.data, ...contacts])
        setNewContact({ name: '', phone: '' })
        setModalVisible(false)
        Alert.alert('Success', 'Contact added')
      }
    } catch (err) {
      console.error('Error adding contact:', err)
      const msg = (err as AxiosError)?.response?.data || 'Failed to add contact'
      Alert.alert('Error')
    } finally {
      setAddingContact(false)
    }
  }


  const handleDeleteContact = (id: string, contactName: string) => {
    Alert.alert('Delete Contact', `Delete ${contactName}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const res = await axios.delete(`${API_BASE_URL}/trusted-contacts/${id}`)
            if (res.data.success) {
              setContacts(contacts.filter(c => c._id !== id))
              Alert.alert('Success', 'Contact deleted')
            }
          } catch (err) {
            console.error('Error deleting:', err)
            Alert.alert('Error', 'Failed to delete')
          }
        },
        style: 'destructive',
      },
    ])
  }


  const handleCallContact = async (phone: string, name: string) => {
    try {
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`
      const url = `tel:${formatted}`
      const canOpen = await Linking.canOpenURL(url)

      if (canOpen) await Linking.openURL(url)
      else Alert.alert('Error', 'Cannot open dialer')
    } catch (err) {
      console.error('Call error:', err)
      Alert.alert('Error', 'Failed to open dialer')
    }
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trusted Contacts</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading && contacts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={C.pink} size="large" />
            <Text style={styles.loadingText}>Loading contacts…</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add New Contact</Text>
            </TouchableOpacity>

            <View style={styles.contactsList}>
              {contacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="heart" size={56} color={C.pink} />
                  <Text style={styles.emptyText}>No trusted contacts yet</Text>
                  <Text style={styles.emptySubtext}>Add your first trusted contact</Text>
                </View>
              ) : (
                contacts.map(contact => (
                  <View key={contact._id} style={styles.contactCard}>
                    <View style={styles.contactInfo}>
                      <View style={styles.avatar}>
                        <MaterialCommunityIcons name="account" size={24} color={C.pink} />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactPhone}>{contact.phone}</Text>
                      </View>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleCallContact(contact.phone, contact.name)}
                      >
                        <MaterialCommunityIcons name="phone" size={18} color={C.green} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDeleteContact(contact._id, contact.name)}
                      >
                        <MaterialCommunityIcons name="delete" size={18} color={C.red} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Trusted Contact</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={C.textMuted}
              value={newContact.name}
              onChangeText={name => setNewContact({ ...newContact, name })}
              editable={!addingContact}
            />

            <TextInput
              style={styles.input}
              placeholder="10‑digit phone number"
              placeholderTextColor={C.textMuted}
              keyboardType="phone-pad"
              value={newContact.phone}
              onChangeText={phone => setNewContact({ ...newContact, phone })}
              editable={!addingContact}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => {
                  setModalVisible(false)
                  setNewContact({ name: '', phone: '' })
                }}
                disabled={addingContact}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnPrimary,
                  { backgroundColor: C.pink },
                  addingContact && { opacity: 0.7 },
                ]}
                onPress={handleAddContact}
                disabled={addingContact}
              >
                {addingContact ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnText}>Add</Text>
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
  safeArea: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginTop:42,
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text },

  content: { flex: 1 },

  loadingContainer: { flex: 1, paddingVertical: 60, alignItems: 'center' },
  loadingText: { fontSize: 14, color: C.textMuted, marginTop: 12 },

  addButton: {
    flexDirection: 'row',
    backgroundColor: C.pink,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  addButtonText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },

  contactsList: { gap: 10, paddingHorizontal: 16, paddingBottom: 24 },

  contactCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  contactInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  avatar: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: C.pinkGhost,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactDetails: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '700', color: C.text },
  contactPhone: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: C.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 },
  emptyText: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 12 },
  emptySubtext: { fontSize: 12, color: C.textMuted, marginTop: 4 },

  overlay: { flex: 1, backgroundColor: 'rgba(11,18,32,0.55)', justifyContent: 'center', alignItems: 'center' },
  modal: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 16 },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    marginBottom: 12,
  },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: 'center',
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
})