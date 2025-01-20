import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AnimeListEntry, AnimeListStatus, AnimeListEntryInput } from '@/types/animelist';

interface AnimeListState {
  entries: AnimeListEntry[];
  addEntry: (userId: string, animeId: string, data: AnimeListEntryInput) => void;
  updateEntry: (id: string, data: Partial<AnimeListEntryInput>) => void;
  removeEntry: (id: string) => void;
  getEntriesByUser: (userId: string) => AnimeListEntry[];
  getEntryByAnime: (userId: string, animeId: string) => AnimeListEntry | undefined;
  getEntriesByStatus: (userId: string, status: AnimeListStatus) => AnimeListEntry[];
}

export const useAnimeListStore = create<AnimeListState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (userId, animeId, data) => {
        // Check if entry already exists
        const existingEntry = get().entries.find(
          entry => entry.userId === userId && entry.animeId === animeId
        );

        if (existingEntry) {
          // Update existing entry
          set(state => ({
            entries: state.entries.map(entry =>
              entry.id === existingEntry.id
                ? {
                    ...entry,
                    ...data,
                    updatedAt: new Date(),
                  }
                : entry
            ),
          }));
        } else {
          // Create new entry
          const newEntry: AnimeListEntry = {
            id: uuidv4(),
            userId,
            animeId,
            ...data,
            updatedAt: new Date(),
            startDate: data.status === 'WATCHING' ? new Date() : undefined,
            completedDate: data.status === 'COMPLETED' ? new Date() : undefined,
          };

          set(state => ({
            entries: [...state.entries, newEntry],
          }));
        }
      },
      updateEntry: (id, data) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? {
                  ...entry,
                  ...data,
                  updatedAt: new Date(),
                  completedDate:
                    data.status === 'COMPLETED' && entry.status !== 'COMPLETED'
                      ? new Date()
                      : entry.completedDate,
                }
              : entry
          ),
        }));
      },
      removeEntry: (id) => {
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id),
        }));
      },
      getEntriesByUser: (userId) => {
        return get().entries.filter(entry => entry.userId === userId);
      },
      getEntryByAnime: (userId, animeId) => {
        return get().entries.find(
          entry => entry.userId === userId && entry.animeId === animeId
        );
      },
      getEntriesByStatus: (userId, status) => {
        return get().entries.filter(
          entry => entry.userId === userId && entry.status === status
        );
      },
    }),
    {
      name: 'anime-list-storage',
    }
  )
);
