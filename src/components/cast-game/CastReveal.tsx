import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameCastMember } from "@/types/tmdb";
import { getImageUrl } from "@/services/tmdb";
import { cn } from "@/lib/utils";

interface CastRevealProps {
  cast: GameCastMember[];
  revealedCount: number;
  className?: string;
}

export const CastReveal = ({ cast, revealedCount, className }: CastRevealProps) => {
  const [currentlyRevealed, setCurrentlyRevealed] = useState(0);

  // Sort cast by order (lowest order numbers first - lead actors first)
  const sortedCast = [...cast].sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (revealedCount > currentlyRevealed) {
      const timer = setTimeout(() => {
        setCurrentlyRevealed(prev => Math.min(prev + 1, revealedCount));
      }, 500); // Stagger the reveals by 500ms
      
      return () => clearTimeout(timer);
    } else {
      setCurrentlyRevealed(revealedCount);
    }
  }, [revealedCount, currentlyRevealed]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
          Cast Members ({currentlyRevealed}/{cast.length})
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
        {sortedCast.map((actor, index) => (
          <CastMemberCard
            key={actor.id}
            actor={actor}
            isRevealed={index < currentlyRevealed}
            revealDelay={index * 100}
          />
        ))}
      </div>
    </div>
  );
};

interface CastMemberCardProps {
  actor: GameCastMember;
  isRevealed: boolean;
  revealDelay: number;
}

const CastMemberCard = ({ actor, isRevealed, revealDelay }: CastMemberCardProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isRevealed) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, revealDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isRevealed, revealDelay]);

  if (!isRevealed) {
    return (
      <Card className="opacity-30">
        <CardContent className="p-2">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-3xl">❓</span>
            </div>
            <div className="h-4 bg-muted rounded w-full mx-2 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-500 border-border/50",
        shouldAnimate && "animate-fade-in shadow-elevated"
      )}
    >
      <CardContent className="p-2">
        <div className="flex flex-col items-center space-y-2">
          {actor.profilePath ? (
            <img
              src={getImageUrl(actor.profilePath, 'w185') || ''}
              alt={actor.name}
              className={cn(
                "w-fit h-32 object-cover rounded-lg transition-all duration-300",
                shouldAnimate ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-24 bg-gradient-to-br from-cinema-gold/20 to-cinema-purple/20 rounded-lg flex items-center justify-center">
              <span className="text-3xl">🎭</span>
            </div>
          )}
          <div className={cn(
            "text-xs font-medium text-center text-foreground transition-all duration-300",
            shouldAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          )}>
            {actor.name}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};