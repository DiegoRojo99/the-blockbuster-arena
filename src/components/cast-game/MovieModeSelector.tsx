import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Clock, Calendar, ChevronDown } from "lucide-react";
import { MovieMode, MovieModeOption } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface MovieModeSelectorProps {
  selectedMode: MovieMode;
  onModeChange: (mode: MovieMode) => void;
  className?: string;
  disabled?: boolean;
}

const movieModeOptions: MovieModeOption[] = [
  {
    id: 'popular',
    name: 'Popular Movies',
    description: 'Currently trending and popular films',
    icon: '🔥'
  },
  {
    id: 'top_rated',
    name: 'Top Rated',
    description: 'Highest rated films of all time',
    icon: '⭐'
  },
  {
    id: 'now_playing',
    name: 'Now Playing',
    description: 'Recent releases from the last 2 years',
    icon: '🎬'
  },
  {
    id: 'upcoming',
    name: 'Upcoming',
    description: 'New and soon-to-be-released films',
    icon: '🗓️'
  },
  {
    id: 'custom',
    name: 'Custom Movie',
    description: 'Choose a specific movie to challenge friends',
    icon: '🎯'
  }
];

export const MovieModeSelector = ({ 
  selectedMode, 
  onModeChange, 
  className,
  disabled = false 
}: MovieModeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = movieModeOptions.find(option => option.id === selectedMode);

  const handleModeSelect = (mode: MovieMode) => {
    onModeChange(mode);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedOption?.icon}</span>
          <span>{selectedOption?.name}</span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute top-full left-0 right-0 mt-1 z-20 shadow-lg">
            <CardContent className="p-0">
              {movieModeOptions.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleModeSelect(option.id)}
                  className={cn(
                    "w-full p-3 text-left hover:bg-accent transition-colors",
                    index > 0 && "border-t border-border",
                    selectedMode === option.id && "bg-accent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{option.icon}</span>
                    <div className="flex-1">
                      {/* Name */}
                      <div className="font-medium text-foreground">
                        {option.name}                        
                      </div>
                      {/* Description */}
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                      {/* Selected Badge */}
                      {selectedMode === option.id && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};