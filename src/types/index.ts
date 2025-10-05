// Re-export types from hooks for consistency
export type { Song, QueueItem, HistoryItem, Room } from '@/hooks/useRoom'

// Additional shared types
export interface SearchResult {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
  duration: string
  videoId: string
}

export interface RoomCodeInputProps {
  onJoin: (roomId: string) => void
  loading?: boolean
  error?: string | null
}

export interface PlaybackControlsProps {
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onNext: () => void
  onPrevious: () => void
  disabled?: boolean
}

// Import types for use in interfaces
import type { Song, QueueItem } from '@/hooks/useRoom'

export interface QueueDisplayProps {
  queue: QueueItem[]
  currentSongId?: string | null
  onRemove?: (queueItemId: string) => void
  onPlay?: (queueItemId: string) => void
  onReorder?: (queueItemId: string, direction: 'up' | 'down') => void
  showControls?: boolean
}

export interface SongSearchProps {
  onAddToQueue: (song: Omit<Song, 'id'>) => void
  disabled?: boolean
}

// YouTube Player types
export interface YouTubePlayerProps {
  videoId?: string
  onReady?: () => void
  onStateChange?: (state: number) => void
  onEnd?: () => void
  autoplay?: boolean
  controls?: boolean
  height?: number
  width?: number
}

// Room validation
export const isValidRoomId = (roomId: string): boolean => {
  return /^\d{4}$/.test(roomId)
}

// Format duration helper
export const formatDuration = (duration: string): string => {
  // YouTube duration format is PT#M#S or PT#H#M#S
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return duration

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
