import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Episode, EpisodeInput } from '@/types/anime';

interface EpisodeState {
  episodes: Episode[];
  searchTerm: string;
  addEpisode: (episode: EpisodeInput) => void;
  updateEpisode: (id: string, episode: Partial<Episode>) => void;
  deleteEpisode: (id: string) => void;
  getAnimeEpisodes: (animeId: string) => Episode[];
  setSearchTerm: (term: string) => void;
}

export const useEpisodeStore = create<EpisodeState>()(
  persist(
    (set, get) => ({
      episodes: [],
      searchTerm: '',
      addEpisode: (episode) => {
        const newEpisode: Episode = {
          ...episode,
          id: uuidv4(),
          releaseDate: episode.releaseDate ? new Date(episode.releaseDate) : undefined,
        };
        
        set((state) => ({
          episodes: [...state.episodes, newEpisode]
        }));

        console.log('Added new episode:', newEpisode);
      },
      updateEpisode: (id, updatedEpisode) =>
        set((state) => ({
          episodes: state.episodes.map((episode) =>
            episode.id === id ? { ...episode, ...updatedEpisode } : episode
          )
        })),
      deleteEpisode: (id) =>
        set((state) => ({
          episodes: state.episodes.filter((episode) => episode.id !== id)
        })),
      getAnimeEpisodes: (animeId) => {
        const { episodes } = get();
        return episodes
          .filter((episode) => episode.animeId === animeId)
          .sort((a, b) => a.number - b.number);
      },
      setSearchTerm: (term) => set({ searchTerm: term }),
    }),
    {
      name: 'episode-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.episodes) {
          // Convert date strings back to Date objects
          state.episodes = state.episodes.map(episode => ({
            ...episode,
            releaseDate: episode.releaseDate ? new Date(episode.releaseDate) : undefined
          }));
        }
      },
    }
  )
);
