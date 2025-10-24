export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          is_premium: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          is_premium?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          updated_at?: string
          is_premium?: boolean
        }
      }
      fitness_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          experience_level: string
          sessions_per_week: number
          minutes_per_session: number
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: string
          experience_level: string
          sessions_per_week: number
          minutes_per_session: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          goal_type?: string
          experience_level?: string
          sessions_per_week?: number
          minutes_per_session?: number
          updated_at?: string
          is_active?: boolean
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string
          goal_types: string[]
          experience_levels: string[]
          muscle_groups: string[]
          equipment_needed: string[]
          video_url: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          goal_types: string[]
          experience_levels: string[]
          muscle_groups: string[]
          equipment_needed?: string[]
          video_url?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          description?: string
          goal_types?: string[]
          experience_levels?: string[]
          muscle_groups?: string[]
          equipment_needed?: string[]
          video_url?: string | null
          image_url?: string | null
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          sets: number
          reps: number
          weight: number | null
          duration_minutes: number | null
          notes: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          sets: number
          reps: number
          weight?: number | null
          duration_minutes?: number | null
          notes?: string | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          sets?: number
          reps?: number
          weight?: number | null
          duration_minutes?: number | null
          notes?: string | null
        }
      }
      quizzes: {
        Row: {
          id: string
          goal_type: string
          question: string
          options: Json
          correct_answer: string
          explanation: string
          difficulty: string
          created_at: string
        }
        Insert: {
          id?: string
          goal_type: string
          question: string
          options: Json
          correct_answer: string
          explanation: string
          difficulty: string
          created_at?: string
        }
        Update: {
          goal_type?: string
          question?: string
          options?: Json
          correct_answer?: string
          explanation?: string
          difficulty?: string
        }
      }
      quiz_responses: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          user_answer: string
          is_correct: boolean
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          user_answer: string
          is_correct: boolean
          completed_at?: string
        }
        Update: {
          user_answer?: string
          is_correct?: boolean
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_activity_date: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_activity_date: string
          updated_at?: string
        }
        Update: {
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string
          updated_at?: string
        }
      }
      education_content: {
        Row: {
          id: string
          goal_type: string
          title: string
          content: string
          content_type: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          goal_type: string
          title: string
          content: string
          content_type: string
          order_index: number
          created_at?: string
        }
        Update: {
          goal_type?: string
          title?: string
          content?: string
          content_type?: string
          order_index?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
