import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'yachaiya_demo_notifications_v2'
};

const checkIsDemoMode = () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('placeholder-url') || supabaseUrl.includes('your-supabase-project-id');
};

const IS_DEMO = checkIsDemoMode();

export const notificationService = {
  isDemoMode: IS_DEMO,

  /**
   * Fetches user's notification list.
   */
  getNotifications: async (userId: string): Promise<any[]> => {
    if (IS_DEMO) {
      try {
        let storedNotifs = null;
        if (Platform.OS === 'web') {
          storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        } else {
          storedNotifs = await SecureStore.getItemAsync(STORAGE_KEYS.NOTIFICATIONS);
        }
        if (storedNotifs) {
          const list = JSON.parse(storedNotifs) as any[];
          return list.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      } catch (e) {
        console.warn('Error reading demo notifications:', e);
      }
      return [
        {
          id: 'not1',
          user_id: 'docente-demo-1',
          title: '¡Tu respuesta fue aceptada! 🎉',
          message: 'El alumno aceptó tu solución. Has ganado 25 tokens y +10 de reputación.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ].filter(n => n.user_id === userId);
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Marks a notification as read.
   */
  markNotificationRead: async (notificationId: string): Promise<void> => {
    if (IS_DEMO) {
      try {
        let storedNotifs = null;
        if (Platform.OS === 'web') {
          storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        } else {
          storedNotifs = await SecureStore.getItemAsync(STORAGE_KEYS.NOTIFICATIONS);
        }
        if (storedNotifs) {
          const list = JSON.parse(storedNotifs) as any[];
          const idx = list.findIndex(n => n.id === notificationId);
          if (idx !== -1) {
            list[idx].is_read = true;
            if (Platform.OS === 'web') {
              localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
            } else {
              await SecureStore.setItemAsync(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
            }
          }
        }
      } catch (e) {
        console.warn('Error saving demo notifications:', e);
      }
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }
};
