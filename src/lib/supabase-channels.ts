import { supabase, getChannelName, REALTIME_EVENTS } from './supabase'
import type { QueueUpdatedPayload, PlaybackControlPayload, SongChangedPayload } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Channel pool for reusing Supabase channels
 * This eliminates the overhead of creating new channels for every broadcast
 */
class ChannelPool {
  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptionPromises: Map<string, Promise<void>> = new Map()

  /**
   * Get or create a channel for a room
   * Ensures the channel is subscribed before returning
   */
  async getChannel(roomId: string): Promise<RealtimeChannel> {
    const channelName = getChannelName(roomId)

    // Return existing channel if available
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    // Check if subscription is in progress
    if (this.subscriptionPromises.has(channelName)) {
      await this.subscriptionPromises.get(channelName)
      return this.channels.get(channelName)!
    }

    // Create new channel and subscribe
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true }, // Receive own broadcasts for debugging
        presence: { key: '' },
      },
    })

    // Create subscription promise
    const subscriptionPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Channel subscription timeout for ${channelName}`))
      }, 5000)

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout)
          console.log(`✅ Channel ${channelName} subscribed`)
          resolve()
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout)
          reject(new Error(`Channel subscription failed: ${status}`))
        }
      })
    })

    this.subscriptionPromises.set(channelName, subscriptionPromise)

    try {
      await subscriptionPromise
      this.channels.set(channelName, channel)
      this.subscriptionPromises.delete(channelName)
      return channel
    } catch (error) {
      this.subscriptionPromises.delete(channelName)
      throw error
    }
  }

  /**
   * Remove and unsubscribe a channel
   */
  async removeChannel(roomId: string): Promise<void> {
    const channelName = getChannelName(roomId)
    const channel = this.channels.get(channelName)

    if (channel) {
      await channel.unsubscribe()
      this.channels.delete(channelName)
      console.log(`🔌 Channel ${channelName} removed`)
    }
  }

  /**
   * Clean up all channels
   */
  async cleanup(): Promise<void> {
    const unsubscribePromises = Array.from(this.channels.values()).map(channel =>
      channel.unsubscribe()
    )
    await Promise.all(unsubscribePromises)
    this.channels.clear()
    this.subscriptionPromises.clear()
  }
}

// Global channel pool instance
const channelPool = new ChannelPool()

/**
 * Optimized broadcast helpers that reuse channels
 */
export const broadcastQueueUpdate = async (roomId: string, payload: QueueUpdatedPayload) => {
  try {
    const channel = await channelPool.getChannel(roomId)
    await channel.send({
      type: 'broadcast',
      event: REALTIME_EVENTS.QUEUE_UPDATED,
      payload,
    })
    console.log(`📤 Broadcasted queue update for room ${roomId}`)
  } catch (error) {
    console.error(`Failed to broadcast queue update for room ${roomId}:`, error)
    throw error
  }
}

export const broadcastPlaybackControl = async (roomId: string, payload: PlaybackControlPayload) => {
  try {
    const channel = await channelPool.getChannel(roomId)
    await channel.send({
      type: 'broadcast',
      event: REALTIME_EVENTS.PLAYBACK_CONTROL,
      payload,
    })
    console.log(`📤 Broadcasted playback control for room ${roomId}`)
  } catch (error) {
    console.error(`Failed to broadcast playback control for room ${roomId}:`, error)
    throw error
  }
}

export const broadcastSongChanged = async (roomId: string, payload: SongChangedPayload) => {
  try {
    const channel = await channelPool.getChannel(roomId)
    await channel.send({
      type: 'broadcast',
      event: REALTIME_EVENTS.SONG_CHANGED,
      payload,
    })
    console.log(`📤 Broadcasted song changed for room ${roomId}`)
  } catch (error) {
    console.error(`Failed to broadcast song changed for room ${roomId}:`, error)
    throw error
  }
}

/**
 * Cleanup channel for a specific room (call when room is deleted)
 */
export const cleanupRoomChannel = async (roomId: string) => {
  await channelPool.removeChannel(roomId)
}

/**
 * Cleanup all channels (call on app shutdown)
 */
export const cleanupAllChannels = async () => {
  await channelPool.cleanup()
}
