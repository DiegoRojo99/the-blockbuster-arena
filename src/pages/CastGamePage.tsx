import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, RefreshCw, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { MovieSearch } from "@/components/MovieSearch";
import { CastReveal } from "@/components/CastReveal";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GameMovie, TMDBMovie } from "@/types/tmdb";
import { getGameMovies, getImageUrl } from "@/services/tmdb";
import { useLanguage } from "@/contexts/LanguageContext";

const CastGamePage = () => {
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
  
  const { currentLanguage } = useLanguage();
  const maxReveals = 6;
  const totalGames = 10;

  // Load movies when component mounts or language changes
  useEffect(() => {
    loadGameMovies();
  }, [currentLanguage]);

  const loadGameMovies = async () => {
    setIsLoading(true);
    try {
      const movies = await getGameMovies(currentLanguage, 500);
      if (movies.length === 0) {
        toast({
          title: "Error loading movies",
          description: "Could not load movies for the game. Please try again.",
          variant: "destructive"
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
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectRandomMovie = (moviePool: GameMovie[], usedIds: number[]) => {
    const available = moviePool.filter(m => !usedIds.includes(m.id));
    if (available.length === 0) {
      setGameOver(true);
      return;
    }
    const randomMovie = available[Math.floor(Math.random() * available.length)];
    setCurrentMovie(randomMovie);
    setRevealedCast(1); // Start with 1 cast member revealed
    setGuessedMovie(null);
    setWrongGuesses([]); // Clear wrong guesses for new movie
    setClearMovieSelection(false); // Reset clear selection flag for new movie
  };

  const handleMovieGuess = (movie: TMDBMovie) => {
    if (!currentMovie) return;
    
    setGuessedMovie(movie);
    const isCorrect = movie.id === currentMovie.id;
    
    if (isCorrect) {
      setScore(score + 1);
      setUsedMovies(prev => [...prev, currentMovie.id]);
      toast({
        title: "Correct! 🎉",
        description: `It was "${currentMovie.title}" (${currentMovie.year})! You got it with ${revealedCast}/${maxReveals} cast members revealed.`,
      });
      
      // Move to next movie after a brief delay
      setTimeout(() => {
        if (usedMovies.length + 1 >= totalGames) {
          setGameOver(true);
        } 
        else {
          selectRandomMovie(availableMovies, [...usedMovies, currentMovie.id]);
        }
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
          variant: "destructive"
        });
      } 
      else {
        // No more cast members to reveal - show answer and move to next movie
        toast({
          title: "Game Over for this movie! ❌",
          description: `All cast revealed! It was "${currentMovie.title}" (${currentMovie.year}).`,
          variant: "destructive"
        });
        
        setUsedMovies(prev => [...prev, currentMovie.id]);
        
        setTimeout(() => {
          if (usedMovies.length + 1 >= totalGames) {
            setGameOver(true);
          } 
          else {
            selectRandomMovie(availableMovies, [...usedMovies, currentMovie.id]);
          }
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
    
    setUsedMovies(prev => [...prev, currentMovie.id]);
    toast({
      title: "Skipped",
      description: `It was "${currentMovie.title}" (${currentMovie.year})`,
    });
    
    if (usedMovies.length + 1 >= totalGames) {
      setGameOver(true);
    } 
    else {
      selectRandomMovie(availableMovies, [...usedMovies, currentMovie.id]);
    }
    
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

  if (gameOver) {
    const percentage = Math.round((score / totalGames) * 100);
    let resultMessage = "Game Complete!";
    if (percentage >= 80) resultMessage = "Cinema Expert! 🏆";
    else if (percentage >= 60) resultMessage = "Movie Buff! 🎬";
    else if (percentage >= 40) resultMessage = "Getting There! 📈";
    else resultMessage = "Keep Watching! 📺";

    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
            <CardTitle className="text-3xl bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              {resultMessage}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl font-bold text-cinema-gold">{score}/{totalGames}</div>
            <p className="text-muted-foreground">
              You guessed {score} out of {totalGames} movies correctly! ({percentage}%)
            </p>
            <div className="text-sm text-muted-foreground">
              Total attempts: {attempts}
            </div>
            <div className="space-y-2">
              <Button onClick={resetGame} className="w-full gradient-gold text-cinema-dark font-semibold">
                <RefreshCw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto pt-4 space-y-6">
        {/* Header with stats and language selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <Star className="w-4 h-4 mr-1" />
              Score: {score}/{totalGames}
            </Badge>
            <Badge variant="outline">
              Round: {usedMovies.length + 1}/{totalGames}
            </Badge>
          </div>
          <LanguageSelector />
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
                        className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white max-w-sm mx-auto"
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