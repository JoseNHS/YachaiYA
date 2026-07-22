import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { UserRole, UserProfile } from '../types/auth';
import { Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any; user?: UserProfile }>;
  signUpWithEmail: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: any; user?: UserProfile }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(authService.isDemoMode);

  // Fetch profile via profileService
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await profileService.fetchProfile(userId);
      setUser(profile);
    } catch (e) {
      console.error('Error fetching user profile:', e);
      // Basic fallback
      setUser({
        id: userId,
        email: '',
        role: 'alumno',
        full_name: 'Usuario YachaiYa',
        tokens: 100,
        tokens_locked: 0,
        reputation: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Auth session
  useEffect(() => {
    let active = true;
    let subscription: any = null;

    const initializeAuth = async () => {
      if (authService.isDemoMode) {
        console.warn('⚠️ Ejecutando en Modo Demo (Credenciales de Supabase no configuradas o son placeholder).');
        if (active) {
          setIsDemoMode(true);
          const demoUser = await authService.loadDemoSessionUser();
          if (demoUser) {
            setUser(demoUser);
            setSession({
              access_token: 'mock-token-' + demoUser.id,
              user: { id: demoUser.id, email: demoUser.email }
            } as any);
          }
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (active) {
          if (initialSession) {
            setSession(initialSession);
            await fetchUserProfile(initialSession.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error initializing real auth, fallback to demo mode:', err);
        if (active) {
          setIsDemoMode(true);
          const demoUser = await authService.loadDemoSessionUser();
          if (demoUser) {
            setUser(demoUser);
            setSession({
              access_token: 'mock-token-' + demoUser.id,
              user: { id: demoUser.id, email: demoUser.email }
            } as any);
          }
          setLoading(false);
        }
      }
    };

    initializeAuth();

    if (!authService.isDemoMode) {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
        if (!active) return;
        setSession(currentSession);
        if (currentSession) {
          await fetchUserProfile(currentSession.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      subscription = sub;
    }

    return () => {
      active = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  // Sign In
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      setSession(result.session);
      setUser(result.user);
      setLoading(false);
      return { error: null, user: result.user };
    } catch (error: any) {
      console.error('Error in signInWithEmail context wrapper:', error);
      setLoading(false);
      return { error: error.message || error };
    }
  }, []);

  // Sign Up
  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string, role: UserRole) => {
    setLoading(true);
    try {
      if (role === 'administrador') {
        throw new Error('No está permitido registrarse como administrador de forma pública.');
      }
      const result = await authService.signUp(email, password, fullName, role);
      
      if (result.session) {
        setSession(result.session);
      }
      setUser(result.user);
      setLoading(false);
      return { error: null, user: result.user };
    } catch (error: any) {
      console.error('Error in signUpWithEmail context wrapper:', error);
      setLoading(false);
      return { error: error.message || error };
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      console.error('Error in signOut context wrapper:', error);
      setLoading(false);
      return { error: error.message || error };
    }
  }, []);

  const sessionUserId = session?.user?.id;

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (authService.isDemoMode) {
      const demoUser = await authService.loadDemoSessionUser();
      if (demoUser) {
        setUser(demoUser);
      }
    } else if (sessionUserId) {
      await fetchUserProfile(sessionUserId);
    }
  }, [sessionUserId, fetchUserProfile]);

  const contextValue = useMemo(() => ({
    session,
    user,
    loading,
    isDemoMode,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
  }), [
    session,
    user,
    loading,
    isDemoMode,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
