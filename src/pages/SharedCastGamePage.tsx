import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Users, Trophy, Target, Calendar, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { useSharedGames } from "@/hooks/use-shared-games";
import { CastGame } from "@/components/cast-game";
import { getGameMovieWithCast } from "@/services/tmdb";
import type { SharedCastGame, GameLeaderboard } from "@/types/shared-games";
import type { GameMovie, TMDBMovie } from "@/types/tmdb";

const SharedCastGamePage = () => {
  const { shareSlug } = useParams<{ shareSlug: string }>();
  const { getGame, getLeaderboard, getStats } = useSharedGames();
  
  const [game, setGame] = useState<SharedCastGame | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameLeaderboard[]>([]);
  const [stats, setStats] = useState({ totalAttempts: 0, successfulAttempts: 0, successRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMovie, setGameMovie] = useState<GameMovie | null>(null);

  useEffect(() => {
    if (!shareSlug) return;

    const loadGameData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {        
        const gameData = await getGame(shareSlug);        
        if (!gameData) {
          setError("Game not found");
          return;
        }

        setGame(gameData);

        try {
          const [leaderboardData, statsData] = await Promise.all([
            getLeaderboard(shareSlug),
            getStats(shareSlug)
          ]);
          
          setLeaderboard(leaderboardData);
          setStats(statsData);
        } catch (additionalError) {
          console.error('Error loading additional data:', additionalError);
          setLeaderboard([]);
          setStats({ totalAttempts: 0, successfulAttempts: 0, successRate: 0 });
        }
      } catch (err) {
        console.error("Error loading game data:", err);
        setError("Failed to load game");
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [shareSlug]);

  if (!shareSlug) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cinema-gold" />
            <h2 className="text-xl font-semibold mb-2">Loading Shared Game...</h2>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (error || !game) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Game Not Found</h2>
            <Button onClick={() => window.location.href = "/"}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const handleStartPlaying = async () => {
    if (!game) return;

    setIsLoading(true);
    try {
      const tmdbMovie: TMDBMovie = {
        id: game.tmdb_movie_id,
        title: game.movie_title,
        original_title: game.movie_title,
        poster_path: game.movie_poster_path || null,
        backdrop_path: null,
        release_date: game.movie_year ? `${game.movie_year}-01-01` : '',
        overview: '',
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
        original_language: game.language,
        popularity: 0,
        adult: false,
        video: false
      };

      const movieWithCast = await getGameMovieWithCast(tmdbMovie, game.language);
      if (movieWithCast) {
        setGameMovie(movieWithCast);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error loading movie:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If playing the game
  if (isPlaying && gameMovie) {
    return (
      <Layout className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6 pt-8">
          <Card>
            <CardHeader className="p-0">
              <Button variant="ghost" className="w-full p-6" onClick={() => setIsPlaying(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Challenge
              </Button>
            </CardHeader>
          </Card>

          <CastGame
            movie={gameMovie}
            mode={game.mode}
            language={game.language}
            onPlayAgain={() => {}}
            onChangeMode={() => setIsPlaying(false)}
          />
        </div>
      </Layout>
    );
  }

  // Game info page
  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🎬 Cast Guessing Challenge</CardTitle>
            <div className="text-center space-y-2">
              <Badge>{game.mode}</Badge>
              <p>Created by {game.creator_username || 'Anonymous'}</p>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <div className="text-xl font-bold">{stats.totalAttempts}</div>
              <div className="text-sm">Total Attempts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2" />
              <div className="text-xl font-bold">{stats.successfulAttempts}</div>
              <div className="text-sm">Successful</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2" />
              <div className="text-xl font-bold">{stats.successRate}%</div>
              <div className="text-sm">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <Button size="lg" onClick={handleStartPlaying}>
              🎬 Play This Challenge
            </Button>
          </CardContent>
        </Card>

        {leaderboard.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.slice(0, 5).map((attempt, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span>{attempt.player_name}</span>
                  <Badge variant={attempt.is_correct ? "default" : "secondary"}>
                    {attempt.is_correct ? 'Won' : 'Lost'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SharedCastGamePage;