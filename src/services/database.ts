// =============================================
// DATABASE SERVICE - CAST GAME OPERATIONS
// =============================================
// Basic service layer for cast game operations
// Uses direct supabase client without strict typing for now
// =============================================

import { supabase } from '@/lib/supabase'

// Type the supabase client properly
const db = supabase

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Simple function to test database connectivity
export async function testDatabaseConnection() {
  try {
    // Test with a simple query that should work regardless of table structure
    const { error } = await db
      .from('users')
      .select('id')
      .limit(1)

    if (error) throw error
    return { success: true, message: 'Database connected successfully' }
  } catch (error) {
    return { success: false, message: `Database error: ${error}` }
  }
}

// Check if tables exist (for debugging)
export async function checkTables() {
  const tables = ['users', 'cast_games', 'cast_game_players', 'cast_game_attempts', 'cast_game_stats']
  const results: Record<string, boolean> = {}
  
  for (const table of tables) {
    try {
      const { error } = await (db as any)
        .from(table)
        .select('*')
        .limit(1)
      
      results[table] = !error
    } catch {
      results[table] = false
    }
  }
  
  return results
}

// Basic game creation (simplified for testing)
export async function createBasicGame(gameData: {
  movieTitle: string
  userId: string
}) {
  try {
    const { data, error } = await (db as any)
      .from('cast_games')
      .insert({
        mode: 'standard',
        language: 'en',
        movie_title: gameData.movieTitle,
        created_by: gameData.userId,
        is_public: false,
        share_slug: `game-${Date.now()}`,
        cast_data: []
      })
      .select()
    
    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Failed to create game:', error)
    throw error
  }
}

// Basic player operations
export async function joinGameAsPlayer(gameId: string, userId: string) {
  try {
    const { data, error } = await (db as any)
      .from('cast_game_players')
      .insert({
        cast_game_id: gameId,
        user_id: userId
      })
      .select()
    
    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Failed to join game:', error)
    throw error
  }
}

// Get game info
export async function getGameInfo(gameId: string) {
  try {
    const { data, error } = await (db as any)
      .from('cast_games')
      .select('*')
      .eq('id', gameId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Failed to get game:', error)
    throw error
  }
}

// =============================================
// PLACEHOLDER CLASSES FOR FUTURE DEVELOPMENT
// =============================================

export class CastGameService {
  static async createGame(gameData: any) {
    return createBasicGame({
      movieTitle: gameData.movieTitle,
      userId: gameData.userId
    })
  }

  static async getGameById(gameId: string) {
    return getGameInfo(gameId)
  }

  static async getGameBySlug(shareSlug: string) {
    try {
      const { data, error } = await (db as any)
        .from('cast_games')
        .select('*')
        .eq('share_slug', shareSlug)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Failed to get game by slug:', error)
      return null
    }
  }
}

export class CastGamePlayerService {
  static async joinGame(gameId: string, userId: string) {
    return joinGameAsPlayer(gameId, userId)
  }

  static async getPlayerInfo(gameId: string, userId: string) {
    try {
      const { data, error } = await (db as any)
        .from('cast_game_players')
        .select('*')
        .eq('cast_game_id', gameId)
        .eq('user_id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Failed to get player info:', error)
      return null
    }
  }
}

export class CastGameAttemptService {
  static async recordAttempt(attemptData: any) {
    // Placeholder for now
    console.log('Recording attempt:', attemptData)
    return { success: true }
  }

  static async getGameAttempts(gameId: string, userId?: string) {
    // Placeholder for now
    console.log('Getting attempts for game:', gameId, userId)
    return []
  }
}

export class CastGameStatsService {
  static async getUserStats(userId: string) {
    // Placeholder for now
    console.log('Getting stats for user:', userId)
    return null
  }

  static async getLeaderboard(limit: number = 20) {
    // Placeholder for now
    console.log('Getting leaderboard, limit:', limit)
    return []
  }
}