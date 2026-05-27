export type UserRole = 'alumno' | 'docente' | 'administrador';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  tokens: number;
  reputation: number;
  created_at?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  category: string;
  difficulty: 'Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada';
  reward_tokens: number;
  status: 'open' | 'solved';
  author_id: string;
  accepted_answer_id?: string | null;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  image_url?: string | null;
  votes: number;
  is_accepted: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  sender_id?: string | null;
  receiver_id?: string | null;
  amount: number;
  transaction_type: 'publish_question' | 'accept_answer' | 'admin_grant' | 'admin_refund';
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
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
}
