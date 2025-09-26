import { useState, useEffect, useRef, useCallback } from 'react';
import { CastGame, GameState, GameCallbacks } from '@/lib/CastGame';
import { MovieMode, SupportedLanguage, TMDBMovie } from '@/types/tmdb';

interface UseGameManagerProps {
  mode: MovieMode;
  language: SupportedLanguage;
}

export const useGameManager = ({ mode, language }: UseGameManagerProps) => {
  const [gameState, setGameState] = useState<GameState>({
    currentMovie: null,
    score: 0,
    attempts: 0,
    revealedCast: 0,
    guessedMovie: null,
    wrongGuesses: [],
    gameHistory: [],
    currentGameGuessCount: 0,
    isLoading: true,
    gameOver: false,
  });

  const [clearMovieSelection, setClearMovieSelection] = useState(false);
  const gameRef = useRef<CastGame | null>(null);

  // Create game callbacks
  const gameCallbacks: GameCallbacks = {
    onStateChange: useCallback((newState: GameState) => {
      setGameState(newState);
    }, []),
    
    onMovieChange: useCallback(() => {
      setClearMovieSelection(false);
    }, []),
    
    onGameComplete: useCallback(() => {
      // Trigger clear selection for UI feedback
      setClearMovieSelection(true);
      setTimeout(() => setClearMovieSelection(false), 1500);
    }, []),
  };

  // Initialize game when mode or language changes
  useEffect(() => {
    const initializeGame = async () => {
      if (gameRef.current) {
        // Clean up previous game if needed
        gameRef.current = null;
      }
      
      const game = new CastGame(mode, language, gameCallbacks);
      gameRef.current = game;
      
      await game.initialize();
    };

    initializeGame();
  }, [mode, language]);

  // Game action handlers
  const takeGuess = useCallback(async (movie: TMDBMovie): Promise<{ isCorrect: boolean; isGameOver: boolean }> => {
    if (!gameRef.current) return { isCorrect: false, isGameOver: false };
    return await gameRef.current.takeGuess(movie);
  }, []);

  const revealNextCast = useCallback(async (): Promise<boolean> => {
    if (!gameRef.current) return false;
    return await gameRef.current.revealNextCast();
  }, []);

  const skipMovie = useCallback(async (): Promise<void> => {
    if (!gameRef.current) return;
    await gameRef.current.skipMovie();
  }, []);

  const giveUp = useCallback(async (): Promise<void> => {
    if (!gameRef.current) return;
    await gameRef.current.giveUp();
  }, []);

  const resetGame = useCallback(async (): Promise<void> => {
    if (!gameRef.current) return;
    await gameRef.current.resetGame();
  }, []);

  const clearSelection = useCallback(() => {
    setClearMovieSelection(true);
    setTimeout(() => setClearMovieSelection(false), 100);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gameRef.current = null;
    };
  }, []);

  return {
    gameState,
    clearMovieSelection,
    actions: {
      takeGuess,
      revealNextCast,
      skipMovie,
      giveUp,
      resetGame,
      clearSelection,
    },
  };
};