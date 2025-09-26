import { GameMovie, TMDBMovie, MovieMode, GameResult, SupportedLanguage } from "@/types/tmdb";
import { getGameMovies, getGameMovieWithCast } from "@/services/tmdb";
import { toast } from "@/hooks/use-toast";

export interface GameState {
  currentMovie: GameMovie | null;
  score: number;
  attempts: number;
  revealedCast: number;
  guessedMovie: TMDBMovie | null;
  wrongGuesses: TMDBMovie[];
  gameHistory: GameResult[];
  currentGameGuessCount: number;
  isLoading: boolean;
  gameOver: boolean;
}

export interface GameCallbacks {
  onStateChange?: (state: GameState) => void;
  onMovieChange?: (movie: GameMovie | null) => void;
  onGameComplete?: (result: GameResult) => void;
}

export class CastGame {
  private state: GameState;
  private callbacks: GameCallbacks;
  private availableMovies: TMDBMovie[] = [];
  private usedMovies: number[] = [];
  private mode: MovieMode;
  private language: SupportedLanguage;
  private maxReveals = 6;

  constructor(mode: MovieMode, language: SupportedLanguage, callbacks: GameCallbacks = {}) {
    this.mode = mode;
    this.language = language;
    this.callbacks = callbacks;
    
    this.state = {
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
    };
  }

  // Public getter for current state
  public getState(): GameState {
    return { ...this.state };
  }

