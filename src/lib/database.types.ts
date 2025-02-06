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
      lesson_plans: {
        Row: {
          id: string
          user_id: string
          topic: string
          duration: string
          grade_level: string
          prior_knowledge: string | null
          position: string
          content_goals: string | null
          skill_goals: string | null
          sections: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          duration: string
          grade_level: string
          prior_knowledge?: string | null
          position: string
          content_goals?: string | null
          skill_goals?: string | null
          sections?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          duration?: string
          grade_level?: string
          prior_knowledge?: string | null
          position?: string
          content_goals?: string | null
          skill_goals?: string | null
          sections?: Json
          created_at?: string
          updated_at?: string
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