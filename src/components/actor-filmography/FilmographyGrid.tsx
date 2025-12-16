import { ActorFilmographyEntry } from '@/types/tmdb';
import { getImageUrl } from '@/services/tmdb';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FilmographyGridProps {
  entries: ActorFilmographyEntry[];
  guessedIds: Set<number>;
  hintSteps: Record<number, number>;
  isTimeUp: boolean;
  onRevealHint: (movieId: number) => void;
}

const buildInitials = (title: string) =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');

const hintLabels = ['Tap for hint', 'Year', 'Genre', 'Initials', 'Poster'];

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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => {
        const hintLevel = hintSteps[entry.id] ?? 0;
        const guessed = guessedIds.has(entry.id);
        const posterUrl = entry.posterPath ? getImageUrl(entry.posterPath, 'w342') : null;
        const canReveal = !guessed && !isTimeUp;
        const initials = buildInitials(entry.title);

        return (
          <Card
            key={entry.id}
            className={cn('overflow-hidden shadow-card border-border/60', guessed && 'border-green-500')}
          >
            <CardContent className="p-0">
              <button
                type="button"
                onClick={() => canReveal && onRevealHint(entry.id)}
                className="relative w-full h-56 text-left"
                disabled={!canReveal}
              >
                {posterUrl ? (
                  <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      backgroundImage: `url(${posterUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: hintLevel >= 4 ? 'grayscale(0.1)' : 'grayscale(1) brightness(0.4)',
                      opacity: hintLevel >= 4 ? 0.95 : 0.7,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="relative h-full w-full p-4 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      {guessed ? 'Guessed' : hintLabels[hintLevel]}
                    </span>
                    <Badge variant="secondary" className="text-[10px] uppercase bg-white/20 text-white border-white/40">
                      Hint {hintLevel}/4
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {guessed ? (
                      <div>
                        <div className="text-lg font-semibold leading-tight">{entry.title}</div>
                        <div className="text-sm text-white/80">{entry.year}</div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        {hintLevel >= 1 && <div>📅 {entry.year}</div>}
                        {hintLevel >= 2 && entry.genre && <div>🎞️ {entry.genre}</div>}
                        {hintLevel >= 3 && <div>🔤 Initials: {initials}</div>}
                        {hintLevel === 0 && <div className="text-white/70">Click the silhouette to reveal hints.</div>}
                      </div>
                    )}

                    {entry.character && (
                      <div className="text-xs text-white/70">as {entry.character}</div>
                    )}
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
