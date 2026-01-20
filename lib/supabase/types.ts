/**
 * Supabase Database Types
 * 
 * To generate types from your Supabase schema, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 * 
 * Or use the Supabase CLI:
 * supabase gen types typescript --local > lib/supabase/types.ts
 */

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
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          name: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          code: string
          language: string
          preset_type: string | null
          is_public: boolean
          thumbnail: string | null
          parent_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          code?: string
          language?: string
          preset_type?: string | null
          is_public?: boolean
          thumbnail?: string | null
          parent_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          code?: string
          language?: string
          preset_type?: string | null
          is_public?: boolean
          thumbnail?: string | null
          parent_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      simulations: {
        Row: {
          id: string
          project_id: string
          code_hash: string
          logs: Json
          metrics: Json
          inputs: Json | null
          duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          code_hash: string
          logs: Json
          metrics: Json
          inputs?: Json | null
          duration_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          code_hash?: string
          logs?: Json
          metrics?: Json
          inputs?: Json | null
          duration_ms?: number | null
          created_at?: string
        }
      }
      collab_rooms: {
        Row: {
          id: string
          room_id: string
          project_id: string
          owner_id: string
          members: Json
          state: Json | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          project_id: string
          owner_id: string
          members?: Json
          state?: Json | null
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          project_id?: string
          owner_id?: string
          members?: Json
          state?: Json | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_user: {
        Args: {
          p_clerk_id: string
          p_email: string | null
          p_name: string | null
          p_image: string | null
        }
        Returns: string
      }
      generate_slug: {
        Args: {
          title: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
