// =============================================
// DATABASE TYPES - SUPABASE SCHEMA
// =============================================
// TypeScript definitions for all database tables
// Generated from supabase_schema.sql
// =============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================
// 1. CORE TYPES
// =============================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: DbUser
        Insert: DbUserInsert
        Update: DbUserUpdate
      }
      game_types: {
        Row: DbGameType
        Insert: DbGameTypeInsert
        Update: DbGameTypeUpdate
      }
      cast_games: {
        Row: DbCastGame
        Insert: DbCastGameInsert
        Update: DbCastGameUpdate
      }
      cast_game_players: {
        Row: DbCastGamePlayer
        Insert: DbCastGamePlayerInsert
        Update: DbCastGamePlayerUpdate
      }
      cast_game_attempts: {
        Row: DbCastGameAttempt
        Insert: DbCastGameAttemptInsert
        Update: DbCastGameAttemptUpdate
      }
      cast_game_stats: {
        Row: DbCastGameStats
        Insert: DbCastGameStatsInsert
        Update: DbCastGameStatsUpdate
      }
      user_game_stats: {
        Row: DbUserGameStats
        Insert: DbUserGameStatsInsert
        Update: DbUserGameStatsUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_slug: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// =============================================
// 2. USER TYPES
// =============================================

export interface DbUser {
  id: string // UUID
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  email: string | null
  provider: string | null
  preferred_language: 'en' | 'es'
  theme_preference: 'light' | 'dark' | 'system'
  is_public_profile: boolean
  created_at: string // timestamp
  last_active: string // timestamp
}

export interface DbUserInsert {
  id: string
  username?: string | null
  display_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  location?: string | null
  email?: string | null
  provider?: string | null
  preferred_language?: 'en' | 'es'
  theme_preference?: 'light' | 'dark' | 'system'
  is_public_profile?: boolean
  created_at?: string
  last_active?: string
}

export interface DbUserUpdate {
  username?: string | null
  display_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  location?: string | null
  email?: string | null
  provider?: string | null
  preferred_language?: 'en' | 'es'
  theme_preference?: 'light' | 'dark' | 'system'
  is_public_profile?: boolean
  last_active?: string
}

// =============================================
// 3. GAME TYPE TYPES
// =============================================

export interface DbGameType {
  id: string
  name: string
  description: string | null
  icon: string | null
  is_active: boolean
  min_players: number
  max_players: number
  supports_sharing: boolean
  supports_resuming: boolean
  version: string
  created_at: string
}

export interface DbGameTypeInsert {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  is_active?: boolean
  min_players?: number
  max_players?: number
  supports_sharing?: boolean
  supports_resuming?: boolean
  version?: string
  created_at?: string
}

export interface DbGameTypeUpdate {
  name?: string
  description?: string | null
  icon?: string | null
  is_active?: boolean
  min_players?: number
  max_players?: number
  supports_sharing?: boolean
  supports_resuming?: boolean
  version?: string
}

// =============================================
// 4. CAST GAME TYPES
// =============================================

export type CastGameMode = 'popular' | 'top_rated' | 'now_playing' | 'upcoming'
export type CastGameStatus = 'active' | 'completed' | 'abandoned'
export type GameLanguage = 'en' | 'es'

// Cast member from TMDB API
export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface DbCastGame {
  id: string // UUID
  mode: CastGameMode
  language: GameLanguage
  max_cast_reveals: number
  tmdb_movie_id: number
  movie_title: string
  movie_year: number | null
  movie_poster_path: string | null
  cast_data: CastMember[] // JSONB array
  status: CastGameStatus
  current_cast_revealed: number
  total_attempts: number
  created_by: string // UUID
  is_public: boolean
  share_slug: string | null
  created_at: string
  completed_at: string | null
  last_activity: string
}

export interface DbCastGameInsert {
  id?: string
  mode: CastGameMode
  language?: GameLanguage
  max_cast_reveals?: number
  tmdb_movie_id: number
  movie_title: string
  movie_year?: number | null
  movie_poster_path?: string | null
  cast_data: CastMember[]
  status?: CastGameStatus
  current_cast_revealed?: number
  total_attempts?: number
  created_by: string
  is_public?: boolean
  share_slug?: string | null
  created_at?: string
  completed_at?: string | null
  last_activity?: string
}

export interface DbCastGameUpdate {
  mode?: CastGameMode
  language?: GameLanguage
  max_cast_reveals?: number
  tmdb_movie_id?: number
  movie_title?: string
  movie_year?: number | null
  movie_poster_path?: string | null
  cast_data?: CastMember[]
  status?: CastGameStatus
  current_cast_revealed?: number
  total_attempts?: number
  is_public?: boolean
  share_slug?: string | null
  completed_at?: string | null
  last_activity?: string
}

// =============================================
// 5. CAST GAME PLAYER TYPES
// =============================================

export interface DbCastGamePlayer {
  id: string // UUID
  cast_game_id: string // UUID
  user_id: string // UUID
  joined_at: string
  last_attempt_at: string | null
  attempts_made: number
  has_solved: boolean
  solved_at: string | null
  cast_revealed_when_solved: number | null
  player_data: Json
}

export interface DbCastGamePlayerInsert {
  id?: string
  cast_game_id: string
  user_id: string
  joined_at?: string
  last_attempt_at?: string | null
  attempts_made?: number
  has_solved?: boolean
  solved_at?: string | null
  cast_revealed_when_solved?: number | null
  player_data?: Json
}

export interface DbCastGamePlayerUpdate {
  last_attempt_at?: string | null
  attempts_made?: number
  has_solved?: boolean
  solved_at?: string | null
  cast_revealed_when_solved?: number | null
  player_data?: Json
}

// =============================================
// 6. CAST GAME ATTEMPT TYPES
// =============================================

export interface DbCastGameAttempt {
  id: string // UUID
  cast_game_id: string // UUID
  user_id: string // UUID
  guessed_tmdb_id: number | null
  guessed_title: string
  is_correct: boolean
  cast_revealed_count: number
  attempt_number: number
  created_at: string
}

export interface DbCastGameAttemptInsert {
  id?: string
  cast_game_id: string
  user_id: string
  guessed_tmdb_id?: number | null
  guessed_title: string
  is_correct: boolean
  cast_revealed_count: number
  attempt_number: number
  created_at?: string
}

export interface DbCastGameAttemptUpdate {
  guessed_tmdb_id?: number | null
  guessed_title?: string
  is_correct?: boolean
  cast_revealed_count?: number
  attempt_number?: number
}

// =============================================
// 7. STATISTICS TYPES
// =============================================

// Mode-specific stats structure
export interface ModeStats {
  played: number
  solved: number
  avg_attempts: number
}

export interface DbCastGameStats {
  user_id: string // UUID (Primary Key)
  // Overall Performance
  games_played: number
  games_solved: number
  total_attempts: number
  // Games Solved by Cast Reveal Count (1-6)
  games_solved_cast_1: number
  games_solved_cast_2: number
  games_solved_cast_3: number
  games_solved_cast_4: number
  games_solved_cast_5: number
  games_solved_cast_6: number
  games_not_completed: number
  // Best Performances
  best_solve_cast_count: number | null
  best_solve_attempts: number | null
  fastest_solve_seconds: number | null
  // Streaks
  current_streak: number
  best_streak: number
  // Mode-specific Statistics
  popular_stats: ModeStats
  top_rated_stats: ModeStats
  now_playing_stats: ModeStats
  upcoming_stats: ModeStats
  // Timing
  first_played: string | null
  last_played: string | null
  updated_at: string
}

export interface DbCastGameStatsInsert {
  user_id: string
  games_played?: number
  games_solved?: number
  total_attempts?: number
  games_solved_cast_1?: number
  games_solved_cast_2?: number
  games_solved_cast_3?: number
  games_solved_cast_4?: number
  games_solved_cast_5?: number
  games_solved_cast_6?: number
  games_not_completed?: number
  best_solve_cast_count?: number | null
  best_solve_attempts?: number | null
  fastest_solve_seconds?: number | null
  current_streak?: number
  best_streak?: number
  popular_stats?: ModeStats
  top_rated_stats?: ModeStats
  now_playing_stats?: ModeStats
  upcoming_stats?: ModeStats
  first_played?: string | null
  last_played?: string | null
  updated_at?: string
}

export interface DbCastGameStatsUpdate {
  games_played?: number
  games_solved?: number
  total_attempts?: number
  games_solved_cast_1?: number
  games_solved_cast_2?: number
  games_solved_cast_3?: number
  games_solved_cast_4?: number
  games_solved_cast_5?: number
  games_solved_cast_6?: number
  games_not_completed?: number
  best_solve_cast_count?: number | null
  best_solve_attempts?: number | null
  fastest_solve_seconds?: number | null
  current_streak?: number
  best_streak?: number
  popular_stats?: ModeStats
  top_rated_stats?: ModeStats
  now_playing_stats?: ModeStats
  upcoming_stats?: ModeStats
  first_played?: string | null
  last_played?: string | null
  updated_at?: string
}

// =============================================
// 8. USER GAME STATS TYPES
// =============================================

export interface DbUserGameStats {
  id: string // UUID
  user_id: string // UUID
  game_type_id: string
  games_played: number
  games_completed: number
  total_score: number
  best_single_game_score: number
  first_played: string | null
  last_played: string | null
  updated_at: string
  stats_data: Json
}

export interface DbUserGameStatsInsert {
  id?: string
  user_id: string
  game_type_id: string
  games_played?: number
  games_completed?: number
  total_score?: number
  best_single_game_score?: number
  first_played?: string | null
  last_played?: string | null
  updated_at?: string
  stats_data?: Json
}

export interface DbUserGameStatsUpdate {
  games_played?: number
  games_completed?: number
  total_score?: number
  best_single_game_score?: number
  first_played?: string | null
  last_played?: string | null
  updated_at?: string
  stats_data?: Json
}

// =============================================
// 9. JOINED/EXTENDED TYPES (for UI)
// =============================================

// Cast Game with creator info
export interface CastGameWithCreator extends DbCastGame {
  creator: Pick<DbUser, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

// Cast Game with player info
export interface CastGameWithPlayer extends DbCastGame {
  player?: DbCastGamePlayer
  creator: Pick<DbUser, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

// User with stats
export interface UserWithStats extends DbUser {
  cast_game_stats?: DbCastGameStats
  user_game_stats?: DbUserGameStats[]
}

// Cast Game attempt with user info
export interface CastGameAttemptWithUser extends DbCastGameAttempt {
  user: Pick<DbUser, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

// =============================================
// 10. API RESPONSE TYPES
// =============================================

export interface CastGameLeaderboard {
  user: Pick<DbUser, 'id' | 'username' | 'display_name' | 'avatar_url'>
  stats: DbCastGameStats
  rank: number
}

export interface GameStatsBreakdown {
  cast_1: number
  cast_2: number
  cast_3: number
  cast_4: number
  cast_5: number
  cast_6: number
  not_completed: number
  total_played: number
  total_solved: number
  solve_rate: number
}

// =============================================
// 11. UTILITY TYPES
// =============================================

export type CastRevealLevel = 1 | 2 | 3 | 4 | 5 | 6

// For updating cast reveal stats
export type CastStatsUpdateMap = {
  [K in CastRevealLevel]: keyof Pick<DbCastGameStats, 
    'games_solved_cast_1' | 'games_solved_cast_2' | 'games_solved_cast_3' | 
    'games_solved_cast_4' | 'games_solved_cast_5' | 'games_solved_cast_6'>
}

export const CAST_STATS_FIELDS: CastStatsUpdateMap = {
  1: 'games_solved_cast_1',
  2: 'games_solved_cast_2',
  3: 'games_solved_cast_3',
  4: 'games_solved_cast_4',
  5: 'games_solved_cast_5',
  6: 'games_solved_cast_6',
} as const

// =============================================
// 12. SUPABASE CLIENT TYPE
// =============================================

export type SupabaseClient = import('@supabase/supabase-js').SupabaseClient<Database>
export type SupabaseUser = import('@supabase/supabase-js').User