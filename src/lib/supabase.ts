import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TopicContent {
  id: string;
  topic_id: string;
  content: string;
  content_type: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'trainee' | 'teacher' | 'trainer';
  native_language: string;
  german_proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  app_language: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceRecord {
  id: string;
  user_id: string;
  topic_id: string;
  lesson_name: string;
  score: number;
  total: number;
  passed: boolean;
  attempts: number;
  last_attempt_at: string;
  score_history: number[];
  created_at: string;
}
