import {
  validateRoomId,
  validateSong,
  validateYouTubeId,
  validateSearchQuery,
  validatePlaybackAction,
} from '@/lib/validation'

describe('Validation Functions', () => {
  describe('validateRoomId', () => {
    it('should validate correct room IDs', () => {
      expect(validateRoomId('1234')).toEqual({ isValid: true })
      expect(validateRoomId('0000')).toEqual({ isValid: true })
      expect(validateRoomId('9999')).toEqual({ isValid: true })
    })

    it('should reject invalid room IDs', () => {
      expect(validateRoomId('')).toEqual({ isValid: false, error: 'Room ID is required' })
      expect(validateRoomId('123')).toEqual({ isValid: false, error: 'Room ID must be exactly 4 digits' })
      expect(validateRoomId('12345')).toEqual({ isValid: false, error: 'Room ID must be exactly 4 digits' })
      expect(validateRoomId('abcd')).toEqual({ isValid: false, error: 'Room ID must be exactly 4 digits' })
    })
  })

  describe('validateSong', () => {
    const validSong = {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Test Song',
      artist: 'Test Artist',
      duration: '3:30',
    }

    it('should validate correct songs', () => {
      expect(validateSong(validSong)).toEqual({ isValid: true })
    })

    it('should reject songs with missing fields', () => {
      expect(validateSong(null as any)).toEqual({ isValid: false, error: 'Song data is required' })
      expect(validateSong({})).toEqual({ isValid: false, error: 'Valid YouTube ID is required' })
      expect(validateSong({ ...validSong, youtubeId: '' })).toEqual({ isValid: false, error: 'Valid YouTube ID is required' })
      expect(validateSong({ ...validSong, title: '' })).toEqual({ isValid: false, error: 'Song title is required' })
      expect(validateSong({ ...validSong, artist: '' })).toEqual({ isValid: false, error: 'Artist name is required' })
    })
  })

  describe('validateYouTubeId', () => {
    it('should validate correct YouTube IDs', () => {
      expect(validateYouTubeId('dQw4w9WgXcQ')).toEqual({ isValid: true })
      expect(validateYouTubeId('kJQP7kiw5Fk')).toEqual({ isValid: true })
    })

    it('should reject invalid YouTube IDs', () => {
      expect(validateYouTubeId('')).toEqual({ isValid: false, error: 'YouTube ID is required' })
      expect(validateYouTubeId('short')).toEqual({ isValid: false, error: 'Invalid YouTube video ID format' })
      expect(validateYouTubeId('toolongtobevalid')).toEqual({ isValid: false, error: 'Invalid YouTube video ID format' })
    })
  })

  describe('validateSearchQuery', () => {
    it('should validate correct search queries', () => {
      expect(validateSearchQuery('karaoke')).toEqual({ isValid: true })
      expect(validateSearchQuery('test song')).toEqual({ isValid: true })
    })

    it('should reject invalid search queries', () => {
      expect(validateSearchQuery('')).toEqual({ isValid: false, error: 'Search query is required' })
      expect(validateSearchQuery('a')).toEqual({ isValid: false, error: 'Search query must be at least 2 characters long' })
      expect(validateSearchQuery('a'.repeat(101))).toEqual({ isValid: false, error: 'Search query must be less than 100 characters' })
    })
  })

  describe('validatePlaybackAction', () => {
    it('should validate correct playback actions', () => {
      expect(validatePlaybackAction('play')).toEqual({ isValid: true })
      expect(validatePlaybackAction('pause')).toEqual({ isValid: true })
      expect(validatePlaybackAction('stop')).toEqual({ isValid: true })
      expect(validatePlaybackAction('next')).toEqual({ isValid: true })
      expect(validatePlaybackAction('previous')).toEqual({ isValid: true })
    })

    it('should reject invalid playback actions', () => {
      expect(validatePlaybackAction('')).toEqual({ isValid: false, error: 'Playback action is required' })
      expect(validatePlaybackAction('invalid')).toEqual({
        isValid: false,
        error: 'Invalid playback action. Must be one of: play, pause, stop, next, previous'
      })
    })
  })
})
