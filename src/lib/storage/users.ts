import { User } from '@/types/auth';
import { getDefaultAdmin } from '@/lib/admin';
import { storageService } from '@/services/storage';
import { logger } from '@/utils/logger';

export class UserStorage {
  private users: User[];

  constructor() {
    this.users = this.loadUsers();
  }

  private loadUsers(): User[] {
    try {
      const admin = getDefaultAdmin();
      const storedUsers = storageService.getUsers();
      
      logger.debug('Loading users', {
        admin,
        storedUsers,
        total: storedUsers.length + 1
      });
      
      return [
        admin,
        ...storedUsers.filter(user => user.id !== 'admin-default')
      ];
    } catch (error) {
      logger.error('Failed to load users', error);
      return [getDefaultAdmin()];
    }
  }

  getAll(): User[] {
    this.users = this.loadUsers(); // Refresh from storage
    return [...this.users];
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  create(user: User): User {
    logger.debug('Creating user', user);
    
    // Ensure user doesn't already exist
    if (this.findByEmail(user.email)) {
      throw new Error('User with this email already exists');
    }

    this.users.push(user);
    storageService.saveUsers(this.users);
    
    logger.debug('User created successfully', {
      id: user.id,
      totalUsers: this.users.length
    });
    
    return user;
  }

  update(userId: string, data: Partial<User>): User | undefined {
    const isDefaultAdmin = userId === 'admin-default';
    
    logger.debug('Updating user', { userId, data });
    
    this.users = this.users.map(user => {
      if (user.id !== userId) return user;
      
      // Prevent modifying critical admin properties
      if (isDefaultAdmin) {
        const { password, role, email, status, ...allowedUpdates } = data;
        return { ...user, ...allowedUpdates };
      }
      
      return { ...user, ...data };
    });
    
    storageService.saveUsers(this.users);
    return this.findById(userId);
  }

  delete(userId: string): void {
    if (userId === 'admin-default') {
      logger.error('Attempted to delete admin account');
      return;
    }

    logger.debug('Deleting user', { userId });
    this.users = this.users.filter(user => user.id !== userId);
    storageService.saveUsers(this.users);
  }
}

export const userStorage = new UserStorage();
