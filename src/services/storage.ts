import { User } from '@/types/auth';
import { getDefaultAdmin } from '@/lib/admin';
import { logger } from '@/utils/logger';

const STORAGE_KEYS = {
  USERS: 'anime_wizard_users',
  AUTH: 'auth-storage',
  ANIME: 'anime-storage',
  EPISODES: 'episode-storage',
  COMMENTS: 'comment-storage',
  ANIME_LIST: 'anime-list-storage'
} as const;

const getStorageKey = (key: keyof typeof STORAGE_KEYS) => 
  `${process.env.NODE_ENV === 'production' ? 'prod_' : 'dev_'}${STORAGE_KEYS[key]}`;

export class StorageService {
  initialize() {
    logger.debug('Initializing storage service');
    const users = this.getUsers();
    
    if (users.length === 0) {
      const admin = getDefaultAdmin();
      this.saveUsers([admin]);
      logger.debug('Initialized with default admin', admin);
    }
  }

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(getStorageKey('USERS'));
      if (!data) return [];
      
      const users = JSON.parse(data);
      if (!Array.isArray(users)) {
        logger.error('Invalid users data format', users);
        return [];
      }
      
      return users.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
        bannedAt: user.bannedAt ? new Date(user.bannedAt) : undefined
      }));
    } catch (error) {
      logger.error('Failed to get users', error);
      return [];
    }
  }

  saveUsers(users: User[]) {
    try {
      const admin = getDefaultAdmin();
      const nonAdminUsers = users.filter(u => u.id !== 'admin-default');
      const allUsers = [admin, ...nonAdminUsers];
      
      localStorage.setItem(
        getStorageKey('USERS'), 
        JSON.stringify(allUsers)
      );
      
      logger.debug('Saved users', { count: allUsers.length });
    } catch (error) {
      logger.error('Failed to save users', error);
      throw new Error('Failed to save users');
    }
  }

  clearStorage() {
    logger.debug('Clearing storage');
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(getStorageKey(key as keyof typeof STORAGE_KEYS));
    });
    this.initialize();
  }
}

export const storageService = new StorageService();