  // Initialize the game by loading movies
  public async initialize(): Promise<void> {
    this.updateState({ isLoading: true });
    
    try {
      const movies = await getGameMovies(this.language, 500, this.mode);
      
      if (movies.length === 0) {
        toast({
          title: "Error loading movies",
          description: "Could not load movies for the game. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      this.availableMovies = movies;
      await this.selectRandomMovie();
    } catch (error) {
      console.error("Failed to load movies:", error);
      toast({
        title: "Error",
        description: "Failed to load movies. Please check your connection and try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // Take a guess at the movie
  public async takeGuess(movie: TMDBMovie): Promise<boolean> {
    if (!this.state.currentMovie) return false;
    
    const isCorrect = movie.id === this.state.currentMovie.id;
    const newGuessCount = this.state.currentGameGuessCount + 1;
    
    this.updateState({ 
      guessedMovie: movie,
      currentGameGuessCount: newGuessCount
    });

    if (isCorrect) {
      await this.handleCorrectGuess();
      return true;
    } else {
      await this.handleIncorrectGuess(movie);
      return false;
    }
  }

  // Reveal the next cast member
  public async revealNextCast(): Promise<void> {
    if (this.state.revealedCast >= this.maxReveals) return;

    const newRevealCount = this.state.revealedCast + 1;
    const newGuessCount = this.state.currentGameGuessCount + 1;
    
    this.updateState({ 
      revealedCast: newRevealCount,
      currentGameGuessCount: newGuessCount
    });

    if (newRevealCount >= this.maxReveals) {
      await this.handleGameOver();
    } else {
      toast({
        title: "Cast member revealed",
        description: `Revealing cast member ${newRevealCount}/${this.maxReveals}`,
        duration: 1000,
      });
    }
  }

  // Skip the current movie
  public async skipMovie(): Promise<void> {
    if (!this.state.currentMovie) return;

    const gameResult = this.createGameResult(false, 0);
    this.addToHistory(gameResult);
    
    toast({
      title: "Skipped",
      description: `It was "${this.state.currentMovie.title}" (${this.state.currentMovie.year})`,
      duration: 1500,
    });

    this.updateState({ attempts: this.state.attempts + 1 });
    this.usedMovies.push(this.state.currentMovie.id);
    
    await this.selectRandomMovie();
  }

  // Reset the entire game
  public async resetGame(): Promise<void> {
    this.state = {
      currentMovie: null,
      score: 0,
      attempts: 0,
      revealedCast: 0,
      guessedMovie: null,
      wrongGuesses: [],
      gameHistory: [],
      currentGameGuessCount: 0,
      isLoading: false,
      gameOver: false,
    };
    
    this.usedMovies = [];
    this.callbacks.onStateChange?.(this.state);
    
    if (this.availableMovies.length > 0) {
      await this.selectRandomMovie();
    } else {
      await this.initialize();
    }
  }

  // Private methods
  private updateState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates };
    this.callbacks.onStateChange?.(this.state);
  }

  private async handleCorrectGuess(): Promise<void> {
    if (!this.state.currentMovie) return;

    const gameResult = this.createGameResult(true, this.state.currentGameGuessCount);
    this.addToHistory(gameResult);
    
    this.updateState({ score: this.state.score + 1 });
    this.usedMovies.push(this.state.currentMovie.id);
    
    toast({
      title: "Correct! 🎉",
      description: `It was "${this.state.currentMovie.title}" (${this.state.currentMovie.year})! You got it with ${this.state.revealedCast}/${this.maxReveals} cast members revealed.`,
      duration: 1500,
    });

    this.callbacks.onGameComplete?.(gameResult);
    
    // Move to next movie after a brief delay
    setTimeout(async () => {
      await this.selectRandomMovie();
    }, 2000);
  }

  private async handleIncorrectGuess(movie: TMDBMovie): Promise<void> {
    const newWrongGuesses = [...this.state.wrongGuesses, movie];
    this.updateState({ wrongGuesses: newWrongGuesses });

    // Wrong guess - reveal next cast member if available
    if (this.state.revealedCast < this.maxReveals) {
      this.updateState({ revealedCast: this.state.revealedCast + 1 });
      
      toast({
        title: "Incorrect! ❌",
        description: `That's not right. Revealing another cast member...`,
        variant: "destructive",
        duration: 1500,
      });
      
      // Clear the guessed movie so they can try again
      setTimeout(() => {
        if (this.state.revealedCast < this.maxReveals) {
          this.updateState({ guessedMovie: null });
        }
      }, 1500);
    } else {
      await this.handleGameOver();
    }

    this.updateState({ attempts: this.state.attempts + 1 });
  }

  private async handleGameOver(): Promise<void> {
    if (!this.state.currentMovie) return;

    const gameResult = this.createGameResult(false, this.state.currentGameGuessCount);
    this.addToHistory(gameResult);
    
    toast({
      title: "All cast revealed! ❌",
      description: `It was "${this.state.currentMovie.title}" (${this.state.currentMovie.year}). Moving to next movie...`,
      variant: "destructive",
      duration: 2000,
    });

    this.callbacks.onGameComplete?.(gameResult);
    this.usedMovies.push(this.state.currentMovie.id);
    
    setTimeout(async () => {
      await this.selectRandomMovie();
    }, 2500);
  }

  private createGameResult(isCorrect: boolean, guessCount: number): GameResult {
    if (!this.state.currentMovie) {
      throw new Error("Cannot create game result without current movie");
    }

    return {
      id: `${Date.now()}-${this.state.currentMovie.id}`,
      movieId: this.state.currentMovie.id,
      movieTitle: this.state.currentMovie.title,
      movieYear: this.state.currentMovie.year,
      moviePosterPath: this.state.currentMovie.posterPath,
      isCorrect,
      guessCount,
      revealedCastCount: this.state.revealedCast,
      wrongGuesses: this.state.wrongGuesses,
      completedAt: new Date(),
      mode: this.mode,
      language: this.language
    };
  }

  private addToHistory(result: GameResult): void {
    const newHistory = [result, ...this.state.gameHistory];
    this.updateState({ gameHistory: newHistory });
  }

  private async selectRandomMovie(): Promise<void> {
    // Filter out used movies
    const available = this.availableMovies.filter(m => !this.usedMovies.includes(m.id));

    // If no more movies are available, reload
    if (available.length === 0) {
      await this.initialize();
      return;
    }

    // Try to find a movie with sufficient cast
    const maxAttempts = Math.min(10, available.length);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const randomTMDBMovie = available[Math.floor(Math.random() * available.length)];
      console.log("Trying movie:", randomTMDBMovie.title);
      
      try {
        const gameMovie = await getGameMovieWithCast(randomTMDBMovie, this.language);
        
        if (gameMovie) {
          console.log("Selected movie with cast:", gameMovie);
          
          this.updateState({
            currentMovie: gameMovie,
            revealedCast: 1,
            guessedMovie: null,
            wrongGuesses: [],
            currentGameGuessCount: 0
          });
          
          this.callbacks.onMovieChange?.(gameMovie);
          return;
        } else {
          console.log(`Movie ${randomTMDBMovie.title} doesn't have enough valid cast members, trying another...`);
          const index = available.indexOf(randomTMDBMovie);
          available.splice(index, 1);
        }
      } catch (error) {
        console.warn(`Failed to get cast for movie ${randomTMDBMovie.title}:`, error);
        const index = available.indexOf(randomTMDBMovie);
        available.splice(index, 1);
      }
    }
    
    // If we get here, reload the movie pool
    console.log("Could not find a movie with sufficient cast, reloading...");
    await this.initialize();
  }
}