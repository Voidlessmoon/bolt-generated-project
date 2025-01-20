import { User } from '@/types/auth';
import { getDefaultAdmin } from '@/lib/admin';

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'users',
  IMAGES: 'persistedImages'
} as const;

class UserStorage {
  private users: User[];

  constructor() {
    this.users = [getDefaultAdmin()];
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        // Ensure default admin is always present
        const adminExists = parsedUsers.some((u: any) => u.id === 'admin-default');
        this.users = [
          ...(adminExists ? [] : [getDefaultAdmin()]),
          ...parsedUsers.map(this.hydrateUser)
        ];
      }
    } catch (error) {
      console.error('Failed to load users from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    } catch (error) {
      console.error('Failed to save users to storage:', error);
    }
  }

  private hydrateUser(user: any): User {
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
      bannedAt: user.bannedAt ? new Date(user.bannedAt) : undefined,
      status: user.status || 'ACTIVE'
    };
  }

  getAll(): User[] {
    this.loadFromStorage(); // Refresh from storage
    return [...this.users];
  }

  findById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  create(user: User): User {
    const newUser = {
      ...user,
      status: 'ACTIVE',
      createdAt: new Date(),
      preferences: {
        theme: 'dark',
        emailNotifications: false,
        language: 'en',
        ...user.preferences
      }
    };
    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  update(userId: string, userData: Partial<User>): User | undefined {
    const isDefaultAdmin = userId === 'admin-default';
    
    this.users = this.users.map(user => {
      if (user.id !== userId) return user;
      
      // Prevent modifying critical admin properties
      if (isDefaultAdmin) {
        const { password, role, email, status, ...allowedUpdates } = userData;
        return { ...user, ...allowedUpdates };
      }
      
      return { ...user, ...userData };
    });
    
    this.saveToStorage();
    return this.findById(userId);
  }

  delete(userId: string): void {
    if (userId !== 'admin-default') {
      this.users = this.users.filter(user => user.id !== userId);
      this.saveToStorage();
    }
  }

  saveImage(imageUrl: string, type: 'avatar' | 'thumbnail'): void {
    try {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || '{}');
      images[imageUrl] = {
        url: imageUrl,
        type,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  }

  getImage(imageUrl: string): any {
    try {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || '{}');
      return images[imageUrl];
    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  }

  clear(): void {
    this.users = [getDefaultAdmin()];
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.IMAGES);
  }
}

export const userStorage = new UserStorage();
