import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,

      signIn: async (email: string, password: string) => {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        } catch (error: any) {
          throw new Error(error.message);
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
        } catch (error: any) {
          throw new Error(error.message);
        }
      },

      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null });
        } catch (error: any) {
          throw new Error(error.message);
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw error;
        } catch (error: any) {
          throw new Error(error.message);
        }
      },

      updatePassword: async (password: string) => {
        try {
          const { error } = await supabase.auth.updateUser({
            password,
          });
          if (error) throw error;
        } catch (error: any) {
          throw new Error(error.message);
        }
      },

      updateProfile: async (updates: any) => {
        try {
          const { error } = await supabase.auth.updateUser(updates);
          if (error) throw error;
          const { data: { user } } = await supabase.auth.getUser();
          set({ user });
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

