import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Share2, Play, Copy, Check } from "lucide-react";
import { TMDBMovie } from "@/types/tmdb";
import { searchMovies } from "@/services/tmdb";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CustomMovieSelectorProps {
  onMovieSelect: (movie: TMDBMovie, playMode: 'local' | 'share') => void;
  className?: string;
}

export const CustomMovieSelector = ({ onMovieSelect, className }: CustomMovieSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a movie name",
        description: "Please type a movie name to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchMovies(searchQuery, 'en', 1);
      setSearchResults(response.results.slice(0, 12));
      
      if (response.results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Could not search for movies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setShareUrl('');
    setCopied(false);
  };

  const handlePlayLocal = () => {
    if (selectedMovie) {
      onMovieSelect(selectedMovie, 'local');
    }
  };

  const handleShare = () => {
    if (selectedMovie) {
      // Generate share URL with movie ID
      const url = `${window.location.origin}/cast-game/custom/${selectedMovie.id}`;
      setShareUrl(url);
      
      toast({
        title: "Share link ready!",
        description: "Copy the link and share it with friends",
      });
    }
  };

  const handleCopyUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with your friends to challenge them",
      });
      
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Section */}
      <Card className="gradient-card shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search for a Movie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter movie title..."
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="gradient-gold text-cinema-dark"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {searchResults.map((movie) => (
                <Card
                  key={movie.id}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    selectedMovie?.id === movie.id && "ring-2 ring-cinema-gold"
                  )}
                  onClick={() => handleMovieClick(movie)}
                >
                  <CardContent className="p-3">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full aspect-[2/3] object-cover rounded-md mb-2"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-muted rounded-md mb-2 flex items-center justify-center">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    <p className="text-sm font-medium line-clamp-2">{movie.title}</p>
                    {movie.release_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    )}
                    {selectedMovie?.id === movie.id && (
                      <Badge className="mt-2 w-full justify-center bg-cinema-gold text-cinema-dark">
                        Selected
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Movie Actions */}
      {selectedMovie && (
        <Card className="gradient-card shadow-elevated border-2 border-cinema-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Selected Movie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              {selectedMovie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="w-24 rounded-md"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{selectedMovie.title}</h3>
                {selectedMovie.release_date && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(selectedMovie.release_date).getFullYear()}
                  </p>
                )}
                {selectedMovie.overview && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {selectedMovie.overview}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Play Locally */}
              <Button
                onClick={handlePlayLocal}
                className="gradient-gold text-cinema-dark font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </Button>

              {/* Generate Share Link */}
              <Button
                onClick={handleShare}
                variant="outline"
                className="font-semibold"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Generate Share Link
              </Button>
            </div>

            {/* Share URL Display */}
            {shareUrl && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Share this link with friends:</p>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-background font-mono text-xs"
                  />
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your friends can use this link to play a cast guessing game with this movie!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
