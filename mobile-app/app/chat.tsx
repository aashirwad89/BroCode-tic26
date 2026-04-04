import React from 'react'
import { StyleSheet, Text, View, Pressable, Linking, SafeAreaView } from 'react-native'

const Chat = () => {
  const handleOpenBot = async () => {
    const url = 'https://shadowsafe-ai-4.onrender.com/'
    const supported = await Linking.canOpenURL(url)

    if (supported) {
      await Linking.openURL(url)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI Support</Text>
          </View>

          <Text style={styles.heading}>Try our AI Chat Bot</Text>
          <Text style={styles.subText}>
            Get instant help, quick answers, and smart assistance in one tap.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={handleOpenBot}
          >
            <Text style={styles.buttonText}>Open AI Chat Bot</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Chat

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#E8F1FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: '#2F6FED',
    fontSize: 12,
    fontWeight: '600',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2F6FED',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})