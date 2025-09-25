import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (will be generated from Supabase later)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          email: string | null
          provider: string | null
          preferred_language: string
          theme_preference: string
          created_at: string
          last_active: string
          bio: string | null
          location: string | null
          is_public_profile: boolean
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          provider?: string | null
          preferred_language?: string
          theme_preference?: string
          created_at?: string
          last_active?: string
          bio?: string | null
          location?: string | null
          is_public_profile?: boolean
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          provider?: string | null
          preferred_language?: string
          theme_preference?: string
          created_at?: string
          last_active?: string
          bio?: string | null
          location?: string | null
          is_public_profile?: boolean
        }
      }
      cast_games: {
        Row: {
          id: string
          mode: string
          language: string
          max_cast_reveals: number
          tmdb_movie_id: number
          movie_title: string
          movie_year: number | null
          movie_poster_path: string | null
          cast_data: any
          status: string
          current_cast_revealed: number
          total_attempts: number
          created_by: string
          is_public: boolean
          share_slug: string | null
          created_at: string
          completed_at: string | null
          last_activity: string
        }
        Insert: {
          id?: string
          mode: string
          language?: string
          max_cast_reveals?: number
          tmdb_movie_id: number
          movie_title: string
          movie_year?: number | null
          movie_poster_path?: string | null
          cast_data: any
          status?: string
          current_cast_revealed?: number
          total_attempts?: number
          created_by: string
          is_public?: boolean
          share_slug?: string | null
          created_at?: string
          completed_at?: string | null
          last_activity?: string
        }
        Update: {
          id?: string
          mode?: string
          language?: string
          max_cast_reveals?: number
          tmdb_movie_id?: number
          movie_title?: string
          movie_year?: number | null
          movie_poster_path?: string | null
          cast_data?: any
          status?: string
          current_cast_revealed?: number
          total_attempts?: number
          created_by?: string
          is_public?: boolean
          share_slug?: string | null
          created_at?: string
          completed_at?: string | null
          last_activity?: string
        }
      }
    }
  }
}