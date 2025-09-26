import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, SkipForward, RefreshCw } from "lucide-react";
import { GameState } from "@/lib/CastGame";

interface GameControlsProps {
  gameState: GameState;
  maxReveals: number;
  onRevealNextCast: () => void;
  onSkipMovie: () => void;
  onResetGame: () => void;
  disabled?: boolean;
}

export const GameControls = ({
  gameState,
  maxReveals,
  onRevealNextCast,
  onSkipMovie,
  onResetGame,
  disabled = false
}: GameControlsProps) => {
  const { currentMovie, revealedCast, guessedMovie } = gameState;
  
  // Disable reveal button if max reveals reached or movie is guessed
  const canReveal = currentMovie && revealedCast < maxReveals && !guessedMovie && !disabled;
  
  // Show how many reveals are left
  const revealsLeft = maxReveals - revealedCast;

  return (
    <Card className="gradient-card shadow-elevated w-full">
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Reveal Next Cast Button */}
          <Button
            onClick={onRevealNextCast}
            disabled={!canReveal}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <Eye className="w-4 h-4" />
            Reveal Cast
            {canReveal && (
              <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded">
                {revealsLeft} left
              </span>
            )}
          </Button>

          {/* Skip Movie Button */}
          <Button
            onClick={onSkipMovie}
            disabled={!currentMovie || disabled}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <SkipForward className="w-4 h-4" />
            Skip Movie
          </Button>

          {/* Reset Game Button */}
          <Button
            onClick={onResetGame}
            disabled={disabled}
            variant="outline"
            className="flex items-center gap-2 sm:col-span-2 lg:col-span-1"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Game
          </Button>
        </div>

        {/* Game Status Info */}
        {currentMovie && (
          <div className="text-center text-sm text-muted-foreground border-t pt-3">
            <div className="flex justify-center items-center gap-4">
              <span>
                Cast: {revealedCast}/{maxReveals}
              </span>
              <span>•</span>
              <span>
                Guesses: {gameState.currentGameGuessCount}
              </span>
              {gameState.wrongGuesses.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-destructive">
                    Wrong: {gameState.wrongGuesses.length}
                  </span>
                </>
              )}
            </div>
            
            {!canReveal && revealedCast >= maxReveals && (
              <div className="mt-2 text-xs text-destructive">
                All cast members revealed!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};