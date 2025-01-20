import { User } from './auth';

export interface UserManagement extends User {
  status: 'ACTIVE' | 'BANNED';
  banReason?: string;
  bannedAt?: Date;
  bannedBy?: string;
}

export interface BanUserInput {
  userId: string;
  reason: string;
}

export interface ResetPasswordInput {
  userId: string;
  newPassword: string;
}
