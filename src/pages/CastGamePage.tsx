import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { 
  MovieSearch, 
  CastReveal, 
  GameControls,
  GameResultModal
} from "@/components/cast-game";
import { MovieMode, TMDBMovie } from "@/types/tmdb";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGameManager } from "@/hooks/useGameManager";

const CastGamePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  
  // Modal state for testing
  const [showResultModal, setShowResultModal] = useState(false);
  const [isCorrectGuess, setIsCorrectGuess] = useState(true);
  
  // Get mode from URL params, fallback to popular
  const modeParam = searchParams.get('mode') as MovieMode;
  const selectedMode = ['popular', 'top_rated', 'now_playing', 'upcoming'].includes(modeParam) ? modeParam : 'popular';
  
  // Use the game manager hook
  const { gameState, clearMovieSelection, actions } = useGameManager({
    mode: selectedMode,
    language: currentLanguage
  });

  const maxReveals = 6;

  // Redirect to mode selection if no valid mode is provided
  useEffect(() => {
    if (!modeParam || !['popular', 'top_rated', 'now_playing', 'upcoming'].includes(modeParam)) {
      navigate('/cast-game-modes');
      return;
    }
  }, [modeParam, navigate]);

  if (gameState.isLoading) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cinema-gold" />
            <h3 className="text-lg font-semibold mb-2">Loading Movies</h3>
            <p className="text-muted-foreground">Getting ready for the ultimate cast guessing challenge...</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto flex flex-row gap-4 items-center justify-between">
          <Link to="/cast-game-modes">
            <button className="flex text-sm md:text-base items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Change Mode
            </button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              {
                selectedMode === 'popular' ? '🔥 Popular Movies' : 
                selectedMode === 'top_rated' ? '⭐ Top Rated' :
                selectedMode === 'now_playing' ? '🎬 Now Playing' :
                '🎭 Upcoming Movies'
              }
            </h1>
          </div>

          <div className="md:hidden"></div> {/* Spacer for flex layout */}
        </div>

        {/* Game-Focused Layout */}
        <div className="max-w-4xl mx-auto space-y-6">
          {gameState.currentMovie && (
            <>
              {/* Cast Display - Main focus */}
              <Card className="gradient-card shadow-elevated">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
                    🎭 Guess the Movie by Cast
                  </h2>
                  
                  <CastReveal 
                    cast={gameState.currentMovie.cast} 
                    revealedCount={gameState.revealedCast}
                  />
                </CardContent>
              </Card>

              {/* Game Controls - Compact */}
              <div className="flex justify-center">
                <GameControls
                  gameState={gameState}
                  maxReveals={maxReveals}
                  onRevealNextCast={async () => {
                    const isGameOver = await actions.revealNextCast();
                    if (isGameOver) {
                      setIsCorrectGuess(false);
                      setShowResultModal(true);
                    }
                  }}
                  onSkipMovie={async () => {
                    await actions.giveUp();
                    setIsCorrectGuess(false);
                    setShowResultModal(true);
                  }}
                  onResetGame={actions.resetGame}
                  disabled={gameState.isLoading}
                />
              </div>

              {/* Movie Search - Focused */}
              <Card className="gradient-card shadow-elevated">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-center mb-6">
                    🎬 Make Your Guess
                  </h3>
                  
                  <MovieSearch 
                    onMovieSelect={async (movie) => {
                      const result = await actions.takeGuess(movie);
                      // Always clear selection after a guess
                      actions.clearSelection();
                      
                      if (result.isGameOver) {
                        setIsCorrectGuess(result.isCorrect);
                        setShowResultModal(true);
                      }
                    }}
                    onEmptyGuess={async () => {
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
                      const result = await actions.takeGuess(dummyMovie);
                      if (result.isGameOver) {
                        setIsCorrectGuess(result.isCorrect);
                        setShowResultModal(true);
                      }
                    }}
                    shouldClearSelection={clearMovieSelection}
                    disabled={gameState.isLoading}
                  />
                  
                  {/* Wrong Guesses - Inline with search */}
                  {gameState.wrongGuesses.filter(guess => guess.id !== -1).length > 0 && (
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700 font-medium mb-3">
                        ❌ Wrong guesses ({gameState.wrongGuesses.filter(guess => guess.id !== -1).length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {gameState.wrongGuesses.filter(guess => guess.id !== -1).map((guess, index) => (
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
            </>
          )}
        </div>
      </div>
      
      {/* Test Modal - only shows when we have a movie */}
      {gameState.currentMovie && (
        <GameResultModal
          isOpen={showResultModal}
          movie={gameState.currentMovie}
          isCorrect={isCorrectGuess}
          guessCount={gameState.currentGameGuessCount}
          revealedCastCount={gameState.revealedCast}
          maxReveals={maxReveals}
          onPlayAgain={() => {
            setShowResultModal(false);
            actions.resetGame();
          }}
          onChangeMode={() => {
            navigate('/cast-game-modes');
          }}
          onOpenChange={(open) => {
            setShowResultModal(open);
          }}
        />
      )}
    </Layout>
  );
};

export default CastGamePage;