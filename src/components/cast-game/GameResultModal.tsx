import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, XCircle, RotateCcw, ArrowLeft, Trophy, Target, Eye } from "lucide-react";
import { GameMovie } from "@/types/tmdb";
import { getImageUrl } from "@/services/tmdb";
import { Link } from "react-router-dom";

interface GameResultModalProps {
  isOpen: boolean;
  movie: GameMovie | null;
  isCorrect: boolean;
  guessCount: number;
  revealedCastCount: number;
  maxReveals: number;
  onPlayAgain: () => void;
  onChangeMode: () => void;
  onOpenChange?: (open: boolean) => void;
}

export const GameResultModal = ({
  isOpen,
  movie,
  isCorrect,
  guessCount,
  revealedCastCount,
  maxReveals,
  onPlayAgain,
  onChangeMode,
  onOpenChange
}: GameResultModalProps) => {
  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className="max-w-[90vw] sm:max-w-2xl w-full mx-auto sm:mx-4 p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {isCorrect ? 'Correct Guess!' : 'Game Over'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isCorrect 
            ? `You successfully guessed the movie ${movie.title} in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}.`
            : `You were unable to guess the movie ${movie.title}. The game is over.`
          }
        </DialogDescription>
        <div className="gradient-card">
          {/* Header with Result */}
          <CardHeader className={`text-center pb-4 ${
            isCorrect 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <div className="text-white">
              {isCorrect ? (
                <CheckCircle className="w-12 h-12 mx-auto mb-3" />
              ) : (
                <XCircle className="w-12 h-12 mx-auto mb-3" />
              )}
              <CardTitle className="text-2xl font-bold">
                {isCorrect ? '🎉 Correct!' : '😔 Game Over'}
              </CardTitle>
              <p className="text-white/90 mt-2">
                {isCorrect 
                  ? `You guessed it in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`
                  : `You used all ${maxReveals} reveals without guessing correctly`
                }
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Movie Information */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
              <div className="flex-shrink-0">
                <img
                  src={getImageUrl(movie.posterPath, 'w342')}
                  alt={movie.title}
                  className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded-lg shadow-lg border-2 border-border"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg?height=192&width=128';
                  }}
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{movie.title}</h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">({movie.year})</p>
                
                {/* Game Statistics */}
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Target className={`w-5 h-5 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <div className="font-bold">{guessCount}</div>
                      <div className="text-xs text-muted-foreground">
                        {guessCount === 1 ? 'Guess' : 'Guesses'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-bold">{revealedCastCount}/{maxReveals}</div>
                      <div className="text-xs text-muted-foreground">Cast Shown</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Trophy className={`w-5 h-5 ${isCorrect ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <div>
                      <Badge variant={isCorrect ? "default" : "secondary"}>
                        {isCorrect ? 'Won' : 'Lost'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center px-2 sm:p-4 rounded-lg bg-muted/50">
              {isCorrect ? (
                <div className="text-green-700">
                  {guessCount === 1 && revealedCastCount === 1 && (
                    <p className="font-medium">🏆 Perfect! You got it on the first try!</p>
                  )}
                  {guessCount === 1 && revealedCastCount > 1 && (
                    <p className="font-medium">🎯 Great job! Nailed it in one guess!</p>
                  )}
                  {guessCount <= 3 && guessCount > 1 && (
                    <p className="font-medium">🎉 Excellent! Quick recognition!</p>
                  )}
                  {guessCount > 3 && guessCount <= 5 && (
                    <p className="font-medium">👏 Good work! You figured it out!</p>
                  )}
                  {guessCount > 5 && (
                    <p className="font-medium">✨ Nice persistence! You got there!</p>
                  )}
                </div>
              ) : (
                <div className="text-red-700">
                  <p className="font-medium">Don't worry! This was a tough one.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try another movie and keep improving your skills!
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/cast-game-modes" className="flex-1">
                <Button 
                  onClick={onChangeMode}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Mode
                </Button>
              </Link>
              <Button 
                onClick={onPlayAgain}
                className="w-full flex md:flex-1 items-center gap-2"
                size="lg"
              >
                <RotateCcw className="w-4 h-4" />
                Play Another Round
              </Button>
            </div>

            {/* Future Stats Placeholder */}
            {/* TODO: Add stats component here when implemented */}
          </CardContent>
        </div>
      </DialogContent>
    </Dialog>
  );
};