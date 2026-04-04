import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, StatusBar, Animated,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Audio } from 'expo-av'
import { LinearGradient } from 'expo-linear-gradient'

const CLOUD_NAME = 'dji1t0vry'
const API_KEY    = '956559844949169'
const API_SECRET = '0DIf-tnLdDOJ3QqPA7IhtTaNgeE'

const C = {
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  border:    '#F1F5F9',
  borderMid: '#E2E8F0',
  pink:      '#DB2777',
  pinkLight: '#F472B6',
  pinkDeep:  '#9D174D',
  pinkGhost: '#FDF2F8',
  text:      '#111827',
  textSub:   '#64748B',
  textMuted: '#94A3B8',
}

interface AudioFile {
  id:        string
  name:      string
  url:       string
  duration:  number | null
  format:    string
  createdAt: string
}

const formatDuration = (secs: number | null) => {
  if (!secs) return '--:--'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Records() {
  const router = useRouter()
  const [audios, setAudios]       = useState<AudioFile[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const soundRef                  = useRef<Audio.Sound | null>(null)
  const waveAnims                 = useRef<Record<string, Animated.Value>>({})

  useEffect(() => {
    fetchAudios()
    return () => { stopAndUnload() }
  }, [])

  const fetchAudios = async () => {
    try {
      setLoading(true)
      setError('')

      const credentials = btoa(`${API_KEY}:${API_SECRET}`)
      let resources: any[] = []

      // ✅ Try 1: Search API
      try {
        const searchRes = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${credentials}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              expression: 'resource_type:video AND folder:assets',
              max_results: 100,
            }),
          }
        )
        if (searchRes.ok) {
          const d = await searchRes.json()
          resources = d.resources || []
          console.log('✅ Search API success, count:', resources.length)
        } else {
          const body = await searchRes.text()
          console.warn('⚠️ Search API failed:', searchRes.status, body)
          throw new Error('search_failed')
        }
      } catch {
        // ✅ Try 2: Resources list API — fetch all, filter assets/
        console.log('🔄 Falling back to resources/video list...')
        const listRes = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/video?max_results=100`,
          { headers: { Authorization: `Basic ${credentials}` } }
        )
        if (!listRes.ok) {
          const body = await listRes.text()
          console.error('❌ Resources API error:', listRes.status, body)
          throw new Error(`Cloudinary ${listRes.status}: ${body}`)
        }
        const d = await listRes.json()
        // filter assets folder only
        resources = (d.resources || []).filter((r: any) =>
          r.public_id?.startsWith('assets/')
        )
        console.log('✅ Resources API success, count:', resources.length)
      }

      const files: AudioFile[] = resources.map((f: any) => ({
        id:        f.public_id,
        name:      f.public_id.replace(/^assets\//, '').replace(/\.[^/.]+$/, ''),
        url:       f.secure_url,
        duration:  f.duration ? Math.round(f.duration) : null,
        format:    f.format,
        createdAt: f.created_at,
      }))

      files.forEach((a) => {
        waveAnims.current[a.id] = new Animated.Value(1)
      })

      setAudios(files)
    } catch (err: any) {
      console.error('❌ Final fetch error:', err)
      setError('Recordings load nahi hue. Retry karo.')
    } finally {
      setLoading(false)
    }
  }

  const startWave = (id: string) => {
    const anim = waveAnims.current[id]
    if (!anim) return
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.5, duration: 350, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.6, duration: 350, useNativeDriver: true }),
      ])
    ).start()
  }

  const stopWave = (id: string) => {
    const anim = waveAnims.current[id]
    if (!anim) return
    anim.stopAnimation()
    anim.setValue(1)
  }

  const stopAndUnload = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {})
      await soundRef.current.unloadAsync().catch(() => {})
      soundRef.current = null
    }
  }

  const handlePlay = async (audio: AudioFile) => {
    try {
      if (playingId === audio.id) {
        await stopAndUnload()
        stopWave(audio.id)
        setPlayingId(null)
        return
      }
      if (playingId) { stopWave(playingId); await stopAndUnload(); setPlayingId(null) }
      setLoadingId(audio.id)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: true,
      })
      const { sound } = await Audio.Sound.createAsync(
        { uri: audio.url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            stopWave(audio.id); setPlayingId(null); soundRef.current = null
          }
        }
      )
      soundRef.current = sound
      setPlayingId(audio.id)
      startWave(audio.id)
    } catch (err) {
      console.error('❌ Playback error:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const renderItem = ({ item, index }: { item: AudioFile; index: number }) => {
    const isPlaying = playingId === item.id
    const isLoading = loadingId === item.id
    const waveAnim  = waveAnims.current[item.id] ?? new Animated.Value(1)

    return (
      <View style={[styles.card, isPlaying && styles.cardActive]}>
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={() => handlePlay(item)}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : isPlaying ? (
            <View style={styles.waveBars}>
              {[0.7, 1, 0.6, 1, 0.7].map((h, i) => (
                <Animated.View
                  key={i}
                  style={[styles.waveBar, {
                    transform: [{ scaleY: waveAnim.interpolate({ inputRange: [0.6, 1.5], outputRange: [h * 0.4, h] }) }],
                  }]}
                />
              ))}
            </View>
          ) : (
            <Feather name="play" size={20} color="#fff" />
          )}
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.audioName} numberOfLines={1}>
            {item.name || `Recording ${index + 1}`}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.pill}>
              <Feather name="clock" size={10} color={C.textMuted} />
              <Text style={styles.pillText}>{formatDuration(item.duration)}</Text>
            </View>
            <View style={styles.pill}>
              <Feather name="calendar" size={10} color={C.textMuted} />
              <Text style={styles.pillText}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: C.pinkGhost, borderColor: '#FBCFE8' }]}>
              <Text style={[styles.pillText, { color: C.pink }]}>
                {item.format?.toUpperCase() ?? 'AUDIO'}
              </Text>
            </View>
          </View>
        </View>

        {isPlaying && (
          <View style={styles.nowBadge}>
            <Text style={styles.nowText}>NOW</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recordings</Text>
        <TouchableOpacity onPress={fetchAudios} style={styles.iconBtn}>
          <Feather name="refresh-cw" size={17} color={C.textSub} />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={[C.pinkLight, C.pink, C.pinkDeep]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <View style={styles.bannerIconBox}>
          <Feather name="mic" size={22} color={C.pink} />
        </View>
        <View>
          <Text style={styles.bannerTitle}>Emergency Recordings</Text>
          <Text style={styles.bannerSub}>
            {loading ? 'Loading...' : `${audios.length} recording${audios.length !== 1 ? 's' : ''} found`}
          </Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.pink} size="large" />
          <Text style={styles.stateText}>Recordings fetching…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={40} color={C.textMuted} />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchAudios}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : audios.length === 0 ? (
        <View style={styles.center}>
          <Feather name="mic-off" size={44} color={C.textMuted} />
          <Text style={styles.emptyTitle}>No Recording</Text>
          <Text style={styles.stateText}>No emergency recordings found.</Text>
        </View>
      ) : (
        <FlatList
          data={audios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
    marginTop:43,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.text },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, margin: 16, borderRadius: 18, padding: 16 },
  bannerIconBox: { width: 46, height: 46, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  bannerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardActive: { borderColor: '#FBCFE8', backgroundColor: C.pinkGhost },
  playBtn: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: C.pink,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  playBtnActive: { backgroundColor: C.pinkDeep },
  waveBars: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 26 },
  waveBar:  { width: 3, height: 20, borderRadius: 2, backgroundColor: '#fff' },
  info:      { flex: 1 },
  audioName: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 7 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: C.borderMid,
  },
  pillText: { fontSize: 10, fontWeight: '600', color: C.textMuted },
  nowBadge: { backgroundColor: C.pink, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  nowText:  { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  stateText:  { fontSize: 13, color: C.textSub, textAlign: 'center', lineHeight: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  retryBtn:   { paddingHorizontal: 28, paddingVertical: 10, backgroundColor: C.pink, borderRadius: 10 },
  retryText:  { fontSize: 14, fontWeight: '700', color: '#fff' },
})