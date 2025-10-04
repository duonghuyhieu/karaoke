'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useQueueStore } from '@/store/useQueueStore';
import { useUIStore } from '@/store/useUIStore';
import { KEYBOARD_SHORTCUTS } from '@/lib/constants';

export function useKeyboardShortcuts() {
  const {
    play,
    pause,
    playerState,
    toggleFullscreen,
    volume,
    setVolume,
    seekTo,
    currentTime,
    duration
  } = usePlayerStore();

  const { nextSong, previousSong, getCurrentSong } = useQueueStore();
  const { closePanel, togglePanel } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or if modifiers are pressed
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        // Allow some shortcuts with modifiers
        if (event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case KEYBOARD_SHORTCUTS.NEXT.toLowerCase():
              event.preventDefault();
              nextSong();
              break;
            case KEYBOARD_SHORTCUTS.PREVIOUS.toLowerCase():
              event.preventDefault();
              previousSong();
              break;
          }
        }
        return;
      }

      const currentSong = getCurrentSong();
      if (!currentSong && event.key !== KEYBOARD_SHORTCUTS.ESCAPE) {
        return; // Only allow escape when no song is playing
      }

      switch (event.key) {
        case KEYBOARD_SHORTCUTS.PLAY_PAUSE:
          event.preventDefault();
          if (playerState === 'playing') {
            pause();
          } else {
            play();
          }
          break;

        case KEYBOARD_SHORTCUTS.NEXT.toLowerCase():
          event.preventDefault();
          nextSong();
          break;

        case KEYBOARD_SHORTCUTS.PREVIOUS.toLowerCase():
          event.preventDefault();
          previousSong();
          break;

        case KEYBOARD_SHORTCUTS.FULLSCREEN.toLowerCase():
          event.preventDefault();
          toggleFullscreen();
          break;

        case KEYBOARD_SHORTCUTS.ESCAPE:
          event.preventDefault();
          closePanel();
          break;

        case KEYBOARD_SHORTCUTS.VOLUME_UP:
          event.preventDefault();
          setVolume(Math.min(100, volume + 5));
          break;

        case KEYBOARD_SHORTCUTS.VOLUME_DOWN:
          event.preventDefault();
          setVolume(Math.max(0, volume - 5));
          break;

        case KEYBOARD_SHORTCUTS.SEEK_FORWARD:
          event.preventDefault();
          if (duration > 0) {
            seekTo(Math.min(duration, currentTime + 10));
          }
          break;

        case KEYBOARD_SHORTCUTS.SEEK_BACKWARD:
          event.preventDefault();
          if (duration > 0) {
            seekTo(Math.max(0, currentTime - 10));
          }
          break;

        // Toggle panel with 'm' key
        case 'm':
        case 'M':
          event.preventDefault();
          togglePanel();
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    play,
    pause,
    playerState,
    toggleFullscreen,
    volume,
    setVolume,
    seekTo,
    currentTime,
    duration,
    nextSong,
    previousSong,
    getCurrentSong,
    closePanel,
    togglePanel,
  ]);
}
