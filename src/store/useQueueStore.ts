import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Song {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
  videoId: string;
}

interface QueueState {
  queue: Song[];
  currentIndex: number;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  setCurrentIndex: (index: number) => void;
  nextSong: () => void;
  previousSong: () => void;
  getCurrentSong: () => Song | null;
  getNextSong: () => Song | null;
  getPreviousSong: () => Song | null;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: -1,

      addToQueue: (song: Song) => {
        set(state => {
          const newQueue = [...state.queue, song];
          const newCurrentIndex = state.currentIndex === -1 ? 0 : state.currentIndex;
          return {
            queue: newQueue,
            currentIndex: newCurrentIndex,
          };
        });
      },

      removeFromQueue: (index: number) => {
        set(state => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          let newCurrentIndex = state.currentIndex;

          if (newQueue.length === 0) {
            newCurrentIndex = -1;
          } else if (index < state.currentIndex) {
            newCurrentIndex = state.currentIndex - 1;
          } else if (index === state.currentIndex) {
            // If we removed the current song, stay at the same index
            // unless it's now out of bounds
            if (newCurrentIndex >= newQueue.length) {
              newCurrentIndex = newQueue.length - 1;
            }
          }

          return {
            queue: newQueue,
            currentIndex: newCurrentIndex,
          };
        });
      },

      clearQueue: () => {
        set({ queue: [], currentIndex: -1 });
      },

      reorderQueue: (startIndex: number, endIndex: number) => {
        set(state => {
          const newQueue = [...state.queue];
          const [reorderedItem] = newQueue.splice(startIndex, 1);
          newQueue.splice(endIndex, 0, reorderedItem);

          let newCurrentIndex = state.currentIndex;
          if (state.currentIndex === startIndex) {
            newCurrentIndex = endIndex;
          } else if (startIndex < state.currentIndex && endIndex >= state.currentIndex) {
            newCurrentIndex = state.currentIndex - 1;
          } else if (startIndex > state.currentIndex && endIndex <= state.currentIndex) {
            newCurrentIndex = state.currentIndex + 1;
          }

          return {
            queue: newQueue,
            currentIndex: newCurrentIndex,
          };
        });
      },

      setCurrentIndex: (index: number) => {
        set(state => ({
          currentIndex: Math.max(-1, Math.min(index, state.queue.length - 1)),
        }));
      },

      nextSong: () => {
        set(state => {
          if (state.queue.length === 0) return state;
          const nextIndex = (state.currentIndex + 1) % state.queue.length;
          return { currentIndex: nextIndex };
        });
      },

      previousSong: () => {
        set(state => {
          if (state.queue.length === 0) return state;
          const prevIndex = state.currentIndex <= 0
            ? state.queue.length - 1
            : state.currentIndex - 1;
          return { currentIndex: prevIndex };
        });
      },

      getCurrentSong: () => {
        const state = get();
        return state.currentIndex >= 0 && state.currentIndex < state.queue.length
          ? state.queue[state.currentIndex]
          : null;
      },

      getNextSong: () => {
        const state = get();
        if (state.queue.length === 0) return null;
        const nextIndex = (state.currentIndex + 1) % state.queue.length;
        return state.queue[nextIndex];
      },

      getPreviousSong: () => {
        const state = get();
        if (state.queue.length === 0) return null;
        const prevIndex = state.currentIndex <= 0
          ? state.queue.length - 1
          : state.currentIndex - 1;
        return state.queue[prevIndex];
      },
    }),
    {
      name: 'karaoke-queue',
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
      }),
      skipHydration: true,
    }
  )
);
