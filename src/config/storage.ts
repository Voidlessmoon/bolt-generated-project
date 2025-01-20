import { isProduction } from './environment';

export const STORAGE_CONFIG = {
  prefix: isProduction ? 'prod_' : 'dev_',
  keys: {
    USERS: 'anime_wizard_users',
    AUTH: 'auth-storage',
    ANIME: 'anime-storage',
    EPISODES: 'episode-storage',
    COMMENTS: 'comment-storage',
    ANIME_LIST: 'anime-list-storage'
  }
} as const;
