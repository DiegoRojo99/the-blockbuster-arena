import { ActorFilmographyEntry } from '@/types/tmdb';
import { getImageUrl } from '@/services/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FilmographyGridProps {
  entries: ActorFilmographyEntry[];
  guessedIds: Set<number>;
  hintSteps: Record<number, number>;
  isTimeUp: boolean;
  onRevealHint: (movieId: number) => void;
}

const hintLabels = ['Locked', 'Year', 'Genre', 'Character', 'Poster'];

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
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {entries.map((entry) => {
        const hintLevel = hintSteps[entry.id] ?? 0;
        const guessed = guessedIds.has(entry.id);
        const posterUrl = entry.posterPath ? getImageUrl(entry.posterPath, 'w342') : null;
        const canReveal = !guessed && !isTimeUp && hintLevel < 4;

        return (
          <Card
            key={entry.id}
            className={cn(
              'overflow-hidden shadow-card border-2 transition-all',
              guessed ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border/60'
            )}
          >
            <CardContent className="p-3 space-y-3 h-full flex flex-col">
              {/* Silhouette Rectangle - Clickable */}
              <button
                type="button"
                onClick={() => canReveal && onRevealHint(entry.id)}
                disabled={guessed || isTimeUp || hintLevel >= 4}
                className={cn(
                  'relative flex-1 min-h-32 rounded-lg overflow-hidden transition-all',
                  guessed || isTimeUp || hintLevel >= 4 ? 'cursor-default' : 'cursor-pointer hover:opacity-80',
                  !guessed && !isTimeUp && hintLevel < 4 ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-slate-600 to-slate-800'
                )}
              >
                {(guessed || hintLevel >= 4) && posterUrl ? (
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
                    <div className="text-3xl font-bold">✓</div>
                  </div>
                )}
                {!guessed && hintLevel < 4 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-medium">
                    {hintLabels[hintLevel]}
                  </div>
                )}
              </button>

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
                    {hintLevel === 0 && <div className="text-muted-foreground italic text-center">Click to reveal</div>}
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
