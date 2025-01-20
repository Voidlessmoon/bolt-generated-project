import { JWT_SECRET } from '@/config';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { z } from 'zod';
import type { User, AuthResponse, RegisterInput, LoginInput } from '@/types/auth';
import { storage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

// Convert string to Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Auth utilities
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const validation = registerSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const existingUser = storage.findUserByEmail(input.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const newUser: User = {
    id: uuidv4(),
    email: input.email,
    username: input.username,
    nickname: input.username,
    password: await bcrypt.hash(input.password, 10),
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

  const savedUser = storage.addUser(newUser);

  const token = await new jose.SignJWT({
    userId: savedUser.id,
    email: savedUser.email,
    role: savedUser.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey);

  const { password: _, ...userWithoutPassword } = savedUser;
  return { token, user: userWithoutPassword };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const validation = loginSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const user = storage.findUserByEmail(input.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(input.password, user.password);
  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  // Check if user is banned
  if (user.status === 'BANNED') {
    throw new Error(`Account banned: ${user.banReason || 'No reason provided'}`);
  }

  const token = await new jose.SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey);

  // Update last login time
  const updatedUser = storage.updateUser(user.id, {
    ...user,
    lastLoginAt: new Date()
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return { token, user: userWithoutPassword };
}

export async function verifyToken(token: string): Promise<{
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

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
  confirmPassword: z.string(),
  captcha: z.string().length(6, 'Invalid captcha code'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
