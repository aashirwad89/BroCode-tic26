import React, { useState } from 'react'
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
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

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

const TrustedContacts = () => {
  const router = useRouter()
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Mom', phone: '9876543210' },
    { id: 2, name: 'Sister', phone: '9123456789' },
    { id: 3, name: 'Best Friend', phone: '8765432109' },
  ])
  const [modalVisible, setModalVisible] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '' })

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    setContacts([...contacts, { id: Date.now(), ...newContact }])
    setNewContact({ name: '', phone: '' })
    setModalVisible(false)
    Alert.alert('Success', 'Contact added successfully')
  }

  const handleDeleteContact = (id: number) => {
    Alert.alert('Delete Contact', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => setContacts(contacts.filter((c) => c.id !== id)),
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
        <Text style={styles.headerTitle}>Trusted Contacts</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              <MaterialCommunityIcons name="heart-outline" size={48} color={COLORS.purple} />
              <Text style={styles.emptyText}>No trusted contacts yet</Text>
              <Text style={styles.emptySubtext}>Add your first trusted contact</Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
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
                  <TouchableOpacity style={styles.actionButton}>
                    <MaterialCommunityIcons name="phone" size={20} color={COLORS.green} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <MaterialCommunityIcons name="message" size={20} color={COLORS.purple} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteContact(contact.id)}
                  >
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
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
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              value={newContact.phone}
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.border }]}
                onPress={() => {
                  setModalVisible(false)
                  setNewContact({ name: '', phone: '' })
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.purple }]}
                onPress={handleAddContact}
              >
                <Text style={styles.modalButtonText}>Add</Text>
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