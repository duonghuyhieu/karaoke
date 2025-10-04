// YouTube API constants
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
export const YOUTUBE_SEARCH_ENDPOINT = `${YOUTUBE_API_BASE_URL}/search`;
export const YOUTUBE_VIDEOS_ENDPOINT = `${YOUTUBE_API_BASE_URL}/videos`;

// Search configuration
export const DEFAULT_SEARCH_RESULTS = 20;
export const MAX_SEARCH_RESULTS = 50;
export const SEARCH_DEBOUNCE_MS = 500;

// Player configuration
export const DEFAULT_PLAYER_OPTIONS = {
  height: '100%',
  width: '100%',
  playerVars: {
    autoplay: 1,
    controls: 0,
    disablekb: 1,
    enablejsapi: 1,
    fs: 0,
    iv_load_policy: 3,
    modestbranding: 1,
    playsinline: 1,
    rel: 0,
    showinfo: 0,
  },
};

// UI constants
export const PANEL_ANIMATION_DURATION = 300;
export const BUBBLE_SIZE = 56;
export const PANEL_WIDTH = 400;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  NEXT: 'n',
  PREVIOUS: 'p',
  FULLSCREEN: 'f',
  ESCAPE: 'Escape',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'YouTube API key is not configured',
  SEARCH_FAILED: 'Failed to search for videos',
  VIDEO_LOAD_FAILED: 'Failed to load video',
  NETWORK_ERROR: 'Network error occurred',
  RATE_LIMIT_EXCEEDED: 'API rate limit exceeded. Please try again later.',
  INVALID_VIDEO: 'Invalid video ID',
} as const;
