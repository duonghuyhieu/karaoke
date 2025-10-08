import { useState, useEffect, useCallback } from 'react'
import { subscribeToRoom, QueueUpdatedPayload, PlaybackControlPayload, SongChangedPayload } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Song {
  id: string
  title: string
  artist: string
  youtubeId: string
  duration: string
  thumbnail?: string | null
  channelTitle?: string | null
}

export interface QueueItem {
  id: string
  position: number
  song: Song
}

export interface HistoryItem {
  id: string
  playedAt: string
  duration?: number | null
  song: Song
}

export interface Room {
  id: string
  roomId: string
  currentSongId?: string | null
  isActive: boolean
  currentSong?: Song | null
  queue: QueueItem[]
  history?: HistoryItem[]
}

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  // Fetch room data
  const fetchRoom = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/rooms?roomId=${id}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch room')
      }

      const roomData = await response.json()
      console.log(`🏠 Room data fetched for ${id}:`, {
        queue: roomData.queue?.length || 0,
        history: roomData.history?.length || 0,
        currentSong: roomData.currentSong?.title || 'None'
      })
      setRoom(roomData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch room')
      setRoom(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new room
  const createRoom = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create room')
      }

      const roomData = await response.json()
      // Don't set room here, let the host page handle it after navigation
      // setRoom(roomData)
      // Don't set loading to false if we successfully created a room
      // Let the fetchRoom handle that
      return roomData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
      setLoading(false)
      return null
    }
  }, [])

  // Add song to queue
  const addToQueue = useCallback(async (song: Omit<Song, 'id'> & { addPosition?: 'next' | 'end' }) => {
    if (!room) return false

    try {
      const response = await fetch(`/api/rooms/${room.roomId}/queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(song),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add song to queue')
      }

      // Don't fetch - rely on real-time updates for immediate feedback
      // The broadcast event will update the UI faster than a HTTP fetch
      // await fetchRoom(room.roomId)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add song to queue')
      return false
    }
  }, [room, fetchRoom])

  // Remove song from queue
  const removeFromQueue = useCallback(async (queueItemId: string) => {
    if (!room) return false

    try {
      const response = await fetch(`/api/rooms/${room.roomId}/queue?queueItemId=${queueItemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove song from queue')
      }

      // Don't fetch - rely on real-time updates for immediate feedback
      // The broadcast event will update the UI faster than a HTTP fetch
      // await fetchRoom(room.roomId)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove song from queue')
      return false
    }
  }, [room, fetchRoom])

  // Control playback
  const controlPlayback = useCallback(async (action: 'play' | 'pause' | 'stop' | 'next' | 'previous') => {
    if (!room) return false

    try {
      const response = await fetch(`/api/rooms/${room.roomId}/playback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to control playback')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to control playback')
      return false
    }
  }, [room])

  // Reorder queue item
  const reorderQueueItem = useCallback(async (queueItemId: string, direction: 'up' | 'down') => {
    if (!room) return false

    try {
      const response = await fetch(`/api/rooms/${room.roomId}/queue/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queueItemId, direction }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reorder queue')
      }

      // Don't fetch - rely on real-time updates for immediate feedback
      // The broadcast event will update the UI faster than a HTTP fetch
      // await fetchRoom(room.roomId)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder queue')
      return false
    }
  }, [room, fetchRoom])

  // Bulk reorder queue items
  const bulkReorderQueue = useCallback(async (queueItems: Array<{ id: string; position: number }>) => {
    if (!room) return false

    try {
      const response = await fetch(`/api/rooms/${room.roomId}/queue/bulk-reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queueItems }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to bulk reorder queue')
      }

      // Don't fetch - rely on real-time updates for immediate feedback
      // The broadcast event will update the UI faster than a HTTP fetch
      // await fetchRoom(room.roomId)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk reorder queue')
      return false
    }
  }, [room, fetchRoom])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!roomId) {
      setConnected(false)
      return
    }

    let channel: RealtimeChannel | null = null
    let isSubscribed = false
    let isMounted = true
    let connectionTimeout: NodeJS.Timeout | null = null

    const setupSubscription = async () => {
      try {
        console.log(`Setting up real-time subscription for room: ${roomId}`)

        channel = subscribeToRoom(roomId, {
          onQueueUpdated: (data: QueueUpdatedPayload) => {
            if (!isMounted) return
            console.log('🎵 Queue updated via real-time:', data.queue.length, 'items')
            setRoom(prev => prev ? {
              ...prev,
              queue: data.queue,
            } : null)

            // Force a re-render to ensure UI updates
            setLoading(false)
          },
          onSongChanged: (data: SongChangedPayload) => {
            if (!isMounted) return
            console.log('🎤 Song changed via real-time:', data.song?.title)
            setRoom(prev => prev ? {
              ...prev,
              currentSong: data.song,
              currentSongId: data.currentSongId,
            } : null)
          },
          onPlaybackControl: (data: PlaybackControlPayload) => {
            if (!isMounted) return
            console.log('🎮 Playback control received:', data.action)
          },
          onConnectionStatusChange: (status: string) => {
            if (!isMounted) return
            console.log(`Real-time connection status: ${status}`)

            // Clear any existing timeout
            if (connectionTimeout) {
              clearTimeout(connectionTimeout)
              connectionTimeout = null
            }

            switch (status) {
              case 'SUBSCRIBED':
                setConnected(true)
                isSubscribed = true
                console.log('✅ Real-time connection established')
                break
              case 'CHANNEL_ERROR':
              case 'TIMED_OUT':
                console.log('❌ Real-time connection error:', status)
                setConnected(false)
                isSubscribed = false
                break
              case 'CLOSED':
                console.log('🔌 Real-time connection closed')
                // Only set disconnected if we were previously connected
                if (isSubscribed) {
                  setConnected(false)
                  isSubscribed = false
                }
                break
            }
          },
        })

        // The subscription and status monitoring is now handled in the subscribeToRoom callback

        // Set a timeout to detect if connection is taking too long
        connectionTimeout = setTimeout(() => {
          if (isMounted && !isSubscribed) {
            console.log('⏰ Real-time connection timeout - assuming connected for now')
            // Don't set connected to false here, as the connection might still work
            // The actual connection status will be updated when we receive events
          }
        }, 5000)

      } catch (error) {
        if (!isMounted) return
        console.error('Failed to subscribe to room updates:', error)
        setConnected(false)
        setError('Failed to connect to real-time updates')
      }
    }

    setupSubscription()

    return () => {
      console.log(`Cleaning up real-time subscription for room: ${roomId}`)
      isMounted = false

      // Clear timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout)
        connectionTimeout = null
      }

      // Unsubscribe from channel
      if (channel) {
        channel.unsubscribe()
        channel = null
      }

      isSubscribed = false
    }
  }, [roomId])

  // Fetch room data when roomId changes
  useEffect(() => {
    if (roomId) {
      fetchRoom(roomId)
    } else {
      setRoom(null)
    }
  }, [roomId, fetchRoom])

  return {
    room,
    loading,
    error,
    connected,
    createRoom,
    fetchRoom,
    addToQueue,
    removeFromQueue,
    controlPlayback,
    reorderQueueItem,
    bulkReorderQueue,
  }
}
