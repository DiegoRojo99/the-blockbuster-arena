import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Check, X } from "lucide-react";
import { TMDBMovie } from "@/types/tmdb";
import { searchMovies, getImageUrl } from "@/services/tmdb";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface MovieSearchProps {
  onMovieSelect: (movie: TMDBMovie) => void;
  onEmptyGuess?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  recentGuesses?: TMDBMovie[];
  shouldClearSelection?: boolean;
}

export const MovieSearch = ({ 
  onMovieSelect, 
  onEmptyGuess,
  placeholder = "Search for a movie...", 
  disabled = false,
  className,
  recentGuesses = [],
  shouldClearSelection = false
}: MovieSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { currentLanguage } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await searchMovies(query, currentLanguage);
        setResults(response.results.slice(0, 8)); // Limit to 8 results
        setShowResults(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        setShowResults(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, currentLanguage]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear selection when shouldClearSelection prop changes to true
  useEffect(() => {
    if (shouldClearSelection && selectedMovie) {
      setSelectedMovie(null);
      setQuery("");
    }
  }, [shouldClearSelection, selectedMovie]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleMovieSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleMovieSelect = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setQuery("");  // Clear the input after selection
    setShowResults(false);
    onMovieSelect(movie);
  };

  const handleSubmit = () => {
    if (selectedMovie) {
      onMovieSelect(selectedMovie);
    } else if (results.length > 0) {
      handleMovieSelect(results[0]);
    }
  };

  const clearSelection = () => {
    setSelectedMovie(null);
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedMovie) setSelectedMovie(null);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
            disabled={disabled}
            className={cn(
              "pr-10",
              selectedMovie && "border-green-500 bg-green-50 dark:bg-green-950"
            )}
          />
          
          {selectedMovie && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
          )}
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cinema-gold"></div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={disabled || (!selectedMovie && results.length === 0)}
            className="flex-1 gradient-gold text-cinema-dark font-semibold"
          >
            Submit
          </Button>
          
          {onEmptyGuess && (
            <Button 
              onClick={() => {
                onEmptyGuess();
                clearSelection();
              }}
              disabled={disabled}
              variant="destructive"
              className="flex-1 sm:flex-initial flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Empty Guess
            </Button>
          )}
        </div>
      </div>

      {/* Recent Guesses */}
      {recentGuesses.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-medium text-muted-foreground mb-2">Recent Guesses:</div>
          <div className="space-y-1">
            {recentGuesses.map((movie, index) => (
              <Card key={`${movie.id}-${index}`} className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    {movie.poster_path && (
                      <img
                        src={getImageUrl(movie.poster_path, 'w92') || ''}
                        alt={movie.title}
                        className="w-8 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200 truncate">
                        ❌ {movie.title}
                      </div>
                      {movie.release_date && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {movie.release_date.split('-')[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="mt-2">
          <Card className="bg-green-50 dark:bg-green-950 border-green-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {selectedMovie.poster_path && (
                  <img
                    src={getImageUrl(selectedMovie.poster_path, 'w92') || ''}
                    alt={selectedMovie.title}
                    className="w-12 h-18 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-green-800 dark:text-green-200">
                    {selectedMovie.title}
                  </div>
                  {selectedMovie.release_date && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {selectedMovie.release_date.split('-')[0]}
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearSelection}
                  className="text-green-600 hover:text-green-800"
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showResults && results.length > 0 && !selectedMovie && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {results.map((movie, index) => (
              <div
                key={movie.id}
                onClick={() => handleMovieSelect(movie)}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors",
                  index === selectedIndex && "bg-accent",
                  index > 0 && "border-t border-border"
                )}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {movie.poster_path ? (
                  <img
                    src={getImageUrl(movie.poster_path, 'w92') || ''}
                    alt={movie.title}
                    className="w-10 h-15 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-15 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No Image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{movie.title}</div>
                  {movie.original_title !== movie.title && (
                    <div className="text-sm text-muted-foreground truncate">
                      {movie.original_title}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {movie.release_date && (
                      <Badge variant="secondary" className="text-xs">
                        {movie.release_date.split('-')[0]}
                      </Badge>
                    )}
                    {movie.vote_average > 0 && (
                      <Badge variant="outline" className="text-xs">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};