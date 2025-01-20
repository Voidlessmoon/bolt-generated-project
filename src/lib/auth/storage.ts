import { User } from '@/types/auth';
import adminConfig from '@/config/admin.json';
import bcrypt from 'bcryptjs';

// Initialize users with admin from config
const adminUser: User = {
  ...adminConfig.admin,
  password: bcrypt.hashSync(adminConfig.admin.password, 10),
  createdAt: new Date(0),
  status: 'ACTIVE',
  nickname: 'Administrator'
};

// Initialize users array with admin
let users: User[] = [adminUser];

// Load persisted users from localStorage
const loadUsers = () => {
  try {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      users = [
        adminUser, // Always keep admin
        ...parsedUsers
          .filter((user: User) => user.id !== adminConfig.admin.id)
          .map((user: User) => ({
            ...user,
            createdAt: new Date(user.createdAt),
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
            bannedAt: user.bannedAt ? new Date(user.bannedAt) : undefined
          }))
      ];
    }
  } catch (error) {
    console.error('Failed to load users from storage:', error);
  }
};

// Save users to localStorage
const saveUsers = () => {
  try {
    const usersToSave = users.filter(user => user.id !== adminConfig.admin.id);
    localStorage.setItem('users', JSON.stringify(usersToSave));
  } catch (error) {
    console.error('Failed to save users to storage:', error);
  }
};

// Initial load
loadUsers();

export const userStorage = {
  getAll: () => {
    loadUsers(); // Refresh from storage
    console.log('Current users:', users);
    return users;
  },
  
  findByEmail: (email: string) => {
    loadUsers(); // Refresh from storage
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  
  findById: (id: string) => {
    loadUsers(); // Refresh from storage
    return users.find(u => u.id === id);
  },
  
  create: (user: User) => {
    loadUsers(); // Refresh from storage
    users.push(user);
    saveUsers();
    console.log('Added new user:', user);
    console.log('Updated users:', users);
    return user;
  },
  
  update: (userId: string, data: Partial<User>) => {
    loadUsers(); // Refresh from storage
    
    // Don't update admin password from config
    if (userId === adminConfig.admin.id && data.password) {
      delete data.password;
    }
    
    users = users.map(user =>
      user.id === userId ? { ...user, ...data } : user
    );
    
    saveUsers();
    return users.find(u => u.id === userId);
  },
  
  delete: (userId: string) => {
    loadUsers(); // Refresh from storage
    
    // Prevent deleting admin user
    if (userId !== adminConfig.admin.id) {
      users = users.filter(user => user.id !== userId);
      saveUsers();
    }
  }
};
