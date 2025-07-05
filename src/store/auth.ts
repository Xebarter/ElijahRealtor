import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      isAdmin: false,

      signIn: async (email: string, password: string) => {
        set({ loading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              user_metadata: data.user.user_metadata
            };
            
            set({ 
              user, 
              isAdmin: true, // For now, all authenticated users are admin
              loading: false 
            });
          }
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        set({ 
          user: null, 
          isAdmin: false, 
          loading: false 
        });
      },

      initialize: async () => {
        set({ loading: true });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              user_metadata: session.user.user_metadata
            };
            
            set({ 
              user, 
              isAdmin: true,
              loading: false 
            });
          } else {
            set({ 
              user: null, 
              isAdmin: false, 
              loading: false 
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const user: User = {
                id: session.user.id,
                email: session.user.email!,
                user_metadata: session.user.user_metadata
              };
              
              set({ 
                user, 
                isAdmin: true,
                loading: false 
              });
            } else if (event === 'SIGNED_OUT') {
              set({ 
                user: null, 
                isAdmin: false, 
                loading: false 
              });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ loading: false });
        }
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAdmin: !!user 
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAdmin: state.isAdmin,
      }),
    }
  )
);

const { set } = useAuthStore();