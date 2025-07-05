import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  initialize: () => void;
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
      isAdmin: false,

      initialize: () => {
        try {
          // Get initial session
          supabase.auth.getSession().then(({ data: { session } }) => {
            const isAdmin = session?.user?.email === 'admin@elijahrealtor.com';
            set({ user: session?.user ?? null, isAdmin, loading: false });
          }).catch((error) => {
            console.error('Error getting session:', error);
            set({ loading: false });
          });

          // Listen for auth changes
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
            const isAdmin = session?.user?.email === 'admin@elijahrealtor.com';
            set({ user: session?.user ?? null, isAdmin, loading: false });
          });

          // Return unsubscribe function (though Zustand doesn't use it)
          return () => subscription.unsubscribe();
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ loading: false });
        }
      },

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

