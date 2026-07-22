import { supabase } from './supabase';
import { UserProfile } from '../types/auth';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const DEMO_USER_KEY = 'yachaiya_demo_user';
const DEMO_PROFILES_KEY = 'yachaiya_demo_profiles_v2';

const checkIsDemoMode = () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('placeholder-url') || supabaseUrl.includes('your-supabase-project-id');
};

const IS_DEMO = checkIsDemoMode();

export const profileService = {
  /**
   * Refreshes the user profile from the database/demo profiles list.
   */
  fetchProfile: async (userId: string): Promise<UserProfile> => {
    if (IS_DEMO) {
      try {
        const storedStr = Platform.OS === 'web'
          ? localStorage.getItem(DEMO_PROFILES_KEY)
          : await SecureStore.getItemAsync(DEMO_PROFILES_KEY);
        if (storedStr) {
          const list = JSON.parse(storedStr) as UserProfile[];
          const found = list.find(p => p.id === userId);
          if (found) {
            // Also update the active session info
            const userStr = JSON.stringify(found);
            if (Platform.OS === 'web') {
              localStorage.setItem(DEMO_USER_KEY, userStr);
            } else {
              await SecureStore.setItemAsync(DEMO_USER_KEY, userStr);
            }
            return found;
          }
        }
      } catch (e) {
        console.warn('Error reading profiles list in profileService:', e);
      }
      
      // Fallback
      const activeUserStr = Platform.OS === 'web'
        ? localStorage.getItem(DEMO_USER_KEY)
        : await SecureStore.getItemAsync(DEMO_USER_KEY);
      if (activeUserStr) {
        return JSON.parse(activeUserStr) as UserProfile;
      }
      throw new Error('Perfil demo no encontrado.');
    }

    // Real Supabase Mode
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  },

  /**
   * Returns statistics counts for questions, solutions, etc.
   */
  getProfileStats: async (userId: string, role: 'alumno' | 'docente'): Promise<{
    publishedCount: number;
    solvedCount: number;
    proposedCount: number;
    acceptedCount: number;
  }> => {
    if (IS_DEMO) {
      try {
        // Read demo questions
        const questionsStr = Platform.OS === 'web'
          ? localStorage.getItem('yachaiya_demo_questions_v2')
          : await SecureStore.getItemAsync('yachaiya_demo_questions_v2');
        const questions = questionsStr ? JSON.parse(questionsStr) : [];
        
        // Read demo answers
        const answersStr = Platform.OS === 'web'
          ? localStorage.getItem('yachaiya_demo_answers_v2')
          : await SecureStore.getItemAsync('yachaiya_demo_answers_v2');
        const answers = answersStr ? JSON.parse(answersStr) : [];

        const published = questions.filter((q: any) => q.author_id === userId && q.deleted_at === null);
        const solved = published.filter((q: any) => q.status === 'solved');
        const proposed = answers.filter((a: any) => a.user_id === userId && a.deleted_at === null);
        const accepted = proposed.filter((a: any) => a.is_accepted);

        return {
          publishedCount: published.length,
          solvedCount: solved.length,
          proposedCount: proposed.length,
          acceptedCount: accepted.length
        };
      } catch (e) {
        console.warn('Error reading demo stats:', e);
      }
      return { publishedCount: 0, solvedCount: 0, proposedCount: 0, acceptedCount: 0 };
    }

    // Real Supabase Mode
    // 1. Published questions
    const { count: publishedCount, error: err1 } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .is('deleted_at', null);

    if (err1) throw err1;

    // 2. Solved questions
    const { count: solvedCount, error: err2 } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('status', 'solved')
      .is('deleted_at', null);

    if (err2) throw err2;

    // 3. Proposed answers (Docente)
    const { count: proposedCount, error: err3 } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (err3) throw err3;

    // 4. Accepted answers (Docente)
    const { count: acceptedCount, error: err4 } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_accepted', true)
      .is('deleted_at', null);

    if (err4) throw err4;

    return {
      publishedCount: publishedCount || 0,
      solvedCount: solvedCount || 0,
      proposedCount: proposedCount || 0,
      acceptedCount: acceptedCount || 0
    };
  }
};
