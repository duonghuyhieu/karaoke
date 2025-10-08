import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client for real-time subscriptions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 100, // Increased from 10 to 100 for better responsiveness
    },
    heartbeatIntervalMs: 15000, // Reduce heartbeat frequency (default 30000)
    timeout: 10000, // Faster timeout detection
  },
  global: {
    headers: {
      'X-Client-Info': 'karaoke-app', // For debugging
    },
  },
})

// Server-side Supabase client for API routes (if needed)
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)

// Real-time event types for type safety
export interface QueueUpdatedPayload {
  roomId: string
  queue: Array<{
    id: string
    position: number
    song: {
      id: string
      title: string
      artist: string
      youtubeId: string
      duration: string
      thumbnail?: string | null
    }
  }>
}

export interface PlaybackControlPayload {
  roomId: string
  action: 'play' | 'pause' | 'stop' | 'next' | 'previous' | 'auto-next' | 'volume' | 'mute' | 'unmute'
  currentSongId?: string
  timestamp: number
  volume?: number
}

export interface SongChangedPayload {
  roomId: string
  currentSongId: string | null
  song?: {
    id: string
    title: string
    artist: string
    youtubeId: string
    duration: string
    thumbnail?: string | null
  }
}

// Real-time event names
export const REALTIME_EVENTS = {
  QUEUE_UPDATED: 'queue_updated',
  PLAYBACK_CONTROL: 'playback_control',
  SONG_CHANGED: 'song_changed',
} as const

// Channel name helper
export const getChannelName = (roomId: string) => `room:${roomId}`

// Real-time subscription helpers with both Postgres Changes and Broadcast
export const subscribeToRoom = (
  roomId: string,
  callbacks: {
    onQueueUpdated?: (payload: QueueUpdatedPayload) => void
    onPlaybackControl?: (payload: PlaybackControlPayload) => void
    onSongChanged?: (payload: SongChangedPayload) => void
    onConnectionStatusChange?: (status: string) => void
  }
) => {
  const channel = supabase.channel(getChannelName(roomId))

  // Listen to broadcast events for queue updates (fastest method)
  if (callbacks.onQueueUpdated) {
    channel.on('broadcast', { event: REALTIME_EVENTS.QUEUE_UPDATED }, (payload) => {
      console.log('🎵 Queue updated via broadcast:', payload.payload)
      callbacks.onQueueUpdated!(payload.payload as QueueUpdatedPayload)
    })

    // Optional: Listen to database changes as backup (without HTTP fetch)
    // This ensures we catch changes even if broadcasts fail
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_items',
      },
      (payload) => {
        console.log('📊 Queue database change detected:', payload.eventType)
        // Note: We rely on broadcast events for the actual data
        // This is just a backup notification that something changed
      }
    )
  }

  // Listen to broadcast events for playback controls and song changes
  if (callbacks.onPlaybackControl) {
    channel.on('broadcast', { event: REALTIME_EVENTS.PLAYBACK_CONTROL }, (payload) => {
      callbacks.onPlaybackControl!(payload.payload as PlaybackControlPayload)
    })
  }

  if (callbacks.onSongChanged) {
    channel.on('broadcast', { event: REALTIME_EVENTS.SONG_CHANGED }, (payload) => {
      callbacks.onSongChanged!(payload.payload as SongChangedPayload)
    })
  }

  // Subscribe with status callback that communicates back to the component
  const statusCallback = (status: string) => {
    console.log('Realtime subscription status:', status)
    if (callbacks.onConnectionStatusChange) {
      callbacks.onConnectionStatusChange(status)
    }
  }

  channel.subscribe(statusCallback)

  return channel
}

// Re-export optimized broadcast helpers from supabase-channels
export {
  broadcastQueueUpdate,
  broadcastPlaybackControl,
  broadcastSongChanged
} from './supabase-channels'
