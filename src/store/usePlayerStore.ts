import { create } from 'zustand';

export type PlayerState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';

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
  player: any; // YouTube player instance

  // Actions
  setPlayerState: (state: PlayerState) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPlayer: (player: any) => void;

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
  setPlayer: (player: any) => set({ player }),

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
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    
    set({ isFullscreen: newFullscreenState });
  },
}));
