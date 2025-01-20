import { z } from 'zod';

// Types
export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title: string;
  thumbnail: string;
  duration: number;
  sources: VideoSource[];
  releaseDate?: Date;
  releaseTime?: string;
}

export interface VideoSource {
  type: 'VIDEA' | 'STREAMWISH' | 'DAILYMOTION' | 'YOURUPLOAD' | 'MP4UPLOAD' | 'OKRU' | 'VKRU' | 'GDRIVE' | 'YOUTUBE';
  url: string;
  quality: '360p' | '480p' | '720p' | '1080p';
}

export interface Anime {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  backgroundImage: string;
  episodes: number;
  rating: number;
  status: 'ONGOING' | 'FINISHED' | 'UPCOMING';
  genres: string[];
  season: string;
  year: number;
  schedule?: {
    day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  };
  adaptedFrom: {
    type: 'MANGA' | 'NOVEL' | 'ORIGINAL';
    title?: string;
    author?: string;
    status?: 'ONGOING' | 'FINISHED';
    url?: string;
  };
  isPinned?: boolean;
  pinnedAt?: string;
}

// Schemas
export const episodeSchema = z.object({
  animeId: z.string().min(1, 'Anime is required'),
  number: z.number().min(1, 'Episode number is required'),
  title: z.string().min(1, 'Title is required'),
  duration: z.number().min(1, 'Duration is required'),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  sources: z.array(z.object({
    type: z.enum(['VIDEA', 'STREAMWISH', 'DAILYMOTION', 'YOURUPLOAD', 'MP4UPLOAD', 'OKRU', 'VKRU', 'GDRIVE', 'YOUTUBE']),
    url: z.string().url('Invalid URL'),
    quality: z.enum(['360p', '480p', '720p', '1080p']),
  })).min(1, 'At least one source is required'),
  releaseDate: z.date().optional(),
  releaseTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
});

export const animeEditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  coverImage: z.string().url('Cover image is required'),
  backgroundImage: z.string().url('Background image is required'),
  episodes: z.number().min(1, 'Episodes must be at least 1'),
  rating: z.number().min(0).max(10),
  status: z.enum(['ONGOING', 'FINISHED', 'UPCOMING']),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  season: z.string().min(1, 'Season is required'),
  year: z.number().min(1950).max(new Date().getFullYear() + 1),
  schedule: z.object({
    day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
  }).optional(),
  adaptedFrom: z.object({
    type: z.enum(['MANGA', 'NOVEL', 'ORIGINAL']),
    title: z.string().optional(),
    author: z.string().optional(),
    status: z.enum(['ONGOING', 'FINISHED']).optional(),
    url: z.string().url('Invalid URL').optional(),
  }),
});

export type EpisodeInput = z.infer<typeof episodeSchema>;
export type AnimeEditInput = z.infer<typeof animeEditSchema>;
