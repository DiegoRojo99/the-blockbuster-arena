import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Target, Eye } from "lucide-react";
import { GameState } from "@/lib/CastGame";

interface GameStatsProps {
  gameState: GameState;
  maxReveals: number;
  mode: string;
}

export const GameStats = ({ gameState, maxReveals, mode }: GameStatsProps) => {
  const { score, attempts, revealedCast, gameHistory } = gameState;
  
  // Calculate accuracy percentage
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  
  // Get recent performance (last 5 games)
  const recentGames = gameHistory.slice(0, 5);
  const recentCorrect = recentGames.filter(game => game.isCorrect).length;
  const recentAccuracy = recentGames.length > 0 
    ? Math.round((recentCorrect / recentGames.length) * 100) 
    : 0;

  return (
    <Card className="gradient-card shadow-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-cinema-gold" />
          Game Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Game Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Mode:</span>
          <Badge variant="outline" className="capitalize">
            {mode.replace('_', ' ')}
          </Badge>
        </div>

        {/* Score and Attempts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-cinema-gold" />
              <span className="text-sm font-medium">Score</span>
            </div>
            <div className="text-2xl font-bold text-cinema-gold">{score}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Attempts</span>
            </div>
            <div className="text-2xl font-bold">{attempts}</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="text-center">
          <div className="text-sm font-medium mb-1">Overall Accuracy</div>
          <div className="text-xl font-bold text-primary">{accuracy}%</div>
          {attempts > 0 && (
            <div className="text-xs text-muted-foreground">
              {score} correct out of {attempts} attempts
            </div>
          )}
        </div>

        {/* Recent Performance */}
        {recentGames.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Recent Form</div>
            <div className="flex justify-center gap-1 mb-2">
              {recentGames.map((game, index) => (
                <div
                  key={game.id}
                  className={`w-3 h-3 rounded-full ${
                    game.isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  title={`${game.movieTitle} - ${game.isCorrect ? 'Correct' : 'Incorrect'}`}
                />
              ))}
            </div>
            <div className="text-sm text-primary font-medium">{recentAccuracy}%</div>
            <div className="text-xs text-muted-foreground">
              Last {recentGames.length} games
            </div>
          </div>
        )}

        {/* Current Movie Progress */}
        {gameState.currentMovie && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cast Revealed:</span>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold">{revealedCast}/{maxReveals}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(revealedCast / maxReveals) * 100}%` }}
              />
            </div>
            
            <div className="text-xs text-muted-foreground mt-1 text-center">
              {gameState.currentGameGuessCount} guesses made
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};