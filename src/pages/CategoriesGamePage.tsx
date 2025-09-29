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

const CategoriesGamePage = () => {
  const [selectedGame, setSelectedGame] = useState<CategoryGameTemplate>(categoryGames[0]);
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
  const [showGameSelection, setShowGameSelection] = useState(true);

  // Initialize game when a game template is selected
  useEffect(() => {
    if (selectedGame && !showGameSelection) {
      initializeGame(selectedGame);
    }
  }, [selectedGame, showGameSelection]);

  const initializeGame = (gameTemplate: CategoryGameTemplate) => {
    // Shuffle movies for display
    const shuffledMovies = [...gameTemplate.movies].sort(() => Math.random() - 0.5);
    
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
      const categoryName = gameState.categories.find(c => c.id === categoryId)?.name || categoryId;
      
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
        title: "Correct! 🎉",
        description: `You found the "${categoryName}" category!`,
      });

      if (gameState.completedCategories.length === gameState.categories.length - 1) {
        toast({
          title: "Congratulations! 🏆",
          description: "You've completed all categories!",
        });
      }
    } else {
      setGameState(prev => ({
        ...prev,
        selectedMovies: [],
        mistakeCount: prev.mistakeCount + 1,
        attemptHistory: [...prev.attemptHistory, attempt],
        isComplete: prev.mistakeCount + 1 >= prev.maxMistakes,
        isWon: false,
        endTime: prev.mistakeCount + 1 >= prev.maxMistakes ? new Date() : prev.endTime
      }));

      toast({
        title: "Not quite right 🤔",
        description: `${gameState.maxMistakes - gameState.mistakeCount - 1} mistakes remaining`,
        variant: "destructive"
      });
    }
  };

  const resetGame = () => {
    if (selectedGame) {
      initializeGame(selectedGame);
    }
  };

  const shuffleMovies = () => {
    const shuffled = [...gameState.movies].sort(() => Math.random() - 0.5);
    setGameState(prev => ({ ...prev, movies: shuffled }));
  };

  const clearSelection = () => {
    setGameState(prev => ({ ...prev, selectedMovies: [] }));
  };

  // Game selection screen
  if (showGameSelection) {
    return (
      <Layout className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              🎯 Categories Game
            </h1>
            <p className="text-muted-foreground">
              Group 16 movies into 4 categories of 4 movies each
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {categoryGames.map((game) => (
              <Card 
                key={game.id} 
                className="gradient-card shadow-elevated cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setSelectedGame(game);
                  setShowGameSelection(false);
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Difficulty:</span>
                      <Badge variant={
                        game.config.gameDifficulty === 'beginner' ? 'default' :
                        game.config.gameDifficulty === 'intermediate' ? 'secondary' :
                        game.config.gameDifficulty === 'advanced' ? 'outline' : 'destructive'
                      }>
                        {game.config.gameDifficulty}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {game.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                onClick={() => setShowGameSelection(true)} 
                variant="outline" 
                className="w-full"
              >
                Choose Different Game
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
            onClick={() => setShowGameSelection(true)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableMovies.map((movie, index) => {
                const isSelected = gameState.selectedMovies.find(m => m.id === movie.id);
                const category = gameState.categories.find(c => c.id === movie.categoryId);
                
                return (
                  <Button
                    key={movie.id}
                    onClick={() => handleMovieClick(movie)}
                    variant="outline"
                    className={cn(
                      "h-20 text-wrap text-sm font-medium transition-all duration-200 animate-fade-in",
                      isSelected && "ring-2 ring-cinema-gold bg-cinema-gold/10"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {movie.title}
                  </Button>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleSubmitAttempt}
                disabled={gameState.selectedMovies.length !== 4}
                className="gradient-gold text-cinema-dark font-semibold"
              >
                Submit Group ({gameState.selectedMovies.length}/4)
              </Button>
              <Button
                onClick={clearSelection}
                variant="outline"
                disabled={gameState.selectedMovies.length === 0}
              >
                Clear Selection
              </Button>
            </div>

            {gameState.completedCategories.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground text-center">
                  Completed Categories:
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {gameState.completedCategories.map((categoryId) => {
                    const category = gameState.categories.find(c => c.id === categoryId);
                    return category ? (
                      <Badge 
                        key={categoryId}
                        className={cn(
                          category.colors.bg,
                          category.colors.border,
                          category.colors.text
                        )}
                      >
                        {category.name}
                      </Badge>
                    ) : null;
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