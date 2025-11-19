import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { CastGame } from "@/components/cast-game";
import { GameMovie, MovieMode, TMDBMovie } from "@/types/tmdb";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGameManager } from "@/hooks/useGameManager";
import { convertToGameMovie, getMovieDetails } from "@/services/tmdb";

const CastGamePage = () => {
  const [searchParams] = useSearchParams();
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const [customMovie, setCustomMovie] = useState<GameMovie | null>(null);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  
  // Check if this is a custom movie game (URL pattern: /cast-game/custom/:movieId)
  const isCustomMode = movieId !== undefined;
  
  // Get mode from URL params, fallback to popular
  const modeParam = searchParams.get('mode') as MovieMode;
  const selectedMode = isCustomMode ? 'custom' : (['popular', 'top_rated', 'now_playing', 'upcoming'].includes(modeParam) ? modeParam : 'popular');
  
  // Use the game manager hook (only for non-custom modes)
  const { gameState, actions } = useGameManager({
    mode: selectedMode as any,
    language: currentLanguage,
    enabled: !isCustomMode
  });

  // Load custom movie if in custom mode
  useEffect(() => {
    if (isCustomMode && movieId) {
      setIsLoadingCustom(true);
      getMovieDetails(parseInt(movieId), currentLanguage)
        .then(async movie => {
          const gameMovie = await convertToGameMovie(movie);
          setCustomMovie(gameMovie);
        })
        .catch(error => {
          console.error('Failed to load custom movie:', error);
          navigate('/cast-game-modes');
        })
        .finally(() => {
          setIsLoadingCustom(false);
        });
    }
  }, [isCustomMode, movieId, currentLanguage, navigate]);

  // Redirect to mode selection if no valid mode is provided (non-custom)
  useEffect(() => {
    if (!isCustomMode && (!modeParam || !['popular', 'top_rated', 'now_playing', 'upcoming'].includes(modeParam))) {
      navigate('/cast-game-modes');
      return;
    }
  }, [isCustomMode, modeParam, navigate]);

  // Show loading state
  if ((isCustomMode && isLoadingCustom) || (!isCustomMode && gameState.isLoading)) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cinema-gold" />
            <h3 className="text-lg font-semibold mb-2">
              {isCustomMode ? 'Loading Custom Movie' : 'Loading Movies'}
            </h3>
            <p className="text-muted-foreground">Getting ready for the ultimate cast guessing challenge...</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const currentMovie = isCustomMode ? customMovie : gameState.currentMovie;
  const modeTitle = isCustomMode ? '🎯 Custom Movie Challenge' :
                    selectedMode === 'popular' ? '🔥 Popular Movies' : 
                    selectedMode === 'top_rated' ? '⭐ Top Rated' :
                    selectedMode === 'now_playing' ? '🎬 Now Playing' :
                    '🎭 Upcoming Movies';

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto flex flex-row gap-4 items-center justify-between">
          <Link to={isCustomMode ? "/cast-game/custom" : "/cast-game-modes"}>
            <button className="flex text-sm md:text-base items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {isCustomMode ? 'Choose Movie' : 'Change Mode'}
            </button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              {modeTitle}
            </h1>
          </div>

          <div className="md:hidden"></div> {/* Spacer for flex layout */}
        </div>

        {/* Game-Focused Layout */}
        <div className="max-w-4xl mx-auto">
          {currentMovie && (
            <CastGame
              movie={currentMovie}
              mode={selectedMode}
              language={currentLanguage}
              onPlayAgain={() => {
                if (isCustomMode) {
                  // Reload the same custom movie
                  window.location.reload();
                } else {
                  actions.resetGame();
                }
              }}
              onChangeMode={() => {
                navigate(isCustomMode ? '/cast-game/custom' : '/cast-game-modes');
              }}
              disabled={isCustomMode ? isLoadingCustom : gameState.isLoading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CastGamePage;