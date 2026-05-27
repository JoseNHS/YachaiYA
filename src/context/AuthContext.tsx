import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { UserRole, UserProfile } from '../types/auth';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any; user?: UserProfile }>;
  signUpWithEmail: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: any; user?: UserProfile }>;
  signOut: () => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clave para guardar el usuario simulado en persistencia de Demo Mode
const DEMO_USER_KEY = 'yachaiya_demo_user';
const DEMO_SESSION_KEY = 'yachaiya_demo_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Determinar si estamos usando credenciales placeholder
  const checkIsPlaceholder = () => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    return !supabaseUrl || supabaseUrl.includes('placeholder-url') || supabaseUrl.includes('your-supabase-project-id');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const isPlaceholder = checkIsPlaceholder();

      if (isPlaceholder) {
        console.warn('⚠️ Ejecutando en Modo Demo (Credenciales de Supabase no configuradas o son placeholder).');
        setIsDemoMode(true);
        await loadDemoSession();
        return;
      }

      try {
        // Inicialización con Supabase real
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (initialSession) {
          setSession(initialSession);
          await fetchUserProfile(initialSession.user.id, initialSession.user.email || '');
        } else {
          setLoading(false);
        }

        // Escuchar cambios de estado de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
          setSession(currentSession);
          if (currentSession) {
            await fetchUserProfile(currentSession.user.id, currentSession.user.email || '');
          } else {
            setUser(null);
            setLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };

      } catch (err) {
        console.error('Error al inicializar Supabase real, activando Modo Demo como plan de respaldo:', err);
        setIsDemoMode(true);
        await loadDemoSession();
      }
    };

    initializeAuth();
  }, []);

  // Cargar sesión guardada de Demo Mode (Persistencia local)
  const loadDemoSession = async () => {
    try {
      let storedUserStr = null;
      if (Platform.OS === 'web') {
        storedUserStr = localStorage.getItem(DEMO_USER_KEY);
      } else {
        storedUserStr = await SecureStore.getItemAsync(DEMO_USER_KEY);
      }

      if (storedUserStr) {
        const demoUser = JSON.parse(storedUserStr) as UserProfile;
        setUser(demoUser);
        
        // Simular un objeto de sesión de Supabase
        const mockSession = {
          access_token: 'mock-token-' + demoUser.id,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: demoUser.id,
            email: demoUser.email,
            app_metadata: {},
            user_metadata: { full_name: demoUser.full_name, role: demoUser.role },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
        } as unknown as Session;

        setSession(mockSession);
      }
    } catch (e) {
      console.error('Error cargando la sesión demo persistente:', e);
    } finally {
      setLoading(false);
    }
  };

  // Obtener perfil desde la base de datos de Supabase
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Si la tabla no existe o el perfil no está creado, creamos un perfil temporal
        // para asegurar que la app no explote y tenga un rol por defecto.
        console.warn('Perfil no encontrado en base de datos. Creando perfil temporal local.');
        
        // Intentar obtener rol de los metadata del usuario registrado
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        const role = (supabaseUser?.user_metadata?.role as UserRole) || 'alumno';
        const full_name = (supabaseUser?.user_metadata?.full_name as string) || 'Usuario Registrado';
        
        setUser({
          id: userId,
          email,
          role,
          full_name,
        });
      } else if (data) {
        setUser(data as UserProfile);
      }
    } catch (e) {
      console.error('Error al obtener perfil:', e);
      // Fallback a un rol básico para evitar romper la experiencia
      setUser({
        id: userId,
        email,
        role: 'alumno',
        full_name: 'Estudiante YachaiYa',
      });
    } finally {
      setLoading(false);
    }
  };

  // Iniciar Sesión
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // --- MODO DEMO ---
        // Lógica de simulación: permitimos iniciar sesión con cuentas simuladas fijas
        // o si ingresa cualquier cuenta nueva, le asignamos datos demo según el email.
        let resolvedRole: UserRole = 'alumno';
        let name = 'Estudiante Demostración';

        if (email.toLowerCase().includes('docente')) {
          resolvedRole = 'docente';
          name = 'Prof. Carlos Mendoza';
        } else if (email.toLowerCase().includes('admin')) {
          resolvedRole = 'administrador';
          name = 'Admin Principal YachaiYa';
        } else {
          resolvedRole = 'alumno';
          name = 'Alejandro Rivera';
        }

        const simulatedProfile: UserProfile = {
          id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          email: email.toLowerCase(),
          role: resolvedRole,
          full_name: name,
        };

        const mockSession = {
          access_token: 'mock-access-token',
          user: { id: simulatedProfile.id, email: simulatedProfile.email },
        } as unknown as Session;

        // Persistir sesión demo
        const userStr = JSON.stringify(simulatedProfile);
        if (Platform.OS === 'web') {
          localStorage.setItem(DEMO_USER_KEY, userStr);
        } else {
          await SecureStore.setItemAsync(DEMO_USER_KEY, userStr);
        }

        setUser(simulatedProfile);
        setSession(mockSession);
        setLoading(false);
        return { error: null, user: simulatedProfile };
      }

      // --- MODO SUPABASE REAL ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Buscar perfil
      let userProfile: UserProfile | null = null;
      if (data.session) {
        // Intentar obtener el perfil para retornarlo inmediatamente
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profile) {
          userProfile = profile as UserProfile;
          setUser(userProfile);
        } else {
          // Fallback si no está en tabla profiles
          userProfile = {
            id: data.session.user.id,
            email: data.session.user.email || email,
            role: (data.session.user.user_metadata?.role as UserRole) || 'alumno',
            full_name: (data.session.user.user_metadata?.full_name as string) || 'Usuario de YachaiYa',
          };
          setUser(userProfile);
        }
      }

      return { error: null, user: userProfile || undefined };

    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setLoading(false);
      return { error: error.message || error };
    }
  };

  // Registrar Usuario
  const signUpWithEmail = async (email: string, password: string, fullName: string, role: UserRole) => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // --- MODO DEMO ---
        const simulatedProfile: UserProfile = {
          id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          email: email.toLowerCase(),
          role: role,
          full_name: fullName,
        };

        const mockSession = {
          access_token: 'mock-access-token',
          user: { id: simulatedProfile.id, email: simulatedProfile.email },
        } as unknown as Session;

        // Persistir sesión demo
        const userStr = JSON.stringify(simulatedProfile);
        if (Platform.OS === 'web') {
          localStorage.setItem(DEMO_USER_KEY, userStr);
        } else {
          await SecureStore.setItemAsync(DEMO_USER_KEY, userStr);
        }

        setUser(simulatedProfile);
        setSession(mockSession);
        setLoading(false);
        return { error: null, user: simulatedProfile };
      }

      // --- MODO SUPABASE REAL ---
      // 1. Registrar en Auth de Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (!data.user) throw new Error('No se recibió información del usuario creado.');

      const newProfile: UserProfile = {
        id: data.user.id,
        email: email.toLowerCase(),
        role: role,
        full_name: fullName,
      };

      // 2. Insertar en la tabla pública de perfiles
      // Esto suele fallar si la tabla no existe o RLS está bloqueado, por lo tanto usamos un try/catch interno.
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email.toLowerCase(),
              role: role,
              full_name: fullName,
            }
          ]);
        
        if (profileError) {
          console.warn('Error al insertar perfil en Supabase (puede deberse a RLS o falta de tabla):', profileError);
        }
      } catch (insertErr) {
        console.warn('Fallo al escribir en la tabla profiles. Asegúrate de crear la tabla en tu base de datos.', insertErr);
      }

      setUser(newProfile);
      return { error: null, user: newProfile };

    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      setLoading(false);
      return { error: error.message || error };
    }
  };

  // Cerrar Sesión
  const signOut = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // --- MODO DEMO ---
        if (Platform.OS === 'web') {
          localStorage.removeItem(DEMO_USER_KEY);
        } else {
          await SecureStore.deleteItemAsync(DEMO_USER_KEY);
        }
        setUser(null);
        setSession(null);
        setLoading(false);
        return { error: null };
      }

      // --- MODO SUPABASE REAL ---
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setLoading(false);
      return { error: null };

    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      setLoading(false);
      return { error: error.message || error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isDemoMode,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
