import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  banner?: string;
  nickname?: string;
  bio?: string;
  createdAt: Date;
  emailVerified: boolean;
  status: 'ACTIVE' | 'BANNED';
  preferences: {
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    language: string;
    favoriteAnimes?: string[];
  };
}

export const profileSchema = z.object({
  nickname: z.string()
    .min(3, 'Nickname must be at least 3 characters')
    .max(30, 'Nickname must be less than 30 characters')
    .optional(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  avatar: z.string()
    .url('Invalid avatar URL')
    .optional(),
  banner: z.string()
    .url('Invalid banner URL')
    .optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    emailNotifications: z.boolean(),
    language: z.string(),
    favoriteAnimes: z.array(z.string()).optional(),
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
