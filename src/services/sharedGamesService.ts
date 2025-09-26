// =============================================
// SHARED CAST GAMES SERVICE
// =============================================
// Service for creating and managing shareable cast games
// Only saves games when user wants to share them
// =============================================

import { supabase } from '@/lib/supabase';
import type { 
  SharedCastGame, 
  SharedGameAttempt, 
  ShareGameData, 
  SubmitAttemptData,
  GameLeaderboard 
} from '@/types/shared-games';

export class SharedCastGameService {
  
  /**
   * Create a new shared cast game
   * This is called when user clicks "Share This Challenge"
   */
  static async createSharedGame(gameData: ShareGameData): Promise<{ shareSlug: string; gameId: string }> {
    try {
      // Generate unique share slug using our database function
      const { data: shareSlug, error: slugError } = await supabase.rpc('generate_share_slug');
      
      if (slugError) throw slugError;
      if (!shareSlug) throw new Error('Failed to generate share slug');

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        tmdb_movie_id: gameData.tmdbMovieId,
        movie_title: gameData.movieTitle,
        movie_year: gameData.movieYear,
        movie_poster_path: gameData.moviePosterPath,
        cast_data: gameData.castData,
        mode: gameData.mode,
        language: gameData.language,
        created_by: user?.id || null,
        creator_username: gameData.creatorUsername || user?.user_metadata?.username || 'Anonymous',
        share_slug: shareSlug,
        is_public: true
      };

      const { data: game, error } = await (supabase as any)
        .from('shared_cast_games')
        .insert(insertData)
        .select('id, share_slug')
        .single();

      if (error) throw error;
      if (!game) throw new Error('Failed to create shared game');

      return {
        shareSlug: game.share_slug,
        gameId: game.id
      };
    } catch (error) {
      console.error('Error creating shared game:', error);
      throw error;
    }
  }

  /**
   * Get shared game by slug
   */
  static async getSharedGame(shareSlug: string): Promise<SharedCastGame | null> {
    try {
      console.log('Fetching shared game with slug:', shareSlug);
      
      const { data: game, error } = await (supabase as any)
        .from('shared_cast_games')
        .select('*')
        .eq('share_slug', shareSlug)
        .single();

      console.log('Supabase response:', { data: game, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Game not found for slug:', shareSlug);
          return null; // Not found
        }
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Game fetched successfully:', game);
      return game;
    } catch (error) {
      console.error('Error fetching shared game:', error);
      throw error;
    }
  }

  /**
   * Submit an attempt for a shared game
   * Supports both authenticated and anonymous users
   */
  static async submitAttempt(attemptData: SubmitAttemptData): Promise<SharedGameAttempt> {
    try {
      // First, get the game to validate it exists
      const game = await this.getSharedGame(attemptData.shareSlug);
      if (!game) throw new Error('Game not found');

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if user already has an attempt for this game (prevent duplicates)
      if (user) {
        const { data: existingAttempts, error: checkError } = await (supabase as any)
          .from('shared_game_attempts')
          .select('id')
          .eq('shared_game_id', game.id)
          .eq('user_id', user.id)
          .limit(1);

        // Only throw error if query failed (not if no records found)
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing attempts:', checkError);
        }

        if (existingAttempts && existingAttempts.length > 0) {
          throw new Error('You have already completed this game');
        }
      }

      const insertData = {
        shared_game_id: game.id,
        user_id: user?.id || null,
        player_name: attemptData.playerName,
        is_correct: attemptData.isCorrect,
        guess_count: attemptData.guessCount,
        cast_revealed_count: attemptData.castRevealedCount,
        time_taken_seconds: attemptData.timeTakenSeconds
      };

      const { data: attempt, error } = await (supabase as any)
        .from('shared_game_attempts')
        .insert(insertData)
        .select('*')
        .single();

      if (error) throw error;
      if (!attempt) throw new Error('Failed to submit attempt');

      return attempt;
    } catch (error) {
      console.error('Error submitting attempt:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard for a shared game
   */
  static async getGameLeaderboard(shareSlug: string): Promise<GameLeaderboard[]> {
    try {
      // First get the game to get its ID
      const game = await this.getSharedGame(shareSlug);
      if (!game) return [];

      // Then get attempts for that game
      const { data: attempts, error } = await (supabase as any)
        .from('shared_game_attempts')
        .select(`
          player_name,
          is_correct,
          guess_count,
          cast_revealed_count,
          completed_at,
          user_id
        `)
        .eq('shared_game_id', game.id)
        .order('is_correct', { ascending: false })
        .order('guess_count', { ascending: true })
        .order('cast_revealed_count', { ascending: true })
        .order('completed_at', { ascending: true });

      if (error) throw error;

      return attempts || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get game stats (for display on game page)
   */
  static async getGameStats(shareSlug: string): Promise<{
    totalAttempts: number;
    successfulAttempts: number;
    successRate: number;
  }> {
    try {
      const game = await this.getSharedGame(shareSlug);
      if (!game) throw new Error('Game not found');

      const successRate = game.total_attempts > 0 
        ? Math.round((game.successful_attempts / game.total_attempts) * 100)
        : 0;

      return {
        totalAttempts: game.total_attempts,
        successfulAttempts: game.successful_attempts,
        successRate
      };
    } catch (error) {
      console.error('Error fetching game stats:', error);
      throw error;
    }
  }

  /**
   * Check if user has already completed a game
   */
  static async hasUserCompleted(shareSlug: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const game = await this.getSharedGame(shareSlug);
      if (!game) return false;

      const { data: attempts } = await (supabase as any)
        .from('shared_game_attempts')
        .select('id')
        .eq('shared_game_id', game.id)
        .eq('user_id', user.id)
        .limit(1);

      return attempts && attempts.length > 0;
    } catch (error) {
      console.error('Error checking user completion:', error);
      return false;
    }
  }
}