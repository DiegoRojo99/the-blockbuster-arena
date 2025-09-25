import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, RefreshCw, Eye, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { MovieSearch, CastReveal } from "@/components/cast-game";
import { GameMovie, TMDBMovie, MovieMode, GameResult } from "@/types/tmdb";
import { getGameMovies, getImageUrl } from "@/services/tmdb";
import { useLanguage } from "@/contexts/LanguageContext";

const CastGamePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get mode from URL params, fallback to popular
  const modeParam = searchParams.get('mode') as MovieMode;
  const selectedMode = ['popular', 'top_rated', 'now_playing', 'upcoming'].includes(modeParam) ? modeParam : 'popular';
  
  const [currentMovie, setCurrentMovie] = useState<GameMovie | null>(null);
  const [availableMovies, setAvailableMovies] = useState<GameMovie[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [usedMovies, setUsedMovies] = useState<number[]>([]);
  const [revealedCast, setRevealedCast] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [guessedMovie, setGuessedMovie] = useState<TMDBMovie | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState<TMDBMovie[]>([]);
  const [clearMovieSelection, setClearMovieSelection] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [currentGameGuessCount, setCurrentGameGuessCount] = useState(0);
  
  const { currentLanguage } = useLanguage();
  
  // Redirect to mode selection if no valid mode is provided
  useEffect(() => {
    if (!modeParam || !['popular', 'top_rated', 'now_playing', 'upcoming'].includes(modeParam)) {
      navigate('/cast-game-modes');
      return;
    }
  }, [modeParam, navigate]);
  const maxReveals = 6;

  // Load movies when component mounts or language/mode changes
  useEffect(() => {
    loadGameMovies();
  }, [currentLanguage, selectedMode]);

  const loadGameMovies = async () => {
    setIsLoading(true);
    try {
      const movies = await getGameMovies(currentLanguage, 500, selectedMode);
      if (movies.length === 0) {
        toast({
          title: "Error loading movies",
          description: "Could not load movies for the game. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      setAvailableMovies(movies);
      selectRandomMovie(movies, []);
    } catch (error) {
      console.error("Failed to load movies:", error);
      toast({
        title: "Error",
        description: "Failed to load movies. Please check your connection and try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectRandomMovie = (moviePool: GameMovie[], usedIds: number[]) => {
    // Filter out used movies
    const available = moviePool.filter(m => !usedIds.includes(m.id));

    // If no more movies are available, reload from the same mode
    if (available.length === 0) {
      loadGameMovies();
      return;
    }

    // Select a random movie from the available pool
    const randomMovie = available[Math.floor(Math.random() * available.length)];
    console.log("Selected movie:", randomMovie);
    setCurrentMovie(randomMovie);
    setRevealedCast(1); // Start with 1 cast member revealed
    setGuessedMovie(null);
    setWrongGuesses([]); // Clear wrong guesses for new movie
    setClearMovieSelection(false); // Reset clear selection flag for new movie
    setCurrentGameGuessCount(0); // Reset guess count for new movie
  };

  const handleMovieGuess = (movie: TMDBMovie) => {
    if (!currentMovie) return;
    
    setGuessedMovie(movie);
    setCurrentGameGuessCount(prev => prev + 1);
    const isCorrect = movie.id === currentMovie.id;
    
    if (isCorrect) {
      setScore(score + 1);
      setUsedMovies(prev => [...prev, currentMovie.id]);
      
      // Add to game history
      const gameResult: GameResult = {
        id: `${Date.now()}-${currentMovie.id}`,
        movieId: currentMovie.id,
        movieTitle: currentMovie.title,
        movieYear: currentMovie.year,
        moviePosterPath: currentMovie.posterPath,
        isCorrect: true,
        guessCount: currentGameGuessCount + 1,
        revealedCastCount: revealedCast,
        wrongGuesses: wrongGuesses,
        completedAt: new Date(),
        mode: selectedMode,
        language: currentLanguage
      };
      setGameHistory(prev => [gameResult, ...prev]);
      
      toast({
        title: "Correct! 🎉",
        description: `It was "${currentMovie.title}" (${currentMovie.year})! You got it with ${revealedCast}/${maxReveals} cast members revealed.`,
        duration: 1500,
      });
      
      // Move to next movie after a brief delay
      setTimeout(() => {
        selectRandomMovie(availableMovies, [...usedMovies, currentMovie.id]);
      }, 2000);
    } 
    else {
      // Add wrong guess to the list
      setWrongGuesses(prev => [...prev, movie]);
      
      // Trigger clear selection for wrong guess
      setClearMovieSelection(true);
      
      // Wrong guess - reveal next cast member if available
      if (revealedCast < maxReveals) {
        setRevealedCast(prev => prev + 1);
        toast({
          title: "Incorrect! ❌",
          description: `That's not right. Revealing another cast member...`,
          variant: "destructive",
          duration: 1500,
        });
      } 
      else {
        // No more cast members to reveal - show answer and move to next movie
        toast({
          title: "Game Over for this movie! ❌",
          description: `All cast revealed! It was "${currentMovie.title}" (${currentMovie.year}).`,
          variant: "destructive",
          duration: 1500,
        });
        
        // Add to game history
        const gameResult: GameResult = {
          id: `${Date.now()}-${currentMovie.id}`,
          movieId: currentMovie.id,
          movieTitle: currentMovie.title,
          movieYear: currentMovie.year,
          moviePosterPath: currentMovie.posterPath,
          isCorrect: false,
          guessCount: currentGameGuessCount + wrongGuesses.length + 1,
          revealedCastCount: maxReveals,
          wrongGuesses: wrongGuesses,
          completedAt: new Date(),
          mode: selectedMode,
          language: currentLanguage
        };
        setGameHistory(prev => [gameResult, ...prev]);
        
        setUsedMovies(prev => [...prev, currentMovie.id]);
        
        setTimeout(() => {
          selectRandomMovie(availableMovies, [...usedMovies, currentMovie.id]);
        }, 3000);
      }
      
      // Clear the guessed movie and reset selection flag so they can try again (if cast members remain)
      setTimeout(() => {
        if (revealedCast < maxReveals) {
          setGuessedMovie(null);
        }
        setClearMovieSelection(false); // Reset the clear selection flag
      }, 1500);
    }
    
    setAttempts(attempts + 1);
  };

  const revealNextCast = () => {
    if (revealedCast < maxReveals) {
      setRevealedCast(prev => prev + 1);
    }
  };

  const skipMovie = () => {
    if (!currentMovie) return;
    
    // Add to game history
    const gameResult: GameResult = {
      id: `${Date.now()}-${currentMovie.id}`,
      movieId: currentMovie.id,
      movieTitle: currentMovie.title,
      movieYear: currentMovie.year,
      moviePosterPath: currentMovie.posterPath,
      isCorrect: false,
      guessCount: 0, // Skipped, so no guesses
      revealedCastCount: revealedCast,
      wrongGuesses: wrongGuesses,
      completedAt: new Date(),
      mode: selectedMode,
      language: currentLanguage
    };
    setGameHistory(prev => [gameResult, ...prev]);
    
    setUsedMovies(prev => [...prev, currentMovie.id]);
    toast({
      title: "Skipped",
      description: `It was "${currentMovie.title}" (${currentMovie.year})`,
      duration: 1500,
    });
    
    selectRandomMovie(availableMovies, [...usedMovies, currentMovie.id]);
    setAttempts(attempts + 1);
  };

  const resetGame = () => {
    setScore(0);
    setAttempts(0);
    setUsedMovies([]);
    setGameOver(false);
    setRevealedCast(0);
    setGuessedMovie(null);
    setWrongGuesses([]);
    setClearMovieSelection(false);
    setGameHistory([]);
    setCurrentGameGuessCount(0);
    if (availableMovies.length > 0) {
      selectRandomMovie(availableMovies, []);
    } else {
      loadGameMovies();
    }
  };

  if (isLoading) {
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
      <div className="max-w-4xl mx-auto pt-4 space-y-6">
        {/* Header with stats and controls */}
        <div className="flex flex-row gap-4 lg:items-center justify-between">
          <Link to="/cast-game-modes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Mode
            </Button>
          </Link>
          <div className="flex gap-3">
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Current Mode Display */}
        <div className="text-center">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {
              selectedMode === 'popular' ? '🔥 Popular Movies' : 
              selectedMode === 'top_rated' ? '⭐ Top Rated' :
              selectedMode === 'now_playing' ? '🎬 Now Playing' :
              '🎭 Upcoming Movies'
            }
          </Badge>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary">
            <Star className="w-4 h-4 mr-1" />
            Correct: {score}
          </Badge>
          <Badge variant="outline">
            Played: {gameHistory.length}
          </Badge>
          {gameHistory.length > 0 && (
            <Badge variant="default">
              Success Rate: {Math.round((score / gameHistory.length) * 100)}%
            </Badge>
          )}
        </div>

        {currentMovie && (
          <div className="space-y-6">
            {/* Cast Display */}
            <Card className="gradient-card shadow-elevated">
              <CardHeader>
                <CardTitle className="text-xl text-center bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
                  🎭 Guess the Movie by Cast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CastReveal 
                  cast={currentMovie.cast} 
                  revealedCount={revealedCast}
                />
                
                {revealedCast < maxReveals && (!guessedMovie || (guessedMovie.id !== currentMovie.id && revealedCast < maxReveals)) && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={revealNextCast}
                      variant="outline"
                      className="w-full max-w-sm mx-auto"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reveal Next Cast Member ({revealedCast}/{maxReveals})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Movie Search & Answer */}
            <Card className="gradient-card shadow-elevated mx-auto">
              <CardHeader>
                <CardTitle className="text-lg text-center">
                  Your Answer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!guessedMovie || (guessedMovie.id !== currentMovie.id && revealedCast < maxReveals) ? (
                  <>
                    <MovieSearch
                      onMovieSelect={handleMovieGuess}
                      placeholder="Search for the movie..."
                      disabled={false}
                      recentGuesses={wrongGuesses}
                      shouldClearSelection={clearMovieSelection}
                    />
                    
                    <div className="text-center">
                      <Button
                        onClick={skipMovie}
                        variant="outline"
                        className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white mx-auto"
                      >
                        Skip This Movie
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    {guessedMovie.id === currentMovie.id ? (
                      <div className="text-green-600">
                        <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                          ✅ Correct!
                        </Badge>
                        
                        {currentMovie.posterPath && (
                          <div className="flex justify-center mt-4">
                            <img
                              src={getImageUrl(currentMovie.posterPath, 'w342') || ''}
                              alt={currentMovie.title}
                              className="w-32 h-48 object-cover rounded-lg shadow-md"
                            />
                          </div>
                        )}
                        
                        <div className="text-sm text-muted-foreground">
                          Moving to next movie...
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          ❌ Game Over!
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          All cast members revealed!
                        </div>
                        <div className="text-sm">
                          It was: <strong className="text-cinema-gold">{currentMovie.title}</strong>
                        </div>
                        
                        {currentMovie.posterPath && (
                          <div className="flex justify-center mt-4">
                            <img
                              src={getImageUrl(currentMovie.posterPath, 'w342') || ''}
                              alt={currentMovie.title}
                              className="w-32 h-48 object-cover rounded-lg shadow-md"
                            />
                          </div>
                        )}
                        
                        <div className="text-sm text-muted-foreground">
                          Moving to next movie...
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CastGamePage;