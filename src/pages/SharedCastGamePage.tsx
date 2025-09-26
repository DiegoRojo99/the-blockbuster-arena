import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Users, Trophy, Target, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import { useSharedGames } from "@/hooks/use-shared-games";
import type { SharedCastGame, GameLeaderboard } from "@/types/shared-games";

const SharedCastGamePage = () => {
  const { shareSlug } = useParams<{ shareSlug: string }>();
  const { getGame, getLeaderboard, getStats } = useSharedGames();
  
  const [game, setGame] = useState<SharedCastGame | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameLeaderboard[]>([]);
  const [stats, setStats] = useState({ totalAttempts: 0, successfulAttempts: 0, successRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareSlug) return;

    const loadGameData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {        
        // Load game first
        const gameData = await getGame(shareSlug);        
        if (!gameData) {
          setError("Game not found");
          return;
        }

        setGame(gameData);

        // Then load additional data
        try {
          const [leaderboardData, statsData] = await Promise.all([
            getLeaderboard(shareSlug),
            getStats(shareSlug)
          ]);
          
          setLeaderboard(leaderboardData);
          setStats(statsData);
        } catch (additionalError) {
          console.error('Error loading additional data:', additionalError);
          // Don't fail the whole page for leaderboard/stats errors
          setLeaderboard([]);
          setStats({ totalAttempts: 0, successfulAttempts: 0, successRate: 0 });
        }
      } catch (err) {
        console.error("Error loading game data:", err);
        setError(`Failed to load game: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [shareSlug]);

  // Redirect to homepage if no shareSlug
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
            <p className="text-muted-foreground">Getting game details</p>
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
            <p className="text-muted-foreground mb-4">
              {error || "This shared game doesn't exist or has been removed."}
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getModeLabel = (mode: string) => {
    const labels = {
      popular: 'Popular Movies',
      top_rated: 'Top Rated',
      now_playing: 'Now Playing',
      upcoming: 'Upcoming'
    };
    return labels[mode as keyof typeof labels] || mode;
  };

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        
        {/* Game Header */}
        <Card className="gradient-card shadow-elevated">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="text-2xl mb-4">
                🎬 Cast Guessing Challenge
              </CardTitle>
              <div className="space-y-3">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary">
                    {getModeLabel(game.mode)}
                  </Badge>
                  <Badge variant="outline">
                    {game.language.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Created by <span className="font-medium">{game.creator_username || 'Anonymous'}</span>
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(game.created_at)}
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Can you guess this movie by its cast? Click below to start the challenge!
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Game Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{stats.successfulAttempts}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Play Game Button */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => {
                  // For now, redirect to regular cast game with same mode
                  window.location.href = `/cast-game?mode=${game.mode}`;
                }}
              >
                🎬 Play This Challenge
              </Button>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Note: This will start a new game in {getModeLabel(game.mode)} mode. 
                Playing the exact shared movie is coming soon!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-black">
                {leaderboard.slice(0, 10).map((attempt, index) => (
                  <div 
                    key={`${attempt.player_name}-${attempt.completed_at}`}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      attempt.is_correct ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm text-white font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{attempt.player_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(attempt.completed_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {attempt.is_correct ? (
                          <Badge variant="default" className="bg-green-600">
                            Won
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Lost
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {attempt.guess_count} guesses, {attempt.cast_revealed_count}/6 cast shown
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </Layout>
  );
};

export default SharedCastGamePage;