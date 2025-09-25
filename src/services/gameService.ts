// =============================================
// SIMPLE DATABASE SERVICE - CAST GAME OPERATIONS
// =============================================
// Simplified service layer for cast game operations
// Works with current Supabase setup
// =============================================

import { supabase } from '@/lib/supabase'
import type { CastMember, CastGameMode, GameLanguage } from '@/types/database'

// =============================================
// CAST GAME OPERATIONS
// =============================================

export class CastGameService {
  
  // Create a new cast game
  static async createGame(gameData: {
    mode: CastGameMode
    language?: GameLanguage
    tmdbMovieId: number
    movieTitle: string
    movieYear?: number
    moviePosterPath?: string
    castData: CastMember[]
    userId: string
    isPublic?: boolean
  }) {
    
    // Generate unique share slug
    const { data: shareSlug } = await supabase.rpc('generate_share_slug')
    
    const insertData = {
      mode: gameData.mode,
      language: gameData.language || 'en',
      tmdb_movie_id: gameData.tmdbMovieId,
      movie_title: gameData.movieTitle,
      movie_year: gameData.movieYear,
      movie_poster_path: gameData.moviePosterPath,
      cast_data: gameData.castData,
      created_by: gameData.userId,
      is_public: gameData.isPublic || false,
      share_slug: shareSlug,
    }

    const { data, error } = await (supabase as any)
      .from('cast_games')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get game by ID with creator info
  static async getGameById(gameId: string) {
    const { data, error } = await supabase
      .from('cast_games')
      .select(`
        *,
        creator:users!created_by (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', gameId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  // Get game by share slug with creator info
  static async getGameBySlug(shareSlug: string) {
    const { data, error } = await supabase
      .from('cast_games')
      .select(`
        *,
        creator:users!created_by (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('share_slug', shareSlug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  // Update game state
  static async updateGame(gameId: string, updates: Record<string, any>) {
    const { data, error } = await (supabase as any)
      .from('cast_games')
      .update({
        ...updates,
        last_activity: new Date().toISOString(),
      })
      .eq('id', gameId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Reveal next cast member
  static async revealNextCast(gameId: string) {
    const { data: game } = await supabase
      .from('cast_games')
      .select('current_cast_revealed, max_cast_reveals')
      .eq('id', gameId)
      .single()

    if (!game) throw new Error('Game not found')

    if ((game as any).current_cast_revealed >= (game as any).max_cast_reveals) {
      throw new Error('All cast members already revealed')
    }

    return this.updateGame(gameId, {
      current_cast_revealed: (game as any).current_cast_revealed + 1
    })
  }

  // Complete game
  static async completeGame(gameId: string) {
    return this.updateGame(gameId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }
}

// =============================================
// CAST GAME PLAYER OPERATIONS
// =============================================

export class CastGamePlayerService {

  // Join a game (create player record)
  static async joinGame(gameId: string, userId: string) {
    const insertData = {
      cast_game_id: gameId,
      user_id: userId,
    }

    const { data, error } = await (supabase as any)
      .from('cast_game_players')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get player info for a game
  static async getPlayerInfo(gameId: string, userId: string) {
    const { data, error } = await supabase
      .from('cast_game_players')
      .select('*')
      .eq('cast_game_id', gameId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  // Update player progress
  static async updatePlayer(gameId: string, userId: string, updates: Record<string, any>) {
    const { data, error } = await (supabase as any)
      .from('cast_game_players')
      .update(updates)
      .eq('cast_game_id', gameId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Mark game as solved
  static async markSolved(gameId: string, userId: string, castRevealedCount: number) {
    return this.updatePlayer(gameId, userId, {
      has_solved: true,
      solved_at: new Date().toISOString(),
      cast_revealed_when_solved: castRevealedCount,
    })
  }
}

// =============================================
// CAST GAME ATTEMPT OPERATIONS
// =============================================

export class CastGameAttemptService {

  // Record a guess attempt
  static async recordAttempt(attemptData: {
    gameId: string
    userId: string
    guessedTmdbId?: number
    guessedTitle: string
    isCorrect: boolean
    castRevealedCount: number
  }) {
    
    // Get user's current attempt count for this game
    const { count } = await supabase
      .from('cast_game_attempts')
      .select('id', { count: 'exact' })
      .eq('cast_game_id', attemptData.gameId)
      .eq('user_id', attemptData.userId)

    const attemptNumber = (count || 0) + 1

    const insertData = {
      cast_game_id: attemptData.gameId,
      user_id: attemptData.userId,
      guessed_tmdb_id: attemptData.guessedTmdbId,
      guessed_title: attemptData.guessedTitle,
      is_correct: attemptData.isCorrect,
      cast_revealed_count: attemptData.castRevealedCount,
      attempt_number: attemptNumber,
    }

    const { data, error } = await (supabase as any)
      .from('cast_game_attempts')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    // Update player's attempt count and last attempt time
    await CastGamePlayerService.updatePlayer(attemptData.gameId, attemptData.userId, {
      attempts_made: attemptNumber,
      last_attempt_at: new Date().toISOString(),
    })

    return data
  }

  // Get attempts for a game
  static async getGameAttempts(gameId: string, userId?: string) {
    let query = supabase
      .from('cast_game_attempts')
      .select('*')
      .eq('cast_game_id', gameId)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }
}

// =============================================
// USER STATS OPERATIONS
// =============================================

export class CastGameStatsService {

  // Initialize user stats
  static async initializeUserStats(userId: string) {
    const { data, error } = await (supabase as any)
      .from('cast_game_stats')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get user stats
  static async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('cast_game_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  // Get leaderboard (top performers)
  static async getLeaderboard(limit: number = 20) {
    const { data, error } = await supabase
      .from('cast_game_stats')
      .select(`
        *,
        user:users (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order('games_solved', { ascending: false })
      .order('total_attempts', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

// =============================================
// USER PROFILE OPERATIONS
// =============================================

export class UserService {

  // Create user profile
  static async createProfile(userData: {
    id: string
    email?: string
    displayName?: string
    avatarUrl?: string
    provider?: string
    username?: string
  }) {
    const { data, error } = await (supabase as any)
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        display_name: userData.displayName,
        avatar_url: userData.avatarUrl,
        provider: userData.provider || 'email',
        username: userData.username,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get user profile
  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await (supabase as any)
      .from('users')
      .update({
        ...updates,
        last_active: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}