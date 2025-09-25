import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

interface Movie {
  id: number;
  title: string;
  cast: string[];
  year: number;
  genre: string;
}

const movies: Movie[] = [
  {
    id: 1,
    title: "The Dark Knight",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Maggie Gyllenhaal"],
    year: 2008,
    genre: "Action"
  },
  {
    id: 2,
    title: "Inception",
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Ellen Page", "Ken Watanabe"],
    year: 2010,
    genre: "Sci-Fi"
  },
  {
    id: 3,
    title: "Pulp Fiction",
    cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis", "Ving Rhames"],
    year: 1994,
    genre: "Crime"
  },
  {
    id: 4,
    title: "The Avengers",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
    year: 2012,
    genre: "Action"
  },
  {
    id: 5,
    title: "Forrest Gump",
    cast: ["Tom Hanks", "Robin Wright", "Gary Sinise", "Mykelti Williamson", "Sally Field"],
    year: 1994,
    genre: "Drama"
  }
];

const CastGamePage = () => {
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [usedMovies, setUsedMovies] = useState<number[]>([]);

  const getRandomMovie = () => {
    const availableMovies = movies.filter(m => !usedMovies.includes(m.id));
    if (availableMovies.length === 0) {
      setGameOver(true);
      return;
    }
    const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
    setCurrentMovie(randomMovie);
  };

  useEffect(() => {
    getRandomMovie();
  }, []);

  const handleGuess = () => {
    if (!currentMovie || !guess.trim()) return;

    const isCorrect = guess.toLowerCase().includes(currentMovie.title.toLowerCase()) || 
                     currentMovie.title.toLowerCase().includes(guess.toLowerCase());
    
    if (isCorrect) {
      setScore(score + 1);
      setUsedMovies([...usedMovies, currentMovie.id]);
      toast({
        title: "Correct! 🎉",
        description: `It was "${currentMovie.title}" (${currentMovie.year})`,
      });
      setGuess("");
      getRandomMovie();
    } else {
      toast({
        title: "Try Again! 🤔",
        description: "That's not quite right. Keep guessing!",
        variant: "destructive"
      });
    }
    setAttempts(attempts + 1);
  };

  const handleSkip = () => {
    if (!currentMovie) return;
    setUsedMovies([...usedMovies, currentMovie.id]);
    toast({
      title: "Skipped",
      description: `It was "${currentMovie.title}" (${currentMovie.year})`,
    });
    getRandomMovie();
    setAttempts(attempts + 1);
  };

  const resetGame = () => {
    setScore(0);
    setAttempts(0);
    setUsedMovies([]);
    setGameOver(false);
    setGuess("");
    getRandomMovie();
  };

  if (gameOver) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-20">
          <Card className="gradient-card shadow-elevated max-w-md w-full">
            <CardHeader className="text-center">
              <Trophy className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
              <CardTitle className="text-3xl bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
                Game Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-6xl font-bold text-cinema-gold">{score}</div>
              <p className="text-muted-foreground">
                You guessed {score} out of {movies.length} movies correctly!
              </p>
              <div className="space-y-2">
                <Button onClick={resetGame} className="w-full gradient-gold text-cinema-dark font-semibold">
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background p-4 pt-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                <Star className="w-4 h-4 mr-1" />
                Score: {score}
              </Badge>
              <Badge variant="outline">
                Attempts: {attempts}
              </Badge>
            </div>
          </div>

          {currentMovie && (
            <Card className="gradient-card shadow-elevated">
              <CardHeader>
                <CardTitle className="text-2xl text-center bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
                  🎭 Guess the Movie by Cast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Cast Members:</h3>
                  <div className="grid gap-3 max-w-md mx-auto">
                    {currentMovie.cast.map((actor, index) => (
                      <div
                        key={index}
                        className="gradient-card p-3 rounded-lg border border-border/50 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <span className="text-foreground font-medium">{actor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter movie title..."
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleGuess}
                      disabled={!guess.trim()}
                      className="gradient-gold text-cinema-dark font-semibold"
                    >
                      Guess
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSkip}
                    variant="outline" 
                    className="w-full"
                  >
                    Skip This Movie
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <Badge variant="secondary" className="mr-2">
                    Genre: {currentMovie.genre}
                  </Badge>
                  <Badge variant="secondary">
                    Year: {currentMovie.year}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default CastGamePage;