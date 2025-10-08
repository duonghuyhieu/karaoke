'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { subscribeToRoom, PlaybackControlPayload, SongChangedPayload } from '@/lib/supabase'
import type { Song } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface HostYouTubePlayerProps {
  currentSong: Song | null
  roomId: string
}

// Local YouTube API types for this component
type YouTubePlayer = {
  loadVideoById: (videoId: string) => void
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  getPlayerState: () => number
  getCurrentTime: () => number
  getDuration: () => number
  setVolume: (volume: number) => void
  getVolume: () => number
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  destroy: () => void
}

type YouTubePlayerEvent = {
  target: YouTubePlayer
  data?: number
}

export function HostYouTubePlayer({ currentSong, roomId }: HostYouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const [player, setPlayer] = useState<YouTubePlayer | null>(null)
  const [isYTReady, setIsYTReady] = useState(false)

  // Auto-advance to next song when current song ends
  const handleAutoNext = useCallback(async () => {
    try {
      console.log('Auto-advancing to next song for room:', roomId)
      const response = await fetch(`/api/rooms/${roomId}/playback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'auto-next' }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to auto-advance:', error)
      } else {
        console.log('Successfully auto-advanced to next song')
      }
    } catch (error) {
      console.error('Error auto-advancing to next song:', error)
    }
  }, [roomId])

  // Load YouTube API
  useEffect(() => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      setIsYTReady(true)
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]')
    if (existingScript) {
      // Script is already loading, just wait for it
      window.onYouTubeIframeAPIReady = () => {
        setIsYTReady(true)
      }
      return
    }

    // Load the YouTube API script
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API ready')
      setIsYTReady(true)
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onload = () => {
      console.log('YouTube API script loaded')
    }
    script.onerror = () => {
      console.error('Failed to load YouTube API script')
    }
    document.body.appendChild(script)

    return () => {
      // Don't remove the script as it might be used by other components
      // Just clean up the callback
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = () => { }
      }
    }
  }, [])

  // Initialize player when YouTube API is ready
  useEffect(() => {
    if (!isYTReady || !playerRef.current || player) return

    console.log('Initializing YouTube player...')

    try {
      const ytPlayer = new window.YT.Player(playerRef.current, {
        height: '400',
        width: '100%',
        videoId: currentSong?.youtubeId || 'dQw4w9WgXcQ', // Default video if no song
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          fs: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: YouTubePlayerEvent) => {
            console.log('YouTube player ready')
            setPlayer(event.target)

            // If we have a current song, load it immediately after player is ready
            if (currentSong) {
              console.log('Loading current song on player ready:', currentSong.title)
              setTimeout(() => {
                try {
                  event.target.loadVideoById(currentSong.youtubeId)
                } catch (error) {
                  console.error('Failed to load video on ready:', error)
                }
              }, 100) // Small delay to ensure player is fully ready
            }
          },
          onStateChange: (event: YouTubePlayerEvent) => {
            const state = event.data ?? -1
            console.log('Player state changed:', state)

            // YouTube player states:
            // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            if (state === 0) {
              // Video ended, automatically advance to next song
              console.log('Video ended, auto-advancing to next song')
              handleAutoNext()
            }
          },
          onError: (event: YouTubePlayerEvent) => {
            console.error('YouTube player error:', event.data)
            // Error codes: 2 (invalid parameter), 5 (HTML5 player error), 100 (video not found), 101/150 (not allowed in embedded players)
          },
        },
      })
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error)
    }
  }, [isYTReady, player, handleAutoNext, currentSong]) // Added currentSong dependency

  // Handle song changes from props
  useEffect(() => {
    if (!player || !currentSong) {
      console.log('Player or currentSong not ready:', { player: !!player, currentSong: !!currentSong })
      return
    }

    console.log('Loading new video from props:', currentSong.title, 'ID:', currentSong.youtubeId)

    try {
      player.loadVideoById(currentSong.youtubeId)
    } catch (error) {
      console.error('Failed to load video:', error)
    }
  }, [player, currentSong])

  // Listen for real-time playback controls
  useEffect(() => {
    if (!roomId || !player) return

    let channel: RealtimeChannel | null = null
    let isSubscribed = false

    const setupPlaybackSubscription = async () => {
      try {
        console.log('Setting up YouTube player real-time subscription')

        channel = subscribeToRoom(roomId, {
          onPlaybackControl: (data: PlaybackControlPayload) => {
            if (!player) {
              console.warn('Player not ready for playback control:', data.action)
              return
            }

            console.log('YouTube player received playback control:', data.action)

            switch (data.action) {
              case 'play':
                player.playVideo()
                break
              case 'pause':
                player.pauseVideo()
                break
              case 'stop':
                player.stopVideo()
                break
              case 'next':
              case 'previous':
                // These are handled by the song change event
                break
              case 'volume':
                if (data.volume !== undefined) {
                  player.setVolume(data.volume)
                  console.log('Volume set to:', data.volume)
                }
                break
              case 'mute':
                player.mute()
                console.log('Player muted')
                break
              case 'unmute':
                player.unMute()
                console.log('Player unmuted')
                break
            }
          },
          onSongChanged: (data: SongChangedPayload) => {
            if (!player || !data.song) {
              console.warn('Player not ready for song change:', data.song?.title)
              return
            }

            console.log('YouTube player loading new song:', data.song.title)
            player.loadVideoById(data.song.youtubeId)
          }
        })

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED' && !isSubscribed) {
            console.log('YouTube player real-time subscription active')
            isSubscribed = true
          }
        })

      } catch (error) {
        console.error('Failed to subscribe to playback controls:', error)
      }
    }

    setupPlaybackSubscription()

    return () => {
      console.log('Cleaning up YouTube player real-time subscription')
      if (channel && isSubscribed) {
        channel.unsubscribe()
        isSubscribed = false
      }
    }
  }, [roomId, player])

  if (!currentSong) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center">
        <div className="text-center text-white/40">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2 text-white/60">Chưa có bài hát</h3>
          <p className="text-sm text-white/40">
            Thêm bài hát để bắt đầu karaoke
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video bg-black">
      <div ref={playerRef} className="w-full h-full" />
    </div>
  )
}
