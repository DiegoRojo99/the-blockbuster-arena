import { useEffect, useRef, useState } from 'react';
import { TMDBPerson } from '@/types/tmdb';
import { searchActors, getImageUrl } from '@/services/tmdb';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface ActorSearchProps {
  onSelect: (actor: TMDBPerson) => void;
  disabled?: boolean;
  className?: string;
}

export const ActorSearch = ({ onSelect, disabled = false, className }: ActorSearchProps) => {
  const { currentLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await searchActors(query, currentLanguage);
        setResults(response.results.slice(0, 8));
        setShowResults(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Actor search failed', err);
        setResults([]);
        setShowResults(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [currentLanguage, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (actor: TMDBPerson) => {
    onSelect(actor);
    setQuery(actor.name);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowResults(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          placeholder="Search for an actor..."
          disabled={disabled}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {isLoading && (
          <div className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {results.map((actor, index) => (
              <div
                key={actor.id}
                onClick={() => handleSelect(actor)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors',
                  index === selectedIndex && 'bg-accent',
                  index > 0 && 'border-t border-border'
                )}
              >
                {actor.profile_path ? (
                  <img
                    src={getImageUrl(actor.profile_path, 'w92') || ''}
                    alt={actor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    🎬
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{actor.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{actor.known_for_department}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">Popularity {actor.popularity.toFixed(0)}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-3 text-sm text-muted-foreground">
        Pick an actor to load their theatrical filmography and start the 10-minute round.
      </div>
      <Button
        className="mt-3 w-full"
        disabled={!results.length || disabled}
        onClick={() => {
          if (results[0]) handleSelect(results[0]);
        }}
      >
        Quick select top result
      </Button>
    </div>
  );
};
