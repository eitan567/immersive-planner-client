import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, type SupabaseUser } from '../../lib/supabase-client.ts';
import {
  type Session,
  type AuthError,
  type AuthChangeEvent
} from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  loading: boolean;
  signIn: {
    withGoogle: () => Promise<{ error: AuthError | null }>;
    withFacebook: () => Promise<{ error: AuthError | null }>;
    withMicrosoft: () => Promise<{ error: AuthError | null }>;
    withEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  };
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    loading,
    signIn: {
      withGoogle: async () => {
        return supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
              scope: 'profile email https://www.googleapis.com/auth/userinfo.profile'
            }
          }
        });
      },
      withFacebook: async () => {
        return supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: window.location.origin,
            scopes: 'email,public_profile'
          }
        });
      },
      withMicrosoft: async () => {
        return supabase.auth.signInWithOAuth({
          provider: 'azure',
          options: {
            redirectTo: window.location.origin,
            scopes: 'openid profile email User.Read'
          }
        });
      },
      withEmail: async (email: string, password: string) => {
        return supabase.auth.signInWithPassword({
          email,
          password,
        });
      },
    },
    signUp: async (email: string, password: string) => {
      return supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
    },
    signOut: async () => {
      return supabase.auth.signOut();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};