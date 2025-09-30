/**
 * Types for the Categories/Grouping Game
 * 
 * A game where players must group 16 movies into 4 categories of 4 movies each.
 * Categories have different difficulty levels indicated by colors.
 */

export type CategoryDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface CategoryColorScheme {
  bg: string;
  border: string;
  text: string;
}

export interface GameCategory {
  /** Unique identifier for the category */
  id: string;
  /** Display name of the category */
  name: string;
  /** Difficulty level of this category */
  difficulty: CategoryDifficulty;
  /** Color scheme for UI display */
  colors: CategoryColorScheme;
  /** Optional hint text for the category */
  hint?: string;
}

export interface GameMovie {
  /** Unique identifier for the movie */
  id: string;
  /** Display text/title for the movie */
  title: string;
  /** ID of the category this movie belongs to */
  categoryId: string;
  /** Movie poster image URL */
  poster?: string;
  /** Optional additional info (year, director, etc.) */
  metadata?: {
    year?: number;
    director?: string;
    genre?: string;
  };
}

export interface MovieGuess {
  /** The movie that was guessed */
  movie: GameMovie;
  /** The category it was guessed for */
  categoryId: string;
  /** Whether the guess was correct */
  isCorrect: boolean;
  /** Timestamp of the guess */
  timestamp: Date;
}

export interface CategoryAttempt {
  /** The category being attempted */
  categoryId: string;
  /** Movies selected for this category */
  selectedMovies: GameMovie[];
  /** Whether all 4 movies were correct */
  isComplete: boolean;
  /** Whether this attempt was correct */
  isCorrect: boolean;
  /** Number of correct movies in this attempt */
  correctCount: number;
  /** Timestamp of the attempt */
  timestamp: Date;
}

export interface GameState {
  /** All categories in this game */
  categories: GameCategory[];
  /** All movies in this game */
  movies: GameMovie[];
  /** Movies currently selected by the player */
  selectedMovies: GameMovie[];
  /** Categories that have been successfully completed */
  completedCategories: string[];
  /** Current attempt being made */
  currentAttempt: CategoryAttempt | null;
  /** History of all attempts made */
  attemptHistory: CategoryAttempt[];
  /** Total number of mistakes made */
  mistakeCount: number;
  /** Maximum mistakes allowed before game over */
  maxMistakes: number;
  /** Whether the game is complete */
  isComplete: boolean;
  /** Whether the game was won (all categories found) or lost (too many mistakes) */
  isWon: boolean;
  /** Game start time */
  startTime: Date;
  /** Game end time */
  endTime?: Date;
}

export interface GameConfig {
  /** Maximum number of mistakes allowed */
  maxMistakes: number;
  /** Whether to show category hints */
  showHints: boolean;
  /** Whether to shuffle movie positions */
  shuffleMovies: boolean;
  /** Difficulty level of the entire game */
  gameDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface GameResult {
  /** Whether the game was completed successfully */
  success: boolean;
  /** Total time taken to complete the game */
  timeElapsed: number;
  /** Number of mistakes made */
  mistakeCount: number;
  /** Number of categories successfully found */
  categoriesFound: number;
  /** Score based on time and mistakes */
  score: number;
  /** Difficulty of the game */
  difficulty: GameConfig['gameDifficulty'];
}

export interface CategoryGameTemplate {
  /** Unique identifier for this game template */
  id: string;
  /** Display name for this game */
  name: string;
  /** Description of the game theme */
  description: string;
  /** The categories for this game */
  categories: GameCategory[];
  /** The movies for this game */
  movies: GameMovie[];
  /** Default configuration for this game */
  config: GameConfig;
  /** Tags for categorizing game templates */
  tags: string[];
}

// Utility types for game actions
export type GameAction = 
  | { type: 'SELECT_MOVIE'; movie: GameMovie }
  | { type: 'DESELECT_MOVIE'; movie: GameMovie }
  | { type: 'SUBMIT_CATEGORY_ATTEMPT'; categoryId: string }
  | { type: 'RESET_SELECTION' }
  | { type: 'START_GAME'; template: CategoryGameTemplate; config: GameConfig }
  | { type: 'END_GAME' }
  | { type: 'RESTART_GAME' };

// Default color schemes for different difficulties
export const DIFFICULTY_COLORS: Record<CategoryDifficulty, CategoryColorScheme> = {
  easy: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    text: 'text-green-300'
  },
  medium: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-300'
  },
  hard: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    text: 'text-orange-300'
  },
  expert: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-300'
  }
};