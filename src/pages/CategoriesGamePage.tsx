import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, ArrowLeft, Shuffle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

// Import our new types and data
import { 
  CategoryGameTemplate, 
  GameMovie, 
  GameCategory, 
  GameState, 
  CategoryAttempt 
} from "@/types/categories-game";
import categoryGames from "@/data/categories-game";
import { getCategoryGameTemplates } from "@/services/categoryGamesService";

const CategoriesGamePage = () => {
  const [selectedGame, setSelectedGame] = useState<CategoryGameTemplate | null>(null);
  const [availableGames, setAvailableGames] = useState<CategoryGameTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    categories: [],
    movies: [],
    selectedMovies: [],
    completedCategories: [],
    currentAttempt: null,
    attemptHistory: [],
    mistakeCount: 0,
    maxMistakes: 4,
    isComplete: false,
    isWon: false,
    startTime: new Date()
  });

  // Load games and start with a random one
  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        // Try to get games from database first
        const dbGames = await getCategoryGameTemplates();
        
        // Use database games if available, otherwise fallback to static data
        const games = dbGames.length > 0 ? dbGames : categoryGames;
        setAvailableGames(games);
        
        // Pick a random game to start with
        if (games.length > 0) {
          const randomGame = games[Math.floor(Math.random() * games.length)];
          setSelectedGame(randomGame);
          initializeGame(randomGame);
        }
      } catch (error) {
        console.error('Error loading games:', error);
        // Fallback to static games
        setAvailableGames(categoryGames);
        const randomGame = categoryGames[Math.floor(Math.random() * categoryGames.length)];
        setSelectedGame(randomGame);
        initializeGame(randomGame);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGames();
  }, []);

  // Initialize game when a game template is selected
  useEffect(() => {
    if (selectedGame) {
      initializeGame(selectedGame);
    }
  }, [selectedGame]);

  const initializeGame = (gameTemplate: CategoryGameTemplate) => {
    // Ensure we have exactly 16 movies (4 categories × 4 movies each)
    const gameMovies = gameTemplate.movies.slice(0, 16);
    
    // Shuffle movies for display
    const shuffledMovies = [...gameMovies].sort(() => Math.random() - 0.5);
    
    setGameState({
      categories: gameTemplate.categories,
      movies: shuffledMovies,
      selectedMovies: [],
      completedCategories: [],
      currentAttempt: null,
      attemptHistory: [],
      mistakeCount: 0,
      maxMistakes: gameTemplate.config.maxMistakes,
      isComplete: false,
      isWon: false,
      startTime: new Date()
    });
  };

  const handleMovieClick = (movie: GameMovie) => {
    if (gameState.completedCategories.includes(movie.categoryId)) {
      return; // Can't select movies from completed categories
    }

    if (gameState.selectedMovies.find(m => m.id === movie.id)) {
      // Deselect movie
      setGameState(prev => ({
        ...prev,
        selectedMovies: prev.selectedMovies.filter(m => m.id !== movie.id)
      }));
    } else if (gameState.selectedMovies.length < 4) {
      // Select movie
      setGameState(prev => ({
        ...prev,
        selectedMovies: [...prev.selectedMovies, movie]
      }));
    }
  };

  const handleSubmitAttempt = () => {
    if (gameState.selectedMovies.length !== 4) return;

    const selectedCategories = gameState.selectedMovies.map(movie => movie.categoryId);
    const uniqueCategories = new Set(selectedCategories);
    
    const isCorrect = uniqueCategories.size === 1;
    const categoryId = selectedCategories[0];
    
    const attempt: CategoryAttempt = {
      categoryId,
      selectedMovies: [...gameState.selectedMovies],
      isComplete: isCorrect,
      isCorrect,
      correctCount: isCorrect ? 4 : 0,
      timestamp: new Date()
    };

    if (isCorrect && categoryId) {
      const categoryName = gameState.categories.find(c => c.id === categoryId)?.name || 'Unknown Category';
      
      setGameState(prev => {
        const newCompletedCategories = [...prev.completedCategories, categoryId];
        const isGameComplete = newCompletedCategories.length === prev.categories.length;
        
        return {
          ...prev,
          completedCategories: newCompletedCategories,
          selectedMovies: [],
          attemptHistory: [...prev.attemptHistory, attempt],
          isComplete: isGameComplete,
          isWon: isGameComplete,
          endTime: isGameComplete ? new Date() : prev.endTime
        };
      });

      toast({
        title: "Perfect! 🎉",
        description: `You found the "${categoryName}" category!`,
      });

      // Check if this was the last category
      if (gameState.completedCategories.length === gameState.categories.length - 1) {
        setTimeout(() => {
          toast({
            title: "Congratulations! 🏆",
            description: "You've completed all categories! Amazing work!",
          });
        }, 1000);
      }
    } else {
      const mistakesRemaining = gameState.maxMistakes - gameState.mistakeCount - 1;
      const isGameOver = mistakesRemaining <= 0;
      
      setGameState(prev => ({
        ...prev,
        selectedMovies: [],
        mistakeCount: prev.mistakeCount + 1,
        attemptHistory: [...prev.attemptHistory, attempt],
        isComplete: isGameOver,
        isWon: false,
        endTime: isGameOver ? new Date() : prev.endTime
      }));

      if (isGameOver) {
        toast({
          title: "Game Over 😔",
          description: "No more attempts remaining. Try again!",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Not quite right 🤔",
          description: `${mistakesRemaining} attempt${mistakesRemaining !== 1 ? 's' : ''} remaining`,
          variant: "destructive"
        });
      }
    }
  };

  const resetGame = () => {
    if (selectedGame) {
      initializeGame(selectedGame);
    }
  };

  const startNewRandomGame = () => {
    if (availableGames.length > 0) {
      const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
      setSelectedGame(randomGame);
      initializeGame(randomGame);
    }
  };

  const shuffleMovies = () => {
    const shuffled = [...gameState.movies].sort(() => Math.random() - 0.5);
    setGameState(prev => ({ ...prev, movies: shuffled }));
  };

  const clearSelection = () => {
    setGameState(prev => ({ ...prev, selectedMovies: [] }));
  };

  // Loading screen
  if (isLoading || !selectedGame) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-gold mx-auto"></div>
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </Layout>
    );
  }

  // Game complete screen
  if (gameState.isComplete) {
    const timeElapsed = gameState.endTime 
      ? Math.round((gameState.endTime.getTime() - gameState.startTime.getTime()) / 1000)
      : 0;
    
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
            <CardTitle className="text-3xl bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              {gameState.isWon ? "Perfect!" : "Game Over"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-cinema-gold">
                {gameState.completedCategories.length}/{gameState.categories.length}
              </div>
              <p className="text-muted-foreground">Categories completed</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
                <p>Attempts: {gameState.attemptHistory.length} | Mistakes: {gameState.mistakeCount}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={resetGame} className="w-full gradient-gold text-cinema-dark font-semibold">
                Play Again
              </Button>
              <Button 
                onClick={startNewRandomGame} 
                variant="outline" 
                className="w-full"
              >
                New Random Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Main game screen
  const availableMovies = gameState.movies.filter(
    movie => !gameState.completedCategories.includes(movie.categoryId)
  );

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={startNewRandomGame}
            variant="outline"
            size="sm"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            New Game
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <Star className="w-4 h-4 mr-1" />
              {gameState.completedCategories.length}/{gameState.categories.length}
            </Badge>
            <Badge variant="outline">
              Attempts: {gameState.attemptHistory.length}
            </Badge>
            {gameState.mistakeCount > 0 && (
              <Badge variant="destructive">
                Mistakes: {gameState.mistakeCount}/{gameState.maxMistakes}
              </Badge>
            )}
          </div>

          <Button onClick={shuffleMovies} variant="outline" size="sm">
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>

        <Card className="gradient-card shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              🎬 {selectedGame.name}
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {selectedGame.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 4x4 Movie Grid */}
            <div className="grid grid-cols-4 gap-3">
              {availableMovies.slice(0, 16).map((movie, index) => {
                const isSelected = gameState.selectedMovies.find(m => m.id === movie.id);
                
                return (
                  <Card
                    key={movie.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:scale-105 animate-fade-in",
                      isSelected 
                        ? "ring-2 ring-cinema-gold bg-cinema-gold/10 shadow-lg" 
                        : "hover:shadow-md"
                    )}
                    onClick={() => handleMovieClick(movie)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-3 text-center">
                      {movie.poster && (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-20 object-cover rounded-md mb-2"
                        />
                      )}
                      <p className="text-xs font-medium line-clamp-2">
                        {movie.title}
                      </p>
                      {isSelected && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Selected
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action buttons and selection info */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Select 4 movies that belong to the same category
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <div
                      key={num}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                        gameState.selectedMovies.length >= num
                          ? "bg-cinema-gold border-cinema-gold text-cinema-dark"
                          : "border-muted-foreground/30 text-muted-foreground"
                      )}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleSubmitAttempt}
                  disabled={gameState.selectedMovies.length !== 4}
                  className="gradient-gold text-cinema-dark font-semibold px-8"
                >
                  Submit Group
                </Button>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  disabled={gameState.selectedMovies.length === 0}
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {/* Completed Categories */}
            {gameState.completedCategories.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-center text-muted-foreground">
                  Solved Categories ({gameState.completedCategories.length}/4):
                </h3>
                <div className="space-y-3">
                  {gameState.completedCategories.map((categoryId) => {
                    const category = gameState.categories.find(c => c.id === categoryId);
                    const categoryMovies = gameState.movies.filter(m => m.categoryId === categoryId);
                    
                    if (!category) return null;
                    
                    return (
                      <div 
                        key={categoryId}
                        className={cn(
                          "p-3 rounded-lg border-2",
                          category.colors.bg.replace('bg-', 'bg-opacity-20 bg-'),
                          category.colors.border
                        )}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <Badge 
                            className={cn(
                              category.colors.bg,
                              category.colors.text,
                              "font-medium"
                            )}
                          >
                            {category.name}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {categoryMovies.map((movie) => (
                            <div key={movie.id} className="text-center">
                              <div className="text-xs font-medium text-muted-foreground">
                                {movie.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CategoriesGamePage;