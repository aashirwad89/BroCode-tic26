/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

const COLORS = {
  dark: '#0B1220',
  card: '#121A2B',
  purple: '#7C3AED',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#1E293B',
  red: '#EF4444',
  green: '#10B981',
  yellow: '#F59E0B',
  blue: '#3B82F6',
}

const callLogs = () => {
  const router = useRouter()
  const [callHistory, setCallHistory] = useState([
    {
      id: 1,
      name: 'Mom',
      number: '+91 9876543210',
      type: 'incoming', // incoming, outgoing, missed
      duration: '5m 23s',
      timestamp: '2:45 PM',
      date: 'Today',
    },
    {
      id: 2,
      name: 'Aisha Khan',
      number: '+91 9123456789',
      type: 'outgoing',
      duration: '12m 15s',
      timestamp: '1:30 PM',
      date: 'Today',
    },
    {
      id: 3,
      name: 'Sister',
      number: '+91 8765432109',
      type: 'missed',
      duration: '0s',
      timestamp: '11:20 AM',
      date: 'Today',
    },
    {
      id: 4,
      name: 'Dad',
      number: '+91 9988776655',
      type: 'incoming',
      duration: '8m 45s',
      timestamp: '9:15 AM',
      date: 'Today',
    },
    {
      id: 5,
      name: 'Best Friend',
      number: '+91 8899776655',
      type: 'outgoing',
      duration: '3m 10s',
      timestamp: '7:50 PM',
      date: 'Yesterday',
    },
    {
      id: 6,
      name: 'Work',
      number: '+91 9876543210',
      type: 'incoming',
      duration: '15m 30s',
      timestamp: '3:20 PM',
      date: 'Yesterday',
    },
  ])

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'call-received'
      case 'outgoing':
        return 'call-made'
      case 'missed':
        return 'call-missed'
      default:
        return 'phone'
    }
  }

  const getCallColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return COLORS.green
      case 'outgoing':
        return COLORS.blue
      case 'missed':
        return COLORS.red
      default:
        return COLORS.purple
    }
  }

  const handleCall = (number: string) => {
    Alert.alert('Call', `Would you like to call ${number}?`, [
      { text: 'Cancel' },
      { text: 'Call', onPress: () => Alert.alert('Calling...', number) },
    ])
  }

  const handleDelete = (id: number) => {
    Alert.alert('Delete Call', 'Are you sure you want to delete this call?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          setCallHistory(callHistory.filter((call) => call.id !== id))
          Alert.alert('Success', 'Call deleted')
        },
        style: 'destructive',
      },
    ])
  }

  const groupedCalls = callHistory.reduce((acc: any, call) => {
    if (!acc[call.date]) {
      acc[call.date] = []
    }
    acc[call.date].push(call)
    return acc
  }, {})

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ============ HEADER ============ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call Logs</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* ============ CALL HISTORY ============ */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {callHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="phone-off" size={48} color={COLORS.purple} />
            <Text style={styles.emptyText}>No call logs available</Text>
            <Text style={styles.emptySubtext}>Your call history will appear here</Text>
          </View>
        ) : (
          Object.entries(groupedCalls).map(([date, calls]: any) => (
            <View key={date}>
              {/* Date Header */}
              <Text style={styles.dateHeader}>{date}</Text>

              {/* Call Items */}
              {calls.map((call: any) => (
                <View key={call.id} style={styles.callCard}>
                  {/* Call Icon & Info */}
                  <View style={styles.callInfo}>
                    <View
                      style={[
                        styles.callIconContainer,
                        { backgroundColor: `${getCallColor(call.type)}20` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={getCallIcon(call.type)}
                        size={20}
                        color={getCallColor(call.type)}
                      />
                    </View>

                    <View style={styles.callDetails}>
                      <Text style={styles.callName}>{call.name}</Text>
                      <Text style={styles.callNumber}>{call.number}</Text>
                      <View style={styles.callMetadata}>
                        <Text style={styles.callDuration}>{call.duration}</Text>
                        <Text style={styles.callTimestamp}>{call.timestamp}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.callActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleCall(call.number)}
                    >
                      <MaterialCommunityIcons name="phone" size={20} color={COLORS.green} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                      <MaterialCommunityIcons
                        name="message-outline"
                        size={20}
                        color={COLORS.blue}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(call.id)}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default callLogs

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

  backButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  // ============ CONTAINER ============
  container: {
    flex: 1,
    padding: 16,
  },

  // ============ DATE HEADER ============
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purple,
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ============ CALL CARD ============
  callCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  callInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  callIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  callDetails: {
    flex: 1,
    gap: 4,
  },

  callName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  callNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  callMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  callDuration: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  callTimestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },

  // ============ ACTIONS ============
  callActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },

  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.border}`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============ EMPTY STATE ============
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
})