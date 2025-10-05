import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client for real-time subscriptions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
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

  // Listen to database changes for queue updates (more reliable)
  if (callbacks.onQueueUpdated) {
    // Note: Postgres Changes filtering by roomId requires the room's internal ID, not the user-friendly roomId
    // For now, we'll listen to all queue_items changes and filter client-side
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_items',
      },
      async (payload) => {
        console.log('Queue database change detected:', payload.eventType, payload.new || payload.old)

        // Always fetch updated queue when database changes to ensure consistency
        try {
          const response = await fetch(`/api/rooms?roomId=${roomId}`)
          if (response.ok) {
            const roomData = await response.json()
            const queuePayload: QueueUpdatedPayload = {
              roomId,
              queue: roomData.queue || [],
            }
            console.log('Fetched updated queue from database:', queuePayload.queue.length, 'items')
            callbacks.onQueueUpdated!(queuePayload)
          } else {
            console.error('Failed to fetch room data:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('Failed to fetch updated queue:', error)
          // Fallback: rely on broadcast events
        }
      }
    )

    // Also listen to broadcast events as fallback
    channel.on('broadcast', { event: REALTIME_EVENTS.QUEUE_UPDATED }, (payload) => {
      callbacks.onQueueUpdated!(payload.payload as QueueUpdatedPayload)
    })
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

// Broadcast helpers for API routes
export const broadcastQueueUpdate = async (roomId: string, payload: QueueUpdatedPayload) => {
  const channel = supabase.channel(getChannelName(roomId))
  await channel.send({
    type: 'broadcast',
    event: REALTIME_EVENTS.QUEUE_UPDATED,
    payload,
  })
}

export const broadcastPlaybackControl = async (roomId: string, payload: PlaybackControlPayload) => {
  const channel = supabase.channel(getChannelName(roomId))
  await channel.send({
    type: 'broadcast',
    event: REALTIME_EVENTS.PLAYBACK_CONTROL,
    payload,
  })
}

export const broadcastSongChanged = async (roomId: string, payload: SongChangedPayload) => {
  const channel = supabase.channel(getChannelName(roomId))
  await channel.send({
    type: 'broadcast',
    event: REALTIME_EVENTS.SONG_CHANGED,
    payload,
  })
}
