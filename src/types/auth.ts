export type UserRole = 'alumno' | 'docente' | 'administrador';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  tokens: number;
  tokens_locked: number;
  reputation: number;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface Attachment {
  id: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  category_id?: string | null;
  difficulty: 'Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada';
  reward_tokens: number;
  status: 'open' | 'in_review' | 'solved' | 'expired' | 'cancelled';
  author_id: string;
  accepted_answer_id?: string | null;
  created_at: string;
  deleted_at?: string | null;
  attachments?: Attachment[];
  category?: Category | null; // Cargar detalles de la categoría si es necesario
  author?: {
    full_name: string;
    reputation?: number;
  } | null;
  answers?: {
    id: string;
    deleted_at?: string | null;
  }[];
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  votes: number;
  is_accepted: boolean;
  created_at: string;
  updated_at?: string | null;
  is_edited?: boolean;
  image_url?: string | null;
  deleted_at?: string | null;
  attachments?: Attachment[];
  user_name?: string; // Cacheable name for UI rendering
}

export interface Dispute {
  id: string;
  question_id: string;
  opened_by: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface Transaction {
  id: string;
  sender_id?: string | null;
  receiver_id?: string | null;
  from_user?: string | null;
  to_user?: string | null;
  amount: number;
  transaction_type: 'publish_question' | 'accept_answer' | 'admin_grant' | 'admin_refund';
  type?: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  question_id?: string | null;
  answer_id?: string | null;
  description?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'question' | 'answer';
  target_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  deleted_at?: string | null;
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
}
