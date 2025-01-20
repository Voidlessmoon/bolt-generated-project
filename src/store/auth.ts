import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, ProfileInput } from '@/types/auth';
import { verifyToken } from '@/lib/auth';
import { storage } from '@/lib/storage';

interface AuthState {
  user: Omit<User, 'password'> | null;
  token: string | null;
  setAuth: (user: Omit<User, 'password'> | null, token: string | null) => void;
  updateProfile: (data: ProfileInput) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (user) {
          // Initialize preferences if they don't exist
          if (!user.preferences) {
            user.preferences = {
              theme: 'dark',
              emailNotifications: false,
              language: 'en',
              favoriteAnimes: [],
            };
          }
          // Ensure favoriteAnimes exists
          if (!user.preferences.favoriteAnimes) {
            user.preferences.favoriteAnimes = [];
          }
        }
        set({ user, token });

        // Notify other stores of auth change
        window.dispatchEvent(new CustomEvent('authChange', { 
          detail: { user, token } 
        }));
      },
      updateProfile: async (data) => {
        const { user, token } = get();
        if (!user || !token) throw new Error('Not authenticated');

        try {
          await verifyToken(token);
          
          const updatedUser = {
            ...user,
            ...data,
            nickname: data.nickname || user.username,
            preferences: {
              ...user.preferences,
              ...data.preferences,
              favoriteAnimes: data.preferences?.favoriteAnimes || user.preferences.favoriteAnimes,
            },
          };
          
          if (data.avatar) {
            storage.saveImage(data.avatar, 'avatar');
          }
          
          storage.updateUser(user.id, updatedUser);
          storage.updateUserComments(
            user.id,
            updatedUser.nickname,
            data.avatar
          );
          
          set({ user: updatedUser });

          // Notify other stores of profile update
          window.dispatchEvent(new CustomEvent('profileUpdate', { 
            detail: { user: updatedUser } 
          }));
        } catch (error) {
          set({ user: null, token: null });
          throw new Error('Session expired. Please log in again.');
        }
      },
      deleteAccount: async () => {
        const { user, token } = get();
        if (!user || !token) throw new Error('Not authenticated');

        try {
          await verifyToken(token);
          storage.deleteUser(user.id);
          set({ user: null, token: null });
        } catch (error) {
          throw new Error('Failed to delete account');
        }
      },
      logout: () => {
        set({ user: null, token: null });
        window.dispatchEvent(new CustomEvent('logout'));
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          // Initialize preferences on rehydration
          if (!state.user.preferences) {
            state.user.preferences = {
              theme: 'dark',
              emailNotifications: false,
              language: 'en',
              favoriteAnimes: [],
            };
          }
          if (!state.user.preferences.favoriteAnimes) {
            state.user.preferences.favoriteAnimes = [];
          }
        }
      },
    }
  )
);
