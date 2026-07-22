import { supabase } from './supabase';
import { Report, UserProfile, UserRole } from '../types/auth';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  REPORTS: 'yachaiya_demo_reports_v2',
  QUESTIONS: 'yachaiya_demo_questions_v2',
  ANSWERS: 'yachaiya_demo_answers_v2',
  NOTIFICATIONS: 'yachaiya_demo_notifications_v2',
  TRANSACTIONS: 'yachaiya_demo_transactions_v2',
  PROFILES: 'yachaiya_demo_profiles_v2'
};

const checkIsDemoMode = () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('placeholder-url') || supabaseUrl.includes('your-supabase-project-id');
};

const IS_DEMO = checkIsDemoMode();

const loadDemoData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    let dataStr = null;
    if (Platform.OS === 'web') {
      dataStr = localStorage.getItem(key);
    } else {
      dataStr = await SecureStore.getItemAsync(key);
    }
    return dataStr ? JSON.parse(dataStr) : defaultValue;
  } catch (e) {
    console.warn(`Error loading demo data for key ${key}:`, e);
    return defaultValue;
  }
};

const saveDemoData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const valueStr = JSON.stringify(value);
    if (Platform.OS === 'web') {
      localStorage.setItem(key, valueStr);
    } else {
      await SecureStore.setItemAsync(key, valueStr);
    }
  } catch (e) {
    console.warn(`Error saving demo data for key ${key}:`, e);
  }
};

const SEED_REPORTS: Report[] = [
  {
    id: 'rep1',
    reporter_id: 'alumno-demo-1',
    target_type: 'question',
    target_id: 'q1',
    reason: 'Uso de lenguaje inapropiado en los comentarios.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    deleted_at: null
  }
];

