import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TMDBMovie, GameMovie, MovieMode, SupportedLanguage } from "@/types/tmdb";
import { 
  MovieSearch, 
  CastReveal, 
  GameControls,
  GameResultModal
} from "@/components/cast-game";

interface CastGameProps {
  /** The movie to play with */
  movie: GameMovie;
  /** Game mode for result modal */
  mode: MovieMode;
  /** Language for result modal */
  language: SupportedLanguage;
  /** Maximum number of cast reveals allowed */
  maxReveals?: number;
  /** Called when user wants to play again */
  onPlayAgain?: () => void;
  /** Called when user wants to change mode/go back */
  onChangeMode?: () => void;
  /** Called when user makes a guess (for tracking attempts in shared games) */
  onGuess?: (movie: TMDBMovie, isCorrect: boolean) => void;
  /** Called when user gives up */
  onGiveUp?: () => void;
  /** Called when user reveals next cast member */
  onRevealCast?: () => void;
  /** Disable game interactions */
  disabled?: boolean;
}

export const CastGame = ({
  movie,
  mode,
  language,
  maxReveals = 6,
  onPlayAgain,
  onChangeMode,
  onGuess,
  onGiveUp,
  onRevealCast,
  disabled = false
}: CastGameProps) => {
  // Game state
  const [revealedCast, setRevealedCast] = useState(1);
  const [guessCount, setGuessCount] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState<TMDBMovie[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [clearSelection, setClearSelection] = useState(false);

  // Reset game state when movie changes
  useEffect(() => {
    setRevealedCast(1);
    setGuessCount(0);
    setWrongGuesses([]);
    setGameOver(false);
    setIsCorrect(false);
    setShowResultModal(false);
    setClearSelection(false);
  }, [movie.id]);

  const handleMovieGuess = async (guessedMovie: TMDBMovie) => {
    if (disabled || gameOver) return;

    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);
    setClearSelection(true);
    
    const correct = guessedMovie.id === movie.id;
    
    // Call external callback for tracking
    onGuess?.(guessedMovie, correct);

    if (correct) {
      setIsCorrect(true);
      setGameOver(true);
      setShowResultModal(true);
    } else {
      // Add to wrong guesses if it's not an empty guess
      if (guessedMovie.id !== -1) {
        setWrongGuesses(prev => [...prev, guessedMovie]);
      }

      // End game if max guesses reached (6 guesses or 6 cast reveals)
      if (newGuessCount >= 6 || revealedCast >= maxReveals) {
        setIsCorrect(false);
        setGameOver(true);
        setShowResultModal(true);
      }
    }

    // Reset clear selection after a brief delay
    setTimeout(() => setClearSelection(false), 100);
  };

  const handleEmptyGuess = async () => {
    if (disabled || gameOver) return;

    // Create a dummy movie for empty guess - will always be incorrect
    const dummyMovie: TMDBMovie = {
      id: -1,
      title: "(Empty Guess)",
      original_title: "(Empty Guess)",
      poster_path: null,
      backdrop_path: null,
      release_date: "",
      overview: "",
      vote_average: 0,
      vote_count: 0,
      genre_ids: [],
      original_language: "en",
      popularity: 0,
      adult: false,
      video: false
    };
    
    await handleMovieGuess(dummyMovie);
  };

  const handleRevealNext = () => {
    if (disabled || gameOver || revealedCast >= maxReveals) return;

    const newRevealedCast = revealedCast + 1;
    setRevealedCast(newRevealedCast);
    
    // Call external callback for tracking
    if (onRevealCast) onRevealCast();

    // End game if max reveals reached
    if (newRevealedCast >= maxReveals) {
      setIsCorrect(false);
      setGameOver(true);
      setShowResultModal(true);
    }
  };

  const handleGiveUp = () => {
    if (disabled || gameOver) return;

    if (onGiveUp) onGiveUp();
    setIsCorrect(false);
    setGameOver(true);
    setShowResultModal(true);
  };

  const handlePlayAgain = () => {
    setShowResultModal(false);
    onPlayAgain?.();
  };

  const handleChangeMode = () => {
    setShowResultModal(false);
    onChangeMode?.();
  };

  // Create game state object for GameControls
  const gameState = {
    currentMovie: movie,
    score: 0,
    attempts: 1,
    revealedCast,
    guessedMovie: null,
    wrongGuesses,
    gameHistory: [],
    currentGameGuessCount: guessCount,
    isLoading: false,
    gameOver
  };

  return (
    <div className="space-y-6">
      {/* Cast Display - Main focus */}
      <Card className="gradient-card shadow-elevated">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
            🎭 Guess the Movie by Cast
          </h2>
          
          <CastReveal 
            cast={movie.cast.slice(0, revealedCast)} 
            revealedCount={revealedCast}
          />
        </CardContent>
      </Card>

      {/* Game Controls - Compact */}
      <div className="flex justify-center">
        <GameControls
          gameState={gameState}
          maxReveals={maxReveals}
          onRevealNextCast={handleRevealNext}
          onSkipMovie={handleGiveUp}
          onResetGame={() => {}} // Not used in this context
          disabled={disabled || gameOver}
        />
      </div>

      {/* Movie Search - Focused */}
      <Card className="gradient-card shadow-elevated">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-center mb-6">
            🎬 Make Your Guess
          </h3>
          
          <MovieSearch 
            onMovieSelect={handleMovieGuess}
            onEmptyGuess={handleEmptyGuess}
            shouldClearSelection={clearSelection}
            disabled={disabled || gameOver}
          />
          
          {/* Wrong Guesses - Inline with search */}
          {wrongGuesses.filter(guess => guess.id !== -1).length > 0 && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium mb-3">
                ❌ Wrong guesses ({wrongGuesses.filter(guess => guess.id !== -1).length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {wrongGuesses.filter(guess => guess.id !== -1).map((guess, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                  >
                    {guess.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Result Modal */}
      <GameResultModal
        isOpen={showResultModal}
        movie={movie}
        isCorrect={isCorrect}
        guessCount={guessCount}
        revealedCastCount={revealedCast}
        maxReveals={maxReveals}
        mode={mode}
        language={language}
        onPlayAgain={handlePlayAgain}
        onChangeMode={handleChangeMode}
        onOpenChange={setShowResultModal}
      />
    </div>
  );
};