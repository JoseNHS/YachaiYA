import { supabase } from './supabase';
import { UserRole, UserProfile } from '../types/auth';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEMO_USER_KEY = 'yachaiya_demo_user';
const DEMO_PROFILES_KEY = 'yachaiya_demo_profiles_v2';

const checkIsDemoMode = () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('placeholder-url') || supabaseUrl.includes('your-supabase-project-id');
};

const IS_DEMO = checkIsDemoMode();

export const authService = {
  isDemoMode: IS_DEMO,

  /**
   * Loads the active demo session user from local persistence.
   */
  loadDemoSessionUser: async (): Promise<UserProfile | null> => {
    try {
      const stored = Platform.OS === 'web'
        ? localStorage.getItem(DEMO_USER_KEY)
        : await SecureStore.getItemAsync(DEMO_USER_KEY);
      return stored ? JSON.parse(stored) as UserProfile : null;
    } catch (e) {
      console.warn('Error loading demo user session:', e);
      return null;
    }
  },

  /**
   * Saves the demo user session.
   */
  saveDemoSessionUser: async (user: UserProfile): Promise<void> => {
    try {
      const userStr = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(DEMO_USER_KEY, userStr);
      } else {
        await SecureStore.setItemAsync(DEMO_USER_KEY, userStr);
      }
    } catch (e) {
      console.warn('Error saving demo user session:', e);
    }
  },

  /**
   * Signs in a user with email and password.
   */
  signIn: async (email: string, password: string): Promise<{ session: Session | null; user: UserProfile }> => {
    if (IS_DEMO) {
      // Simulation mode
      let resolvedRole: UserRole = 'alumno';
      let name = 'Estudiante Demostración';
      let initialTokens = 100;
      let initialReputation = 0;

      if (email.toLowerCase().includes('docente')) {
        resolvedRole = 'docente';
        name = 'Prof. Carlos Mendoza';
        initialTokens = 250;
        initialReputation = 50;
      } else if (email.toLowerCase().includes('admin')) {
        resolvedRole = 'administrador';
        name = 'Administrador Sistema';
        initialTokens = 9999;
        initialReputation = 999;
      }

      // Check if user profile already exists in demodb list
      let profilesList: UserProfile[] = [];
      try {
        const listStr = Platform.OS === 'web'
          ? localStorage.getItem(DEMO_PROFILES_KEY)
          : await SecureStore.getItemAsync(DEMO_PROFILES_KEY);
        if (listStr) {
          profilesList = JSON.parse(listStr);
        }
      } catch (e) {
        console.warn('Error reading demo profiles list:', e);
      }

      let profile = profilesList.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) {
        profile = {
          id: email.toLowerCase().includes('docente') ? 'docente-demo-1' : 'alumno-demo-1',
          email: email.toLowerCase(),
          full_name: name,
          role: resolvedRole,
          tokens: initialTokens,
          tokens_locked: 0,
          reputation: initialReputation,
          created_at: new Date().toISOString()
        };
        profilesList.push(profile);
        try {
          const listStr = JSON.stringify(profilesList);
          if (Platform.OS === 'web') {
            localStorage.setItem(DEMO_PROFILES_KEY, listStr);
          } else {
            await SecureStore.setItemAsync(DEMO_PROFILES_KEY, listStr);
          }
        } catch (e) {
          console.warn('Error saving demo profiles list:', e);
        }
      }

      // Save as active session user
      await authService.saveDemoSessionUser(profile);

      // Construct a mock supabase session
      const mockSession = {
        access_token: 'mock-token-' + profile.id,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: profile.id,
          email: profile.email,
          app_metadata: {},
          user_metadata: { full_name: profile.full_name, role: profile.role },
          aud: 'authenticated',
          created_at: profile.created_at || new Date().toISOString(),
        },
      } as unknown as Session;

      return { session: mockSession, user: profile };
    }

    // Real Supabase mode
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo autenticar el usuario.');

    // Fetch matching profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      // Return a basic profile layout if table fetch fails (temp profile)
      const role = (authData.user.user_metadata?.role as UserRole) || 'alumno';
      const userProfile: UserProfile = {
        id: authData.user.id,
        email: authData.user.email || email,
        full_name: authData.user.user_metadata?.full_name || 'Estudiante YachaiYa',
        role,
        tokens: role === 'alumno' ? 100 : 0,
        tokens_locked: 0,
        reputation: 0,
        created_at: authData.user.created_at
      };
      return { session: authData.session, user: userProfile };
    }

    return { session: authData.session, user: profile as UserProfile };
  },

  /**
   * Registers a new user.
   */
  signUp: async (email: string, password: string, fullName: string, role: UserRole): Promise<{ session: Session | null; user: UserProfile }> => {
    if (IS_DEMO) {
      // Simulation mode
      const newProfile: UserProfile = {
        id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        full_name: fullName,
        role,
        tokens: role === 'alumno' ? 100 : 0,
        tokens_locked: 0,
        reputation: 0,
        created_at: new Date().toISOString()
      };

      // Add user to database list
      let list: UserProfile[] = [];
      try {
        const storedStr = Platform.OS === 'web'
          ? localStorage.getItem(DEMO_PROFILES_KEY)
          : await SecureStore.getItemAsync(DEMO_PROFILES_KEY);
        if (storedStr) {
          list = JSON.parse(storedStr);
        }
      } catch {}

      list.push(newProfile);
      
      const listStr = JSON.stringify(list);
      if (Platform.OS === 'web') {
        localStorage.setItem(DEMO_PROFILES_KEY, listStr);
      } else {
        await SecureStore.setItemAsync(DEMO_PROFILES_KEY, listStr);
      }

      await authService.saveDemoSessionUser(newProfile);

      const mockSession = {
        access_token: 'mock-token-' + newProfile.id,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: newProfile.id,
          email: newProfile.email,
          app_metadata: {},
          user_metadata: { full_name: newProfile.full_name, role: newProfile.role },
          aud: 'authenticated',
          created_at: newProfile.created_at,
        },
      } as unknown as Session;

      return { session: mockSession, user: newProfile };
    }

    // Real Supabase mode
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Error al registrar usuario.');

    const userProfile: UserProfile = {
      id: authData.user.id,
      email: authData.user.email || email,
      full_name: fullName,
      role,
      tokens: role === 'alumno' ? 100 : 0,
      tokens_locked: 0,
      reputation: 0,
      created_at: authData.user.created_at
    };

    return { session: authData.session, user: userProfile };
  },

  /**
   * Signs out the active session.
   */
  signOut: async (): Promise<void> => {
    if (IS_DEMO) {
      if (Platform.OS === 'web') {
        localStorage.removeItem(DEMO_USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(DEMO_USER_KEY);
      }
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