export const adminService = {
  isDemoMode: IS_DEMO,

  /**
   * Fetches pending moderation reports.
   */
  getReports: async (): Promise<Report[]> => {
    if (IS_DEMO) {
      const list = await loadDemoData<Report[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
      return list.filter(r => r.deleted_at === null).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Report[];
  },

  /**
   * Resolves a moderation report.
   */
  resolveReport: async (reportId: string, action: 'penalize' | 'dismiss'): Promise<void> => {
    if (IS_DEMO) {
      const reports = await loadDemoData<Report[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
      const repIdx = reports.findIndex(r => r.id === reportId);
      if (repIdx === -1) throw new Error('Reporte no encontrado');

      const rep = reports[repIdx];
      rep.status = (action === 'penalize' ? 'resolved' : 'dismissed');
      rep.deleted_at = new Date().toISOString();
      await saveDemoData(STORAGE_KEYS.REPORTS, reports);

      if (action === 'penalize') {
        const questions = await loadDemoData<any[]>(STORAGE_KEYS.QUESTIONS, []);
        const answers = await loadDemoData<any[]>(STORAGE_KEYS.ANSWERS, []);

        let targetAuthorId = null;

        if (rep.target_type === 'question') {
          const qIdx = questions.findIndex(q => q.id === rep.target_id);
          if (qIdx !== -1) {
            targetAuthorId = questions[qIdx].author_id;
            questions[qIdx].deleted_at = new Date().toISOString();
            questions[qIdx].status = 'cancelled';
            await saveDemoData(STORAGE_KEYS.QUESTIONS, questions);
          }
        } else {
          const aIdx = answers.findIndex(a => a.id === rep.target_id);
          if (aIdx !== -1) {
            targetAuthorId = answers[aIdx].user_id;
            answers[aIdx].deleted_at = new Date().toISOString();
            await saveDemoData(STORAGE_KEYS.ANSWERS, answers);
          }
        }

        if (targetAuthorId) {
          // Penalize target author reputation
          const profiles = await loadDemoData<UserProfile[]>(STORAGE_KEYS.PROFILES, []);
          const profIdx = profiles.findIndex(p => p.id === targetAuthorId);
          if (profIdx !== -1) {
            profiles[profIdx].reputation = Math.max(0, profiles[profIdx].reputation - 10);
            await saveDemoData(STORAGE_KEYS.PROFILES, profiles);
          }

          // Create notification
          const notifications = await loadDemoData<any[]>(STORAGE_KEYS.NOTIFICATIONS, []);
          notifications.push({
            id: 'not-' + Math.random().toString(36).substr(2, 9),
            user_id: targetAuthorId,
            title: 'Penalización de reputación ⚠️',
            message: 'Tu contenido fue reportado y verificado como inapropiado por la moderación. Se han deducido 10 puntos de reputación.',
            is_read: false,
            created_at: new Date().toISOString()
          });
          await saveDemoData(STORAGE_KEYS.NOTIFICATIONS, notifications);
        }
      }
      return;
    }

    const { error } = await supabase.rpc('resolve_report_and_penalize', {
      p_report_id: reportId,
      p_action: action
    });
    if (error) throw error;
  },

  /**
   * Fetches user profiles.
   */
  getProfiles: async (): Promise<UserProfile[]> => {
    if (IS_DEMO) {
      const defaultProfiles = [
        { id: 'alumno-demo-1', email: 'alumno1@yachaiya.com', full_name: 'Alejandro Rivera', role: 'alumno' as UserRole, tokens: 100, tokens_locked: 15, reputation: 12 },
        { id: 'alumno-demo-2', email: 'alumno2@yachaiya.com', full_name: 'Clara Domínguez', role: 'alumno' as UserRole, tokens: 75, tokens_locked: 0, reputation: 6 },
        { id: 'docente-demo-1', email: 'docente1@yachaiya.com', full_name: 'Dr. Roberto Gómez', role: 'docente' as UserRole, tokens: 25, tokens_locked: 0, reputation: 55 },
      ];
      return await loadDemoData<UserProfile[]>(STORAGE_KEYS.PROFILES, defaultProfiles);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation', { ascending: false });

    if (error) throw error;
    return data as UserProfile[];
  },

  /**
   * Grants tokens to a user from administration.
   */
  grantTokens: async (userId: string, amount: number): Promise<void> => {
    if (IS_DEMO) {
      const profiles = await loadDemoData<UserProfile[]>(STORAGE_KEYS.PROFILES, []);
      const idx = profiles.findIndex(p => p.id === userId);
      if (idx !== -1) {
        profiles[idx].tokens += amount;
        await saveDemoData(STORAGE_KEYS.PROFILES, profiles);

        // Also update local active user if it matches
        const activeUserStr = Platform.OS === 'web'
          ? localStorage.getItem('yachaiya_demo_user')
          : await SecureStore.getItemAsync('yachaiya_demo_user');
        if (activeUserStr) {
          const u = JSON.parse(activeUserStr);
          if (u.id === userId) {
            u.tokens += amount;
            if (Platform.OS === 'web') {
              localStorage.setItem('yachaiya_demo_user', JSON.stringify(u));
            } else {
              await SecureStore.setItemAsync('yachaiya_demo_user', JSON.stringify(u));
            }
          }
        }

        const txs = await loadDemoData<any[]>(STORAGE_KEYS.TRANSACTIONS, []);
        txs.push({
          id: 'tx-' + Math.random().toString(36).substr(2, 9),
          sender_id: 'admin-system',
          receiver_id: userId,
          amount,
          transaction_type: 'admin_grant',
          type: 'admin_grant',
          status: 'completed',
          created_at: new Date().toISOString()
        });
        await saveDemoData(STORAGE_KEYS.TRANSACTIONS, txs);

        const notifications = await loadDemoData<any[]>(STORAGE_KEYS.NOTIFICATIONS, []);
        notifications.push({
          id: 'not-' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          title: 'Tokens recibidos 🪙',
          message: `Un administrador te ha otorgado ${amount} tokens.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        await saveDemoData(STORAGE_KEYS.NOTIFICATIONS, notifications);
      }
      return;
    }

    const { error } = await supabase.rpc('admin_grant_tokens', {
      p_user_id: userId,
      p_amount: amount
    });

    if (error) throw error;
  }
};
