import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Anime, AnimeEditInput } from '@/types/anime';

interface AnimeState {
  animes: Anime[];
  searchTerm: string;
  filters: {
    status: string;
    genre: string;
    year: number | null;
    rating: number | null;
  };
  setSearchTerm: (term: string) => void;
  setFilter: (key: keyof AnimeState['filters'], value: any) => void;
  addAnime: (anime: Omit<Anime, 'id'>) => void;
  updateAnime: (id: string, anime: Partial<Anime>) => void;
  deleteAnime: (id: string) => void;
  togglePin: (id: string) => void;
  initializeStore: () => void;
}

const initialState: Pick<AnimeState, 'animes' | 'searchTerm' | 'filters'> = {
  animes: [],
  searchTerm: '',
  filters: {
    status: '',
    genre: '',
    year: null,
    rating: null,
  },
};

export const useAnimeStore = create<AnimeState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setSearchTerm: (term) => set({ searchTerm: term }),
      setFilter: (key, value) => 
        set((state) => ({
          filters: { ...state.filters, [key]: value }
        })),
      addAnime: (anime) => {
        const newAnime = {
          ...anime,
          id: uuidv4(),
          isPinned: false,
        };
        
        // Get current animes and add new one
        const currentAnimes = get().animes || [];
        const updatedAnimes = [...currentAnimes, newAnime];
        
        set({ animes: updatedAnimes });
        
        // Force save to localStorage
        localStorage.setItem('anime-storage', JSON.stringify({
          state: { animes: updatedAnimes },
          version: 0,
        }));
        
        console.log('Added new anime:', newAnime);
        console.log('Updated store state:', get());
      },
      updateAnime: (id, updatedAnime) =>
        set((state) => ({
          animes: state.animes.map((anime) =>
            anime.id === id ? { ...anime, ...updatedAnime } : anime
          )
        })),
      deleteAnime: (id) =>
        set((state) => ({
          animes: state.animes.filter((anime) => anime.id !== id)
        })),
      togglePin: (id) =>
        set((state) => ({
          animes: state.animes.map((anime) =>
            anime.id === id
              ? {
                  ...anime,
                  isPinned: !anime.isPinned,
                  pinnedAt: !anime.isPinned ? new Date().toISOString() : undefined,
                }
              : anime
          )
        })),
      initializeStore: () => {
        // Try to load from localStorage
        try {
          const stored = localStorage.getItem('anime-storage');
          if (stored) {
            const { state } = JSON.parse(stored);
            if (state?.animes) {
              set({ animes: state.animes });
            }
          }
        } catch (error) {
          console.error('Failed to initialize anime store:', error);
          set(initialState);
        }
      },
    }),
    {
      name: 'anime-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        animes: state.animes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Rehydrated anime state:', state);
        }
      },
    }
  )
);
