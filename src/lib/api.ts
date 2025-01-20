import type { LoginInput, RegisterInput, AuthResponse } from '@/types/auth';
import { login as authLogin, register as authRegister } from './auth';

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  try {
    return await authLogin(data);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
}

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  try {
    return await authRegister(data);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
}
