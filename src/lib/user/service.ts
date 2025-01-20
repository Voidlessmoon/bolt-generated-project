import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { JWT_SECRET } from '@/config/jwt';
import { AUTH_CONFIG } from '@/config/auth';
import { userStorage } from '../storage/users';
import { logger } from '@/utils/logger';
import type { User } from '@/types/auth';

const secretKey = new TextEncoder().encode(JWT_SECRET);

class UserService {
  async refreshToken(userId: string, oldToken: string): Promise<string> {
    try {
      const user = userStorage.findById(userId);
      if (!user) throw new Error('User not found');

      // Generate new token with updated role
      const token = await new jose.SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(AUTH_CONFIG.tokenExpiration)
        .sign(secretKey);

      return token;
    } catch (error) {
      logger.error('Failed to refresh token', error);
      throw error;
    }
  }

  getUsers(): User[] {
    return userStorage.getAll();
  }

  findById(id: string): User | undefined {
    return userStorage.findById(id);
  }

  findByEmail(email: string): User | undefined {
    return userStorage.findByEmail(email);
  }

  create(user: User): User {
    return userStorage.create(user);
  }

  update(userId: string, userData: Partial<User>): User | undefined {
    return userStorage.update(userId, userData);
  }

  delete(userId: string): void {
    userStorage.delete(userId);
  }

  async resetPassword(input: { userId: string; newPassword: string }): Promise<void> {
    const hashedPassword = await bcrypt.hash(input.newPassword, AUTH_CONFIG.saltRounds);
    userStorage.update(input.userId, { password: hashedPassword });
  }

  setRole(userId: string, role: 'USER' | 'ADMIN'): void {
    userStorage.update(userId, { role });
  }

  banUser(input: { userId: string; reason: string }): void {
    userStorage.update(input.userId, {
      status: 'BANNED',
      banReason: input.reason,
      bannedAt: new Date()
    });
  }

  unbanUser(userId: string): void {
    userStorage.update(userId, {
      status: 'ACTIVE',
      banReason: undefined,
      bannedAt: undefined
    });
  }
}

export const userService = new UserService();
