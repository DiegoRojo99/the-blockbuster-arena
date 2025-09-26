// Types for shared cast games

export interface SharedCastGame {
  id: string;
  tmdb_movie_id: number;
  movie_title: string;
  movie_year?: number;
  movie_poster_path?: string;
  cast_data: CastMember[];
  mode: CastGameMode;
  language: GameLanguage;
  created_by?: string;
  creator_username?: string;
  share_slug: string;
  is_public: boolean;
  total_attempts: number;
  successful_attempts: number;
  created_at: string;
}

export interface SharedGameAttempt {
  id: string;
  shared_game_id: string;
  user_id?: string;
  player_name: string;
  is_correct: boolean;
  guess_count: number;
  cast_revealed_count: number;
  time_taken_seconds?: number;
  completed_at: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

export type CastGameMode = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';
export type GameLanguage = 'en' | 'es';

export interface ShareGameData {
  mode: CastGameMode;
  language: GameLanguage;
  tmdbMovieId: number;
  movieTitle: string;
  movieYear?: number;
  moviePosterPath?: string;
  castData: CastMember[];
  creatorUsername?: string;
}

export interface SubmitAttemptData {
  shareSlug: string;
  playerName: string;
  isCorrect: boolean;
  guessCount: number;
  castRevealedCount: number;
  timeTakenSeconds?: number;
}

export interface GameLeaderboard {
  player_name: string;
  is_correct: boolean;
  guess_count: number;
  cast_revealed_count: number;
  completed_at: string;
  user_id?: string;
}