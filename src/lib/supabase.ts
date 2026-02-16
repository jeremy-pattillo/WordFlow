import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'exists' : 'MISSING');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types will be generated here later
export type Database = {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['decks']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['decks']['Insert']>;
      };
      cards: {
        Row: {
          id: string;
          deck_id: string;
          front: string;
          back: string;
          pos: string | null;
          example: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cards']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cards']['Insert']>;
      };
      review_states: {
        Row: {
          card_id: string;
          user_id: string;
          interval_days: number;
          ease_factor: number;
          repetition: number;
          due_at: string;
          lapse_count: number;
        };
        Insert: Database['public']['Tables']['review_states']['Row'];
        Update: Partial<Database['public']['Tables']['review_states']['Row']>;
      };
      review_logs: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          reviewed_at: string;
          rating: 'again' | 'hard' | 'good' | 'easy';
          duration_ms: number | null;
        };
        Insert: Omit<Database['public']['Tables']['review_logs']['Row'], 'reviewed_at'>;
        Update: Partial<Database['public']['Tables']['review_logs']['Insert']>;
      };
      user_stats: {
        Row: {
          user_id: string;
          language: string;
          daily_streak: number;
          last_review_date: string | null;
          total_reviews: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_stats']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_stats']['Insert']>;
      };
    };
  };
};
