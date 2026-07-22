import { supabase } from './supabase';
import { Answer } from '../types/auth';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StorageService } from './storage';

const STORAGE_KEYS = {
  ANSWERS: 'yachaiya_demo_answers_v2',
  QUESTIONS: 'yachaiya_demo_questions_v2',
  PROFILES: 'yachaiya_demo_profiles_v2',
  NOTIFICATIONS: 'yachaiya_demo_notifications_v2',
  TRANSACTIONS: 'yachaiya_demo_transactions_v2'
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

const getDemoUser = async (): Promise<{ id: string; full_name: string } | null> => {
  try {
    const stored = Platform.OS === 'web'
      ? localStorage.getItem('yachaiya_demo_user')
      : await SecureStore.getItemAsync('yachaiya_demo_user');
    if (stored) {
      const u = JSON.parse(stored);
      return { id: u.id, full_name: u.full_name };
    }
  } catch (e) {
    console.warn('Error reading demo user:', e);
  }
  return null;
};

const SEED_ANSWERS: Answer[] = [
  {
    id: 'ans1',
    question_id: 'q1',
    user_id: 'docente-demo-1',
    content: 'Aplicamos integración por partes con $u = x$ y $dv = \\sin(x)dx$:\n$$ u = x \\implies du = dx $$\n$$ v = -\\cos(x) $$\n\nPor lo tanto:\n$$ \\int x \\sin(x) dx = -x\\cos(x) + \\int \\cos(x)dx = -x\\cos(x) + \\sin(x) $$\n\nEvaluando en los límites $[0, \\pi]$:\n$$ [-\\pi\\cos(\\pi) + \\sin(\\pi)] - [-0\\cos(0) + \\sin(0)] = \\pi + 0 = \\pi $$',
    votes: 4,
    is_accepted: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_edited: false,
    image_url: null,
    deleted_at: null,
    attachments: []
  }
];

export const answerService = {
  isDemoMode: IS_DEMO,

  /**
   * Fetches all active answers for a question.
   */
  getAnswersByQuestion: async (questionId: string): Promise<Answer[]> => {
    if (IS_DEMO) {
      const list = await loadDemoData<Answer[]>(STORAGE_KEYS.ANSWERS, SEED_ANSWERS);
      const filtered = list.filter(a => a.question_id === questionId && a.deleted_at === null);
      
      const mapped = filtered.map(a => {
        let name = 'Docente Invitado';
        if (a.user_id === 'docente-demo-1') {
          name = 'Prof. Carlos Mendoza';
        } else if (a.user_id === 'alumno-demo-1') {
          name = 'Alejandro Rivera (Alumno)';
        } else if (a.user_id.startsWith('demo-user-')) {
          name = 'Docente Colaborador';
        }
        return {
          ...a,
          user_name: name
        };
      });

      return mapped.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    const { data, error } = await supabase
      .from('answers')
      .select('*, profiles(full_name)')
      .eq('question_id', questionId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map((a: any) => ({
      id: a.id,
      question_id: a.question_id,
      user_id: a.user_id,
      content: a.content,
      votes: a.votes,
      is_accepted: a.is_accepted,
      created_at: a.created_at,
      updated_at: a.updated_at,
      is_edited: a.is_edited,
      image_url: a.image_url,
      deleted_at: a.deleted_at,
      user_name: a.profiles?.full_name || 'Docente Experto'
    }));
  },

  /**
   * Creates a new answer to a question.
   */
  createAnswer: async (questionId: string, content: string, imageUrl: string | null): Promise<Answer> => {
    if (IS_DEMO) {
      const demoUser = await getDemoUser() || { id: 'docente-demo-1', full_name: 'Prof. Carlos Mendoza' };
      const list = await loadDemoData<Answer[]>(STORAGE_KEYS.ANSWERS, SEED_ANSWERS);

      const newAnswer: Answer = {
        id: 'ans-' + Math.random().toString(36).substr(2, 9),
        question_id: questionId,
        user_id: demoUser.id,
        content: content.trim(),
        votes: 0,
        is_accepted: false,
        created_at: new Date().toISOString(),
        is_edited: false,
        image_url: imageUrl,
        deleted_at: null,
        user_name: demoUser.full_name
      };

      list.push(newAnswer);
      await saveDemoData(STORAGE_KEYS.ANSWERS, list);
      return newAnswer;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado.');

    const { data, error } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
        is_edited: false,
        updated_at: null
      })
      .select('*, profiles(full_name)')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      question_id: data.question_id,
      user_id: data.user_id,
      content: data.content,
      votes: data.votes,
      is_accepted: data.is_accepted,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_edited: data.is_edited,
      image_url: data.image_url,
      deleted_at: data.deleted_at,
      user_name: data.profiles?.full_name || 'Docente Experto'
    };
  },

  /**
   * Updates an existing answer.
   */
  updateAnswer: async (answerId: string, content: string, imageUrl: string | null): Promise<Answer> => {
    if (IS_DEMO) {
      const demoUser = await getDemoUser() || { id: 'docente-demo-1', full_name: 'Prof. Carlos Mendoza' };
      const list = await loadDemoData<Answer[]>(STORAGE_KEYS.ANSWERS, SEED_ANSWERS);
      
      const idx = list.findIndex(a => a.id === answerId);
      if (idx === -1) throw new Error('Respuesta no encontrada.');
      
      if (list[idx].user_id !== demoUser.id) {
        throw new Error('No estás autorizado para editar esta respuesta.');
      }

      if (list[idx].is_accepted) {
        throw new Error('No puedes editar una respuesta que ya ha sido aceptada como solución oficial.');
      }

      list[idx] = {
        ...list[idx],
        content: content.trim(),
        image_url: imageUrl,
        is_edited: true,
        updated_at: new Date().toISOString()
      };

      await saveDemoData(STORAGE_KEYS.ANSWERS, list);
      return {
        ...list[idx],
        user_name: demoUser.full_name
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado.');

    const { data: currentAnswer, error: checkError } = await supabase
      .from('answers')
      .select('is_accepted')
      .eq('id', answerId)
      .single();

    if (checkError) throw checkError;
    if (currentAnswer?.is_accepted) {
      throw new Error('No puedes editar una respuesta que ya ha sido aceptada como solución oficial.');
    }

    const { data, error } = await supabase
      .from('answers')
      .update({
        content: content.trim(),
        image_url: imageUrl,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', answerId)
      .eq('user_id', user.id)
      .select('*, profiles(full_name)')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      question_id: data.question_id,
      user_id: data.user_id,
      content: data.content,
      votes: data.votes,
      is_accepted: data.is_accepted,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_edited: data.is_edited,
      image_url: data.image_url,
      deleted_at: data.deleted_at,
      user_name: data.profiles?.full_name || 'Docente Experto'
    };
  },

  /**
   * Soft deletes an answer.
   */
  deleteAnswer: async (answerId: string): Promise<void> => {
    if (IS_DEMO) {
      const demoUser = await getDemoUser() || { id: 'docente-demo-1' };
      const list = await loadDemoData<Answer[]>(STORAGE_KEYS.ANSWERS, SEED_ANSWERS);
      
      const idx = list.findIndex(a => a.id === answerId);
      if (idx === -1) throw new Error('Respuesta no encontrada.');

      if (list[idx].user_id !== demoUser.id) {
        throw new Error('No estás autorizado para eliminar esta respuesta.');
      }

      if (list[idx].is_accepted) {
        throw new Error('No puedes eliminar una respuesta que ya ha sido aceptada como solución oficial.');
      }

      list[idx] = {
        ...list[idx],
        deleted_at: new Date().toISOString()
      };

      await saveDemoData(STORAGE_KEYS.ANSWERS, list);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado.');

    const { data: currentAnswer, error: checkError } = await supabase
      .from('answers')
      .select('is_accepted')
      .eq('id', answerId)
      .single();

    if (checkError) throw checkError;
    if (currentAnswer?.is_accepted) {
      throw new Error('No puedes eliminar una respuesta que ya ha sido aceptada como solución oficial.');
    }

    const { error } = await supabase
      .from('answers')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', answerId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Accepts an answer as the official solution for a question.
   */
  acceptAnswer: async (questionId: string, answerId: string): Promise<void> => {
    if (IS_DEMO) {
      const answersList = await loadDemoData<Answer[]>(STORAGE_KEYS.ANSWERS, SEED_ANSWERS);
      const questionsList = await loadDemoData<any[]>(STORAGE_KEYS.QUESTIONS, []);

      const ansIdx = answersList.findIndex(a => a.id === answerId);
      if (ansIdx === -1) throw new Error('Respuesta no encontrada.');

      const qIdx = questionsList.findIndex(q => q.id === questionId);
      if (qIdx === -1) throw new Error('Ejercicio no encontrado.');

      const ans = answersList[ansIdx];
      const q = questionsList[qIdx];

      if (q.status === 'solved') {
        throw new Error('Este ejercicio ya ha sido resuelto y pagado.');
      }

      const storedUserStr = Platform.OS === 'web' 
        ? localStorage.getItem('yachaiya_demo_user') 
        : await SecureStore.getItemAsync('yachaiya_demo_user');
      
      if (storedUserStr) {
        const u = JSON.parse(storedUserStr);
        if (u.id === q.author_id) {
          if (u.tokens < q.reward_tokens) {
            throw new Error(`Saldo insuficiente de tokens. Se requieren ${q.reward_tokens} tokens pero solo posees ${u.tokens}.`);
          }
          u.tokens -= q.reward_tokens;
          u.reputation += 2; // +2 reputación Alumno
        } else if (u.id === ans.user_id) {
          u.tokens += q.reward_tokens;
          u.reputation += 10;
        }
        
        if (Platform.OS === 'web') {
          localStorage.setItem('yachaiya_demo_user', JSON.stringify(u));
        } else {
          await SecureStore.setItemAsync('yachaiya_demo_user', JSON.stringify(u));
        }
      }

      // Sync user profiles database in demo
      try {
        const profilesList = await loadDemoData<any[]>(STORAGE_KEYS.PROFILES, []);
        const alumnoIdx = profilesList.findIndex(p => p.id === q.author_id);
        if (alumnoIdx !== -1) {
          profilesList[alumnoIdx].tokens -= q.reward_tokens;
          profilesList[alumnoIdx].reputation += 2;
        }
        const docenteIdx = profilesList.findIndex(p => p.id === ans.user_id);
        if (docenteIdx !== -1) {
          profilesList[docenteIdx].tokens += q.reward_tokens;
          profilesList[docenteIdx].reputation += 10;
        }
        await saveDemoData(STORAGE_KEYS.PROFILES, profilesList);
      } catch (e) {
        console.warn('Error updating demo profiles list:', e);
      }

      ans.is_accepted = true;
      q.status = 'solved';
      q.accepted_answer_id = ans.id;

      await saveDemoData(STORAGE_KEYS.ANSWERS, answersList);
      await saveDemoData(STORAGE_KEYS.QUESTIONS, questionsList);

      const txs = await loadDemoData<any[]>(STORAGE_KEYS.TRANSACTIONS, []);
      txs.push({
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        sender_id: q.author_id,
        receiver_id: ans.user_id,
        from_user: q.author_id,
        to_user: ans.user_id,
        amount: q.reward_tokens,
        transaction_type: 'accept_answer',
        type: 'accept_answer',
        status: 'completed',
        question_id: questionId,
        answer_id: answerId,
        description: 'Transferencia de tokens de alumno a docente por solución oficial.',
        created_at: new Date().toISOString()
      });
      await saveDemoData(STORAGE_KEYS.TRANSACTIONS, txs);

      try {
        const notifs = await loadDemoData<any[]>(STORAGE_KEYS.NOTIFICATIONS, []);
        notifs.push({
          id: 'not-' + Math.random().toString(36).substr(2, 9),
          user_id: ans.user_id,
          title: '¡Tu respuesta fue aceptada! 🎉',
          message: `El alumno aceptó tu solución. Has ganado ${q.reward_tokens} tokens y +10 de reputación.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        await saveDemoData(STORAGE_KEYS.NOTIFICATIONS, notifs);
      } catch (e) {
        console.warn('Error writing demo notification:', e);
      }
      return;
    }

    const { error } = await supabase.rpc('accept_answer_transaction', {
      p_question_id: questionId,
      p_answer_id: answerId
    });

    if (error) throw error;
  },

  /**
   * Fetches proposed answers by a specific user (docente).
   */
  getAnswersByUser: async (userId: string): Promise<Answer[]> => {
    if (IS_DEMO) {
      try {
        const storedAnswers = Platform.OS === 'web'
          ? localStorage.getItem(STORAGE_KEYS.ANSWERS)
          : await SecureStore.getItemAsync(STORAGE_KEYS.ANSWERS);
        if (storedAnswers) {
          const allAns = JSON.parse(storedAnswers) as Answer[];
          return allAns.filter(a => a.user_id === userId && a.deleted_at === null);
        }
      } catch (e) {
        console.warn('Error reading demo answers:', e);
      }
      return SEED_ANSWERS.filter(a => a.user_id === userId);
    }

    const { data, error } = await supabase
      .from('answers')
      .select('*, question:questions(title)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((a: any) => ({
      id: a.id,
      question_id: a.question_id,
      user_id: a.user_id,
      content: a.content,
      votes: a.votes,
      is_accepted: a.is_accepted,
      created_at: a.created_at,
      updated_at: a.updated_at,
      is_edited: a.is_edited,
      image_url: a.image_url,
      deleted_at: a.deleted_at,
      user_name: 'Yo (Docente)',
      question_title: a.question?.title || 'Ejercicio matemático'
    })) as Answer[];
  },

  /**
   * Uploads an answer attachment image.
   */
  uploadAnswerImage: async (localUri: string, userId: string): Promise<string> => {
    const res = await StorageService.uploadMathAttachment(localUri, userId);
    if (res.error) throw new Error(res.error);
    if (!res.url) throw new Error('No public URL returned.');
    return res.url;
  }
};
