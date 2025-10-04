import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface UIState {
  // Panel state
  isPanelOpen: boolean;

  // Theme
  theme: Theme;

  // Search state
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
  searchError: string | null;

  // Mobile state
  isMobile: boolean;

  // Bubble position (for mobile dragging)
  bubblePosition: { x: number; y: number };

  // Actions
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;

  setTheme: (theme: Theme) => void;

  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  setSearching: (searching: boolean) => void;
  setSearchError: (error: string | null) => void;
  clearSearch: () => void;

  setIsMobile: (isMobile: boolean) => void;
  setBubblePosition: (position: { x: number; y: number }) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPanelOpen: false,
      theme: 'system',
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      searchError: null,
      isMobile: false,
      bubblePosition: { x: 20, y: 20 }, // Default position from bottom-right

      // Panel actions
      togglePanel: () => set(state => ({ isPanelOpen: !state.isPanelOpen })),
      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => set({ isPanelOpen: false }),

      // Theme actions
      setTheme: (theme: Theme) => {
        set({ theme });

        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.toggle('dark', systemTheme === 'dark');
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
      },

      // Search actions
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSearchResults: (results: any[]) => set({ searchResults: results }),
      setSearching: (searching: boolean) => set({ isSearching: searching }),
      setSearchError: (error: string | null) => set({ searchError: error }),
      clearSearch: () => set({
        searchQuery: '',
        searchResults: [],
        isSearching: false,
        searchError: null
      }),

      // Mobile actions
      setIsMobile: (isMobile: boolean) => set({ isMobile }),
      setBubblePosition: (position: { x: number; y: number }) => set({ bubblePosition: position }),
    }),
    {
      name: 'karaoke-ui',
      partialize: (state) => ({
        theme: state.theme,
        bubblePosition: state.bubblePosition,
      }),
      skipHydration: true,
    }
  )
);
