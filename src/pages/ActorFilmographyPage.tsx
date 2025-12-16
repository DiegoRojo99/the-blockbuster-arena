import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ActorSearch } from '@/components/actor-filmography/ActorSearch';
import { FilmographyGrid } from '@/components/actor-filmography/FilmographyGrid';
import { MovieSearch } from '@/components/cast-game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useActorFilmographyGame } from '@/hooks/useActorFilmographyGame';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { TMDBMovie } from '@/types/tmdb';
import { Clock, ArrowLeft, Sparkles } from 'lucide-react';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const ActorFilmographyPage = () => {
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const game = useActorFilmographyGame(currentLanguage);
  const [clearSelection, setClearSelection] = useState(false);

  const handleGuess = (movie: TMDBMovie) => {
    const result = game.actions.guessMovie(movie);
    setClearSelection(true);
    setTimeout(() => setClearSelection(false), 150);

    if (result.status === 'correct' && result.entry) {
      toast({
        title: 'Correct!',
        description: `${result.entry.title} (${result.entry.year}) added to your list.`,
      });
      return;
    }

    if (result.status === 'already-guessed') {
      toast({
        title: 'Already guessed',
        description: 'You already have that movie.',
      });
      return;
    }

    if (result.status === 'out-of-time') {
      toast({ title: 'Time is up', description: 'Round finished. Start a new actor to play again.' });
      return;
    }

    if (result.status === 'wrong') {
      toast({ title: 'Nope', description: 'That movie is not in this actor’s filtered filmography.' });
    }
  };

  const timerBadge = useMemo(
    () => (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        <span className="font-mono">{formatTime(game.remainingSeconds)}</span>
        {game.isTimeUp && <Badge variant="destructive">Time</Badge>}
      </div>
    ),
    [game.remainingSeconds, game.isTimeUp]
  );

  const progressBadge = useMemo(
    () => (
      <Badge variant="secondary" className="text-sm">
        {game.progress.correct}/{game.progress.total || '??'} guessed
      </Badge>
    ),
    [game.progress.correct, game.progress.total]
  );

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                New Mode
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Actor Filmography Challenge</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {timerBadge}
            {progressBadge}
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Pick an actor to begin (10:00 timer)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActorSearch onSelect={game.actions.selectActor} disabled={game.isLoading} />

            {game.actor && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="outline">{game.actor.name}</Badge>
                <Badge variant="outline">{game.filmography.length} feature films</Badge>
                <Badge variant="outline">Language: {currentLanguage.toUpperCase()}</Badge>
              </div>
            )}

            {game.error && (
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{game.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Search movies to guess</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">Scope: theatrical/features only</Badge>
              <Badge variant="secondary">Duplicates removed by title + year</Badge>
              <Badge variant="secondary">Wrong guesses allowed</Badge>
            </div>

            <MovieSearch
              onMovieSelect={handleGuess}
              disabled={!game.actor || game.isTimeUp || game.isLoading}
              shouldClearSelection={clearSelection}
              recentGuesses={game.wrongGuesses.slice(-3)}
              placeholder={game.actor ? 'Search a movie for this actor...' : 'Pick an actor first'}
            />

            {game.isTimeUp && (
              <Alert>
                <AlertTitle>Time is up</AlertTitle>
                <AlertDescription>Select another actor to start a new round.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Filmography silhouettes (click for hints)</CardTitle>
          </CardHeader>
          <CardContent>
            <FilmographyGrid
              entries={game.filmography}
              guessedIds={game.guessedIds}
              hintSteps={game.hintSteps}
              isTimeUp={game.isTimeUp}
              onRevealHint={(id) => game.actions.revealHint(id)}
            />
          </CardContent>
        </Card>

        {game.wrongGuesses.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Wrong guesses</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {game.wrongGuesses.map((movie) => (
                <Badge key={`${movie.id}-${movie.title}`} variant="destructive" className="text-xs">
                  {movie.title}
                  {movie.release_date ? ` (${movie.release_date.split('-')[0]})` : ''}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ActorFilmographyPage;
