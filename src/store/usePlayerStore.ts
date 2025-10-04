import { create } from 'zustand';

export type PlayerState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';

interface YTPlayer {
  loadVideoById: (options: { videoId: string; startSeconds?: number; suggestedQuality?: string } | string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
}

// Browser compatibility types
interface ExtendedHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface ExtendedDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface PlayerStoreState {
  // Player state
  playerState: PlayerState;
  isFullscreen: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;

  // Player instance
  player: YTPlayer | null; // YouTube player instance

  // Actions
  setPlayerState: (state: PlayerState) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPlayer: (player: YTPlayer | null) => void;

  // Player controls
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  toggleFullscreen: () => void;
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  // Initial state
  playerState: 'unstarted',
  isFullscreen: false,
  volume: 80,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  player: null,

  // State setters
  setPlayerState: (state: PlayerState) => set({ playerState: state }),
  setFullscreen: (fullscreen: boolean) => set({ isFullscreen: fullscreen }),
  setVolume: (volume: number) => {
    set({ volume });
    const { player } = get();
    if (player && player.setVolume) {
      player.setVolume(volume);
    }
  },
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  setPlayer: (player: YTPlayer | null) => set({ player }),

  // Player controls
  play: () => {
    const { player } = get();
    if (player && player.playVideo) {
      player.playVideo();
    }
  },

  pause: () => {
    const { player } = get();
    if (player && player.pauseVideo) {
      player.pauseVideo();
    }
  },

  seekTo: (time: number) => {
    const { player } = get();
    if (player && player.seekTo) {
      player.seekTo(time, true);
    }
  },

  toggleFullscreen: () => {
    const { isFullscreen } = get();
    const newFullscreenState = !isFullscreen;

    if (newFullscreenState) {
      // Enter fullscreen
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as ExtendedHTMLElement).webkitRequestFullscreen) {
        (element as ExtendedHTMLElement).webkitRequestFullscreen?.();
      } else if ((element as ExtendedHTMLElement).msRequestFullscreen) {
        (element as ExtendedHTMLElement).msRequestFullscreen?.();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as ExtendedDocument).webkitExitFullscreen) {
        (document as ExtendedDocument).webkitExitFullscreen?.();
      } else if ((document as ExtendedDocument).msExitFullscreen) {
        (document as ExtendedDocument).msExitFullscreen?.();
      }
    }

    set({ isFullscreen: newFullscreenState });
  },
}));
