import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActorFilmographyEntry, SupportedLanguage, TMDBMovie, TMDBPerson } from '@/types/tmdb';
import { buildActorFilmography, getActorMovieCredits } from '@/services/tmdb';

const DEFAULT_ROUND_SECONDS = 600; // 10 minutes
const MAX_HINT_STEPS = 4;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const getMovieYear = (movie: TMDBMovie) => {
  if (!movie.release_date) return undefined;
  const parsed = parseInt(movie.release_date.split('-')[0] || '', 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

type GuessStatus = 'correct' | 'wrong' | 'already-guessed' | 'out-of-time' | 'no-filmography';

export interface GuessResult {
  status: GuessStatus;
  entry?: ActorFilmographyEntry;
}

interface UseActorFilmographyGameProps {
  language: SupportedLanguage;
  timeLimit?: number; // in seconds, undefined for no limit
}

export const useActorFilmographyGame = ({ language, timeLimit }: UseActorFilmographyGameProps) => {
  const [actor, setActor] = useState<TMDBPerson | null>(null);
  const [filmography, setFilmography] = useState<ActorFilmographyEntry[]>([]);
  const [guessedIds, setGuessedIds] = useState<Set<number>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState<TMDBMovie[]>([]);
  const [hintSteps, setHintSteps] = useState<Record<number, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(timeLimit ?? DEFAULT_ROUND_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTimeLimit = timeLimit !== undefined && timeLimit > 0;

  // Timer handling
  useEffect(() => {
    if (!isTimerRunning || !hasTimeLimit) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, hasTimeLimit]);

  // Stop timer when all movies are guessed
  useEffect(() => {
    if (filmography.length > 0 && guessedIds.size >= filmography.length) {
      setIsTimerRunning(false);
    }
  }, [filmography.length, guessedIds]);

  const findMatchingEntry = useCallback(
    (movie: TMDBMovie): ActorFilmographyEntry | undefined => {
      const byId = filmography.find((entry) => entry.id === movie.id);
      if (byId) return byId;

      const year = getMovieYear(movie);
      if (!year) return undefined;

      const normalizedGuessTitles = [movie.title, movie.original_title]
        .filter(Boolean)
        .map((value) => normalize(value));

      return filmography.find((entry) => {
        if (entry.year !== year) return false;
        const names = [entry.title, entry.originalTitle, ...entry.altTitles]
          .filter(Boolean)
          .map((value) => normalize(value));
        return names.some((name) => normalizedGuessTitles.includes(name));
      });
    },
    [filmography]
  );

  const selectActor = useCallback(
    async (person: TMDBPerson) => {
      setIsLoading(true);
      setError(null);
      setActor(person);

      try {
        const credits = await getActorMovieCredits(person.id, language);
        const entries = buildActorFilmography(credits);
        setFilmography(entries);
        setGuessedIds(new Set());
        setWrongGuesses([]);
        setHintSteps({});
        setRemainingSeconds(timeLimit ?? DEFAULT_ROUND_SECONDS);
        setIsTimeUp(false);
        setIsTimerRunning(entries.length > 0);

        if (entries.length === 0) {
          setError('No eligible feature films found for this actor.');
          setIsTimerRunning(false);
        }
      } catch (err) {
        console.error('Failed to load filmography', err);
        setError('Could not load filmography. Please try again.');
        setFilmography([]);
        setIsTimerRunning(false);
      } finally {
        setIsLoading(false);
      }
    },
    [language, timeLimit]
  );

  const guessMovie = useCallback(
    (movie: TMDBMovie): GuessResult => {
      if (!filmography.length) return { status: 'no-filmography' };
      if (isTimeUp) return { status: 'out-of-time' };

      const entry = findMatchingEntry(movie);
      if (!entry) {
        setWrongGuesses((prev) => [...prev, movie]);
        return { status: 'wrong' };
      }

      if (guessedIds.has(entry.id)) {
        return { status: 'already-guessed', entry };
      }

      const nextGuessed = new Set(guessedIds);
      nextGuessed.add(entry.id);
      setGuessedIds(nextGuessed);

      return { status: 'correct', entry };
    },
    [filmography.length, findMatchingEntry, guessedIds, isTimeUp]
  );

  const revealHint = useCallback(
    (movieId: number) => {
      if (isTimeUp) return 0;

      let nextValue = 0;
      setHintSteps((prev) => {
        const current = prev[movieId] ?? 0;
        nextValue = Math.min(current + 1, MAX_HINT_STEPS);
        if (current === nextValue) return prev;
        return { ...prev, [movieId]: nextValue };
      });

      return nextValue;
    },
    [isTimeUp]
  );

  const resetGame = useCallback(() => {
    setActor(null);
    setFilmography([]);
    setGuessedIds(new Set());
    setWrongGuesses([]);
    setHintSteps({});
    setRemainingSeconds(timeLimit ?? DEFAULT_ROUND_SECONDS);
    setIsTimerRunning(false);
    setIsTimeUp(false);
    setError(null);
  }, [timeLimit]);

  const progress = useMemo(
    () => ({
      correct: guessedIds.size,
      total: filmography.length,
      remaining: Math.max(filmography.length - guessedIds.size, 0),
    }),
    [filmography.length, guessedIds]
  );

  return {
    actor,
    filmography,
    guessedIds,
    wrongGuesses,
    hintSteps,
    remainingSeconds,
    isTimeUp,
    isLoading,
    error,
    progress,
    hasTimeLimit,
    actions: {
      selectActor,
      guessMovie,
      revealHint,
      resetGame,
    },
  };
};
