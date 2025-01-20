import { z } from 'zod';

export type AnimeListStatus = 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'ON_HOLD' | 'DROPPED';

export interface AnimeListEntry {
  id: string;
  userId: string;
  animeId: string;
  status: AnimeListStatus;
  progress: number; // Current episode
  rating?: number;
  notes?: string;
  startDate?: Date;
  completedDate?: Date;
  updatedAt: Date;
}

export const animeListEntrySchema = z.object({
  status: z.enum(['WATCHING', 'COMPLETED', 'PLAN_TO_WATCH', 'ON_HOLD', 'DROPPED']),
  progress: z.number().min(0, 'Progress cannot be negative'),
  rating: z.number().min(1).max(10).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type AnimeListEntryInput = z.infer<typeof animeListEntrySchema>;
