import { ActorFilmographyEntry } from '@/types/tmdb';
import { getImageUrl } from '@/services/tmdb';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilmographyGridProps {
  entries: ActorFilmographyEntry[];
  guessedIds: Set<number>;
  hintSteps: Record<number, number>;
  isTimeUp: boolean;
  onRevealHint: (movieId: number) => void;
}

const hintLevels = [
  { level: 0, label: 'Locked', icon: '🔒' },
  { level: 1, label: 'Year', icon: '📅' },
  { level: 2, label: 'Genre', icon: '🎞️' },
  { level: 3, label: 'Character', icon: '🎭' },
  { level: 4, label: 'Poster', icon: '🖼️' },
];

export const FilmographyGrid = ({ entries, guessedIds, hintSteps, isTimeUp, onRevealHint }: FilmographyGridProps) => {
  if (!entries.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          Load an actor to see their filmography silhouettes.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {entries.map((entry) => {
        const hintLevel = hintSteps[entry.id] ?? 0;
        const guessed = guessedIds.has(entry.id);
        const posterUrl = entry.posterPath ? getImageUrl(entry.posterPath, 'w342') : null;
        const canReveal = !guessed && !isTimeUp;

        return (
          <Card
            key={entry.id}
            className={cn(
              'overflow-hidden shadow-card border-2 transition-all',
              guessed ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border/60'
            )}
          >
            <CardContent className="p-3 space-y-3 h-full flex flex-col">
              {/* Silhouette Rectangle */}
              <div className="relative flex-1 min-h-32 rounded-lg overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900">
                {hintLevel >= 4 && posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
                {guessed && (
                  <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                    <div className="text-3xl">✓</div>
                  </div>
                )}
              </div>

              {/* Hint Buttons */}
              <div className="flex gap-1 flex-wrap">
                {hintLevels.map(({ level, label }) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={hintLevel >= level ? 'default' : 'ghost'}
                    onClick={() => canReveal && level > hintLevel && onRevealHint(entry.id)}
                    disabled={!canReveal || guessed || level === 0}
                    className={cn(
                      'text-xs h-8 px-2',
                      hintLevel >= level && 'bg-cinema-gold text-cinema-dark',
                      guessed && 'opacity-50'
                    )}
                    title={label}
                  >
                    {level === 0 ? '🔒' : hintLevels[level]?.icon || '?'}
                  </Button>
                ))}
              </div>

              {/* Info Display */}
              <div className="space-y-1 text-xs">
                {guessed ? (
                  <div>
                    <div className="font-semibold text-green-700 dark:text-green-300">{entry.title}</div>
                    <div className="text-green-600 dark:text-green-400">{entry.year}</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {hintLevel >= 1 && <div><strong>Year:</strong> {entry.year}</div>}
                    {hintLevel >= 2 && entry.genre && <div><strong>Genre:</strong> {entry.genre}</div>}
                    {hintLevel >= 3 && entry.character && <div><strong>As:</strong> {entry.character}</div>}
                    {hintLevel === 0 && <div className="text-muted-foreground italic">Locked - click hints to reveal</div>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
