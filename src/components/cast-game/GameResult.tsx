import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calendar, Star, Eye, Target } from "lucide-react";
import { GameResult } from "@/types/tmdb";
import { getImageUrl } from "@/services/tmdb";

interface GameResultDisplayProps {
  result: GameResult;
  showPoster?: boolean;
}

export const GameResultDisplay = ({ result, showPoster = true }: GameResultDisplayProps) => {
  return (
    <Card className={`transition-all duration-200 ${
      result.isCorrect 
        ? 'border-green-500/50 bg-green-50/50' 
        : 'border-red-500/50 bg-red-50/50'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {result.isCorrect ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
            {result.isCorrect ? 'Correct!' : 'Incorrect'}
          </span>
          <Badge variant={result.isCorrect ? 'default' : 'destructive'} className="ml-auto">
            {result.isCorrect ? 'Won' : 'Lost'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          {/* Movie Poster */}
          {showPoster && result.moviePosterPath && (
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(result.moviePosterPath, 'w92')}
                alt={result.movieTitle}
                className="w-16 h-24 object-cover rounded-md border"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {/* Movie Info */}
            <div className="mb-2">
              <h3 className="font-semibold text-sm truncate">
                {result.movieTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {result.movieYear}
              </p>
            </div>
            
            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span>{result.guessCount} guesses</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-muted-foreground" />
                <span>{result.revealedCastCount}/6 cast</span>
              </div>
            </div>
            
            {/* Wrong Guesses */}
            {result.wrongGuesses.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Wrong guesses: {result.wrongGuesses.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.wrongGuesses.slice(0, 3).map((guess, index) => (
                    <Badge 
                      key={guess.id} 
                      variant="outline" 
                      className="text-xs px-1.5 py-0.5"
                    >
                      {guess.title}
                    </Badge>
                  ))}
                  {result.wrongGuesses.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      +{result.wrongGuesses.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Game Mode and Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span className="capitalize">{result.mode.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{result.completedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface GameHistoryProps {
  gameHistory: GameResult[];
  maxItems?: number;
}

export const GameHistory = ({ gameHistory, maxItems = 5 }: GameHistoryProps) => {
  const displayedHistory = maxItems ? gameHistory.slice(0, maxItems) : gameHistory;
  
  if (displayedHistory.length === 0) {
    return (
      <Card className="gradient-card shadow-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No games completed yet. Start guessing to see your history!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card shadow-elevated">
      <CardHeader>
        <CardTitle className="text-lg">
          Recent Games
          {gameHistory.length > maxItems && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (showing {maxItems} of {gameHistory.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedHistory.map((result) => (
          <GameResultDisplay 
            key={result.id} 
            result={result} 
            showPoster={false} 
          />
        ))}
      </CardContent>
    </Card>
  );
};