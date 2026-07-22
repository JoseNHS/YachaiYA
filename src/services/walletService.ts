import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  TRANSACTIONS: 'yachaiya_demo_transactions_v2'
};

const checkIsDemoMode = () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('placeholder-url') || supabaseUrl.includes('your-supabase-project-id');
};

const IS_DEMO = checkIsDemoMode();

export const walletService = {
  isDemoMode: IS_DEMO,

  /**
   * Fetches the user's transactions history.
   */
  getTransactions: async (userId?: string): Promise<any[]> => {
    if (IS_DEMO) {
      try {
        let storedTxs = null;
        if (Platform.OS === 'web') {
          storedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        } else {
          storedTxs = await SecureStore.getItemAsync(STORAGE_KEYS.TRANSACTIONS);
        }
        if (storedTxs) {
          const list = JSON.parse(storedTxs) as any[];
          const sortedList = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          if (userId) {
            return sortedList.filter(tx => tx.sender_id === userId || tx.receiver_id === userId);
          }
          return sortedList;
        }
      } catch (e) {
        console.warn('Error reading demo transactions:', e);
      }

      // Fallback baseline transaction
      return [
        {
          id: 'tx1',
          sender_id: 'alumno-demo-1',
          receiver_id: 'docente-demo-1',
          from_user: 'alumno-demo-1',
          to_user: 'docente-demo-1',
          amount: 25,
          transaction_type: 'accept_answer',
          type: 'accept_answer',
          status: 'completed',
          question_id: 'q1',
          answer_id: 'ans1',
          description: 'Transferencia de tokens por respuesta aceptada.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          question_title: 'Integral definida trigonométrica',
          sender_name: 'José Pérez',
          receiver_name: 'Prof. Carlos Mendoza'
        }
      ].filter(tx => !userId || tx.sender_id === userId || tx.receiver_id === userId);
    }

    // Real Supabase mode
    let query = supabase
      .from('transactions')
      .select('*, question:questions(title), sender:profiles!sender_id(full_name), receiver:profiles!receiver_id(full_name)');
    
    if (userId) {
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map((tx: any) => ({
      id: tx.id,
      sender_id: tx.sender_id,
      receiver_id: tx.receiver_id,
      from_user: tx.from_user || tx.sender_id,
      to_user: tx.to_user || tx.receiver_id,
      amount: tx.amount,
      transaction_type: tx.transaction_type || tx.type,
      type: tx.type || tx.transaction_type,
      status: tx.status,
      question_id: tx.question_id,
      answer_id: tx.answer_id,
      description: tx.description,
      created_at: tx.created_at,
      question_title: tx.question?.title || 'Ejercicio matemático',
      sender_name: tx.sender?.full_name || 'Alumno',
      receiver_name: tx.receiver?.full_name || 'Docente'
    }));
  }
};
