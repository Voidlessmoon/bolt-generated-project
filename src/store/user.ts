import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserManagement, BanUserInput, ResetPasswordInput } from '@/types/user';
import { userService } from '@/lib/user/service';
import { storageService } from '@/services/storage';
import { logger } from '@/utils/logger';
import { useAuth } from './auth';

interface UserState {
  users: UserManagement[];
  addUser: (user: UserManagement) => void;
  updateUser: (userId: string, userData: Partial<UserManagement>) => void;
  banUser: (input: BanUserInput) => void;
  unbanUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
  setUserRole: (userId: string, role: 'USER' | 'ADMIN') => void;
  initializeUsers: () => void;
  syncWithAuth: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      addUser: (user) => {
        logger.debug('Adding user to store', { userId: user.id });
        set((state) => ({
          users: [...state.users, user]
        }));
      },
      updateUser: (userId, userData) => {
        logger.debug('Updating user in store', { userId });
        const updatedUser = userService.update(userId, userData);
        if (updatedUser) {
          set((state) => ({
            users: state.users.map((user) =>
              user.id === userId ? { ...user, ...userData } : user
            )
          }));
        }
      },
      banUser: (input) => {
        logger.debug('Banning user', { userId: input.userId });
        userService.banUser(input);
        set((state) => ({
          users: state.users.map((user) =>
            user.id === input.userId
              ? {
                  ...user,
                  status: 'BANNED',
                  banReason: input.reason,
                  bannedAt: new Date()
                }
              : user
          )
        }));
      },
      unbanUser: (userId) => {
        logger.debug('Unbanning user', { userId });
        userService.unbanUser(userId);
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: 'ACTIVE',
                  banReason: undefined,
                  bannedAt: undefined
                }
              : user
          )
        }));
      },
      deleteUser: (userId) => {
        logger.debug('Deleting user', { userId });
        userService.delete(userId);
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId)
        }));
      },
      resetPassword: async (input) => {
        await userService.resetPassword(input);
      },
      setUserRole: (userId, role) => {
        logger.debug('Setting user role', { userId, role });
        userService.setRole(userId, role);
        
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? { ...user, role } : user
          )
        }));

        // Update auth state if it's the current user
        const currentUser = useAuth.getState().user;
        if (currentUser?.id === userId) {
          const { token } = useAuth.getState();
          useAuth.setState((state) => ({
            ...state,
            user: { ...currentUser, role }
          }));
          
          if (token) {
            userService.refreshToken(userId, token);
          }
        }
      },
      initializeUsers: () => {
        logger.debug('Initializing users store');
        const users = storageService.getUsers();
        logger.debug('Loaded users', { count: users.length });
        set({ users });
        
        // Sync with auth store
        get().syncWithAuth();
      },
      syncWithAuth: () => {
        const authUser = useAuth.getState().user;
        if (authUser) {
          set((state) => ({
            users: state.users.map((user) =>
              user.id === authUser.id
                ? {
                    ...user,
                    ...authUser,
                    // Preserve sensitive data
                    password: user.password,
                    role: user.role,
                    status: user.status,
                  }
                : user
            )
          }));
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ users: state.users }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          logger.debug('Rehydrated user store', { 
            userCount: state.users.length 
          });
          // Sync with auth store after rehydration
          setTimeout(() => state.syncWithAuth(), 0);
        }
      }
    }
  )
);
