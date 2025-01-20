import bcrypt from 'bcryptjs';
import adminConfig from '@/config/admin.json';
import type { User } from '@/types/auth';

// Hash the admin password once at startup
const hashedPassword = bcrypt.hashSync(adminConfig.admin.password, 10);

export function getDefaultAdmin(): User {
  return {
    ...adminConfig.admin,
    password: hashedPassword,
    createdAt: new Date(0), // Unix epoch start
    status: 'ACTIVE',
    emailVerified: true,
    preferences: {
      theme: 'dark',
      emailNotifications: false,
      language: 'en',
      favoriteAnimes: []
    }
  };
}

export function isDefaultAdmin(userId: string): boolean {
  return userId === adminConfig.admin.id;
}
