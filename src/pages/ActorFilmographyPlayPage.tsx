import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
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
import { Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { getActorMovieCredits, buildActorFilmography } from '@/services/tmdb';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const ActorFilmographyPlayPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();

  const actorId = parseInt(searchParams.get('actorId') || '', 10);
  const timeLimit = parseInt(searchParams.get('timeLimit') || '', 10) || undefined;

  const game = useActorFilmographyGame({ language: currentLanguage, timeLimit });
  const [clearSelection, setClearSelection] = useState(false);
  const [isLoadingActor, setIsLoadingActor] = useState(true);

  // Load actor on mount from URL param
  useEffect(() => {
    if (!actorId || game.filmography.length > 0) {
      return;
    }

    const loadActor = async () => {
      try {
        setIsLoadingActor(true);
        const credits = await getActorMovieCredits(actorId, currentLanguage);
        const entries = buildActorFilmography(credits);

        if (entries.length === 0) {
          toast({ title: 'No films found', description: 'This actor has no eligible filmography.' });
          navigate('/actor-filmography');
          return;
        }

        // Load filmography
        game.actions.selectActor({
          id: actorId,
          name: `Actor #${actorId}`,
          known_for_department: 'Acting',
          profile_path: null,
          popularity: 0,
          gender: null,
        });
      } catch (err) {
        console.error('Failed to load actor', err);
        toast({ title: 'Error', description: 'Could not load actor filmography.' });
        navigate('/actor-filmography');
      } finally {
        setIsLoadingActor(false);
      }
    };

    loadActor();
  }, [actorId]);

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
      toast({ title: 'Time is up', description: 'Round finished. Go back to choose another actor.' });
      return;
    }

    if (result.status === 'wrong') {
      toast({ title: 'Nope', description: "That movie is not in this actor's filtered filmography." });
    }
  };

  const timerBadge = useMemo(
    () => (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        {game.hasTimeLimit ? (
          <>
            <span className="font-mono">{formatTime(game.remainingSeconds)}</span>
            {game.isTimeUp && <Badge variant="destructive">Time Up</Badge>}
          </>
        ) : (
          <span className="text-muted-foreground">No time limit</span>
        )}
      </div>
    ),
    [game.remainingSeconds, game.isTimeUp, game.hasTimeLimit]
  );

  const progressBadge = useMemo(
    () => (
      <Badge variant="secondary" className="text-sm">
        {game.progress.correct}/{game.progress.total || '??'} guessed
      </Badge>
    ),
    [game.progress.correct, game.progress.total]
  );

  if (isLoadingActor) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cinema-gold" />
            <h3 className="text-lg font-semibold mb-2">Loading Filmography</h3>
            <p className="text-muted-foreground">Preparing the actor's films...</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/actor-filmography">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{game.actor?.name || 'Filmography Challenge'}</h1>
              <div className="text-sm text-muted-foreground">{game.filmography.length} feature films to discover</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {timerBadge}
            {progressBadge}
          </div>
        </div>

        {game.error && (
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{game.error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Search movies to guess</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">Theatrical/features only</Badge>
              <Badge variant="secondary">No duplicates</Badge>
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
                <AlertDescription>You got {game.progress.correct} out of {game.progress.total}. Go back to try another actor!</AlertDescription>
              </Alert>
            )}

            {game.progress.total > 0 && game.progress.correct === game.progress.total && (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <AlertTitle className="text-green-800 dark:text-green-200">🎉 Perfect! You found them all!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {game.hasTimeLimit && `In ${formatTime(game.remainingSeconds)} remaining!`}
                </AlertDescription>
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
              <CardTitle>Wrong guesses ({game.wrongGuesses.length})</CardTitle>
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

export default ActorFilmographyPlayPage;
