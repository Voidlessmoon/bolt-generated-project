import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { JWT_SECRET } from '@/config';
import { userStorage } from '../storage/users';
import { generateUsername } from '@/lib/utils';
import type { LoginInput, RegisterInput, AuthResponse, User } from '@/types/auth';

const secretKey = new TextEncoder().encode(JWT_SECRET);

class AuthService {
  async login(input: LoginInput): Promise<AuthResponse> {
    const user = userStorage.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(input.password, user.password);
    if (!validPassword) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'BANNED') {
      throw new Error(`Account banned: ${user.banReason || 'No reason provided'}`);
    }

    const token = await this.generateToken(user);
    
    // Update last login time
    const updatedUser = userStorage.update(user.id, {
      ...user,
      lastLoginAt: new Date()
    });
    
    if (!updatedUser) throw new Error('Failed to update user');
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return { token, user: userWithoutPassword };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = userStorage.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    
    // Generate username if not provided
    const username = input.username || generateUsername();
    
    const newUser: User = {
      id: uuidv4(),
      email: input.email,
      username,
      nickname: username,
      password: hashedPassword,
      role: 'USER',
      createdAt: new Date(),
      emailVerified: false,
      status: 'ACTIVE',
      preferences: {
        theme: 'dark',
        emailNotifications: false,
        language: 'en',
      }
    };

    const savedUser = userStorage.create(newUser);
    const token = await this.generateToken(savedUser);
    const { password: _, ...userWithoutPassword } = savedUser;
    
    return { token, user: userWithoutPassword };
  }

  async verifyToken(token: string): Promise<{
    userId: string;
    email: string;
    role: string;
  }> {
    try {
      const { payload } = await jose.jwtVerify(token, secretKey);
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  private async generateToken(user: User): Promise<string> {
    return await new jose.SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secretKey);
  }
}

export const authService = new AuthService();
