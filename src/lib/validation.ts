// Room validation
export const validateRoomId = (roomId: string): { isValid: boolean; error?: string } => {
  if (!roomId) {
    return { isValid: false, error: 'Room ID is required' }
  }

  if (!/^\d{4}$/.test(roomId)) {
    return { isValid: false, error: 'Room ID must be exactly 4 digits' }
  }

  return { isValid: true }
}

// Song validation
interface SongInput {
  youtubeId?: unknown
  title?: unknown
  artist?: unknown
  duration?: unknown
  thumbnail?: unknown
}

export const validateSong = (song: SongInput): { isValid: boolean; error?: string } => {
  if (!song) {
    return { isValid: false, error: 'Song data is required' }
  }

  if (!song.youtubeId || typeof song.youtubeId !== 'string') {
    return { isValid: false, error: 'Valid YouTube ID is required' }
  }

  if (!song.title || typeof song.title !== 'string' || song.title.trim().length === 0) {
    return { isValid: false, error: 'Song title is required' }
  }

  if (!song.artist || typeof song.artist !== 'string' || song.artist.trim().length === 0) {
    return { isValid: false, error: 'Artist name is required' }
  }

  if (!song.duration || typeof song.duration !== 'string') {
    return { isValid: false, error: 'Song duration is required' }
  }

  return { isValid: true }
}

// YouTube ID validation
export const validateYouTubeId = (id: string): { isValid: boolean; error?: string } => {
  if (!id) {
    return { isValid: false, error: 'YouTube ID is required' }
  }

  // YouTube video IDs are 11 characters long and contain letters, numbers, hyphens, and underscores
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return { isValid: false, error: 'Invalid YouTube video ID format' }
  }

  return { isValid: true }
}

// Search query validation
export const validateSearchQuery = (query: string): { isValid: boolean; error?: string } => {
  if (!query) {
    return { isValid: false, error: 'Search query is required' }
  }

  if (query.trim().length < 2) {
    return { isValid: false, error: 'Search query must be at least 2 characters long' }
  }

  if (query.length > 100) {
    return { isValid: false, error: 'Search query must be less than 100 characters' }
  }

  return { isValid: true }
}

// Playback action validation
export const validatePlaybackAction = (action: string): { isValid: boolean; error?: string } => {
  const validActions = ['play', 'pause', 'stop', 'next', 'previous']

  if (!action) {
    return { isValid: false, error: 'Playback action is required' }
  }

  if (!validActions.includes(action)) {
    return { isValid: false, error: `Invalid playback action. Must be one of: ${validActions.join(', ')}` }
  }

  return { isValid: true }
}

// Environment variables validation
export const validateEnvironmentVariables = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
    errors.push('NEXT_PUBLIC_YOUTUBE_API_KEY is not set')
  }

  if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY) {
    errors.push('NEXT_PUBLIC_PUSHER_APP_KEY is not set')
  }

  if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
    errors.push('NEXT_PUBLIC_PUSHER_CLUSTER is not set')
  }

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generic API response validation
export const validateApiResponse = (response: Response): Promise<unknown> => {
  if (!response.ok) {
    return response.json().then(
      (errorData) => {
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      },
      () => {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    )
  }

  return response.json()
}
