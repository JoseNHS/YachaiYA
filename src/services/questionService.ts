import { supabase } from './supabase';
import { Question, Category, Attachment, UserProfile } from '../types/auth';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StorageService } from './storage';

const STORAGE_KEYS = {
  QUESTIONS: 'yachaiya_demo_questions_v2',
  CATEGORIES: 'yachaiya_demo_categories_v2',
  ANSWERS: 'yachaiya_demo_answers_v2',
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

const getFileTypeFromUrl = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
    return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  }
  return 'application/pdf';
};

const SEED_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Álgebra', slug: 'algebra', icon: 'square-root-alt' },
  { id: 'cat2', name: 'Cálculo', slug: 'calculo', icon: 'drafting-compass' },
  { id: 'cat3', name: 'Geometría', slug: 'geometria', icon: 'triangle' },
  { id: 'cat4', name: 'Estadística', slug: 'estadistica', icon: 'chart-bar' },
  { id: 'cat5', name: 'Física Matemática', slug: 'fisica-matematica', icon: 'atom' },
];

const SEED_QUESTIONS: Question[] = [
  {
    id: 'q1',
    title: 'Integral definida trigonométrica',
    description: 'Necesito encontrar el valor exacto de la siguiente integral:\n$$ \\int_0^{\\pi} x \\sin(x) dx $$',
    category_id: 'cat2',
    difficulty: 'Intermedia',
    reward_tokens: 25,
    status: 'solved',
    author_id: 'alumno-demo-1',
    accepted_answer_id: 'ans1',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    deleted_at: null,
    attachments: [
      { id: 'att1', file_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600', file_type: 'image/jpeg', created_at: new Date().toISOString() }
    ]
  },
  {
    id: 'q2',
    title: 'Sistema de ecuaciones lineales 3x3',
    description: 'Resuelve por Cramer la matriz:\n$$ \\begin{cases} x + 2y - z = 4 \\\\ 2x - y + z = 3 \\\\ -x + y + 2z = 5 \\end{cases} $$',
    category_id: 'cat1',
    difficulty: 'Básica',
    reward_tokens: 15,
    status: 'open',
    author_id: 'alumno-demo-1',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    deleted_at: null,
    attachments: []
  },
  {
    id: 'q3',
    title: 'Derivada implícita de curva elíptica',
    description: 'Encuentra $dy/dx$ para la curva definida por:\n$$ y^2 = x^3 + a x + b $$',
    category_id: 'cat2',
    difficulty: 'Avanzada',
    reward_tokens: 35,
    status: 'open',
    author_id: 'alumno-demo-2',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    deleted_at: null,
    attachments: []
  }
];

export interface GetQuestionsOptions {
  search?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  orderBy?: 'recent' | 'highest_reward' | 'lowest_reward' | 'most_answers' | 'highest_reputation';
  page?: number;
  limit?: number;
  authorId?: string;
}

export const questionService = {
  isDemoMode: IS_DEMO,

  /**
   * Fetches math categories.
   */
  getCategories: async (): Promise<Category[]> => {
    if (IS_DEMO) {
      return await loadDemoData<Category[]>(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
    }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as Category[];
  },

  /**
   * Fetches questions by filtering options.
   */
  getQuestions: async (options: GetQuestionsOptions = {}): Promise<Question[]> => {
    const page = options.page || 1;
    const limit = options.limit || 20;

    if (IS_DEMO) {
      let list = await loadDemoData<Question[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
      const categories = await loadDemoData<Category[]>(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
      const answers = await loadDemoData<any[]>(STORAGE_KEYS.ANSWERS, []);

      list = list.filter(q => q.deleted_at === null);

      if (options.authorId) {
        list = list.filter(q => q.author_id === options.authorId);
      }
      if (options.status) {
        list = list.filter(q => q.status === options.status);
      }
      if (options.difficulty) {
        list = list.filter(q => q.difficulty === options.difficulty);
      }
      if (options.category) {
        list = list.filter(q => q.category_id === options.category);
      }
      if (options.search) {
        const queryText = options.search.toLowerCase();
        list = list.filter(q => {
          const categoryObj = categories.find(c => c.id === q.category_id);
          const categoryName = categoryObj ? categoryObj.name.toLowerCase() : '';
          return (
            q.title.toLowerCase().includes(queryText) ||
            q.description.toLowerCase().includes(queryText) ||
            categoryName.includes(queryText)
          );
        });
      }

      let hydrated = list.map(q => {
        const category = categories.find(c => c.id === q.category_id) || null;
        let authorName = 'Estudiante YachaiYa';
        let authorRep = 120;
        if (q.author_id === 'alumno-demo-1') {
          authorName = 'José Pérez';
          authorRep = 185;
        } else if (q.author_id === 'alumno-demo-2') {
          authorName = 'Sofía Vergara';
          authorRep = 45;
        }
        const activeAnswers = answers.filter(a => a.question_id === q.id && a.deleted_at === null);
        return {
          ...q,
          category,
          author: { full_name: authorName, reputation: authorRep },
          answers: activeAnswers
        };
      });

      if (options.orderBy) {
        switch (options.orderBy) {
          case 'highest_reward':
            hydrated.sort((a, b) => b.reward_tokens - a.reward_tokens);
            break;
          case 'lowest_reward':
            hydrated.sort((a, b) => a.reward_tokens - b.reward_tokens);
            break;
          case 'most_answers':
            hydrated.sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0));
            break;
          case 'highest_reputation':
            hydrated.sort((a, b) => (b.author?.reputation || 0) - (a.author?.reputation || 0));
            break;
          case 'recent':
          default:
            hydrated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
        }
      } else {
        hydrated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      const from = (page - 1) * limit;
      return hydrated.slice(from, from + limit);
    }

    let query = supabase
      .from('questions')
      .select('*, category:categories(*), author:profiles(full_name, reputation), attachments:question_attachments(*), answers:answers(id, deleted_at)')
      .is('deleted_at', null);

    if (options.authorId) {
      query = query.eq('author_id', options.authorId);
    }
    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }
    if (options.category) {
      query = query.eq('category_id', options.category);
    }
    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    if (options.orderBy) {
      switch (options.orderBy) {
        case 'highest_reward':
          query = query.order('reward_tokens', { ascending: false });
          break;
        case 'lowest_reward':
          query = query.order('reward_tokens', { ascending: true });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) throw error;

    let results = data as Question[];

    if (options.orderBy === 'most_answers') {
      results = [...results].sort((a, b) => {
        const aCount = a.answers ? a.answers.filter((ans: any) => ans.deleted_at === null).length : 0;
        const bCount = b.answers ? b.answers.filter((ans: any) => ans.deleted_at === null).length : 0;
        return bCount - aCount;
      });
    } else if (options.orderBy === 'highest_reputation') {
      results = [...results].sort((a, b) => {
        const aRep = a.author?.reputation || 0;
        const bRep = b.author?.reputation || 0;
        return bRep - aRep;
      });
    }

    return results;
  },

  /**
   * Fetches detail of a single question.
   */
  getQuestionById: async (id: string): Promise<Question> => {
    if (IS_DEMO) {
      const questionsList = await loadDemoData<Question[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
      const categoriesList = await loadDemoData<Category[]>(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
      const question = questionsList.find(q => q.id === id);

      if (!question || question.deleted_at !== null) {
        throw new Error('Ejercicio no encontrado.');
      }

      const category = categoriesList.find(c => c.id === question.category_id) || null;
      let authorName = 'Estudiante YachaiYa';
      let authorRep = 120;
      if (question.author_id === 'alumno-demo-1') {
        authorName = 'José Pérez';
        authorRep = 185;
      } else if (question.author_id === 'alumno-demo-2') {
        authorName = 'Sofía Vergara';
        authorRep = 45;
      }

      return {
        ...question,
        category,
        author: { full_name: authorName, reputation: authorRep }
      } as any;
    }

    const { data, error } = await supabase
      .from('questions')
      .select('*, category:categories(*), author:profiles(full_name, reputation), attachments:question_attachments(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Question;
  },

  /**
   * Publishes a new question.
   */
  createQuestion: async (
    title: string,
    description: string,
    categoryId: string,
    difficulty: 'Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada',
    rewardTokens: number,
    authorId: string,
    fileUrls: string[] = []
  ): Promise<Question> => {
    if (IS_DEMO) {
      const questions = await loadDemoData<Question[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
      
      const storedUserStr = Platform.OS === 'web' ? localStorage.getItem('yachaiya_demo_user') : await SecureStore.getItemAsync('yachaiya_demo_user');
      if (storedUserStr) {
        const u = JSON.parse(storedUserStr) as UserProfile;
        if (u.tokens < rewardTokens) {
          throw new Error(`Saldo insuficiente de tokens. Requieres ${rewardTokens} tokens pero solo posees ${u.tokens}.`);
        }
        u.tokens -= rewardTokens;
        u.tokens_locked += rewardTokens;
        
        if (Platform.OS === 'web') {
          localStorage.setItem('yachaiya_demo_user', JSON.stringify(u));
        } else {
          await SecureStore.setItemAsync('yachaiya_demo_user', JSON.stringify(u));
        }
      }

      const attachments: Attachment[] = fileUrls.map((url, i) => ({
        id: `att-q-${Date.now()}-${i}`,
        file_url: url,
        file_type: getFileTypeFromUrl(url),
        created_at: new Date().toISOString()
      }));

      const newQ: Question = {
        id: 'q-' + Math.random().toString(36).substr(2, 9),
        title,
        description,
        category_id: categoryId,
        difficulty,
        reward_tokens: rewardTokens,
        status: 'open',
        author_id: authorId,
        created_at: new Date().toISOString(),
        deleted_at: null,
        attachments
      };

      questions.push(newQ);
      await saveDemoData(STORAGE_KEYS.QUESTIONS, questions);

      const txs = await loadDemoData<any[]>('yachaiya_demo_transactions_v2', []);
      txs.push({
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        sender_id: authorId,
        receiver_id: null,
        from_user: authorId,
        to_user: null,
        amount: rewardTokens,
        transaction_type: 'publish_question',
        type: 'publish_question',
        status: 'pending',
        question_id: newQ.id,
        created_at: new Date().toISOString()
      });
      await saveDemoData('yachaiya_demo_transactions_v2', txs);

      return newQ;
    }

    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert([
        {
          title,
          description,
          category_id: categoryId,
          difficulty,
          reward_tokens: rewardTokens,
          author_id: authorId
        }
      ])
      .select()
      .single();

    if (questionError) throw questionError;

    if (fileUrls.length > 0) {
      const attachmentsData = fileUrls.map(url => ({
        question_id: questionData.id,
        file_url: url,
        file_type: getFileTypeFromUrl(url)
      }));

      const { error: attachmentsError } = await supabase
        .from('question_attachments')
        .insert(attachmentsData);

      if (attachmentsError) {
        console.error('Error al insertar adjuntos del ejercicio:', attachmentsError);
      }
    }

    return questionData as Question;
  },

  /**
   * Uploads an image to Supabase Storage math-attachments.
   */
  uploadQuestionImage: async (localUri: string, userId: string): Promise<string> => {
    const res = await StorageService.uploadMathAttachment(localUri, userId);
    if (res.error) throw new Error(res.error);
    if (!res.url) throw new Error('No public URL returned.');
    return res.url;
  },

  /**
   * Deletes a question (soft-delete).
   */
  deleteQuestion: async (questionId: string): Promise<void> => {
    if (IS_DEMO) {
      const list = await loadDemoData<Question[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
      const idx = list.findIndex(q => q.id === questionId);
      if (idx !== -1) {
        list[idx].deleted_at = new Date().toISOString();
        list[idx].status = 'cancelled';
        await saveDemoData(STORAGE_KEYS.QUESTIONS, list);
      }
      return;
    }

    const { error } = await supabase
      .from('questions')
      .update({ deleted_at: new Date().toISOString(), status: 'cancelled' })
      .eq('id', questionId);

    if (error) throw error;
  }
};
