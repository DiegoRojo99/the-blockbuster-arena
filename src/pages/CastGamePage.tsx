import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { CastGame } from "@/components/cast-game";
import { MovieMode } from "@/types/tmdb";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGameManager } from "@/hooks/useGameManager";

const CastGamePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  
  // Get mode from URL params, fallback to popular
  const modeParam = searchParams.get('mode') as MovieMode;
  const selectedMode = ['popular', 'top_rated', 'now_playing', 'upcoming'].includes(modeParam) ? modeParam : 'popular';
  
  // Use the game manager hook
  const { gameState, actions } = useGameManager({
    mode: selectedMode,
    language: currentLanguage
  });

  // Redirect to mode selection if no valid mode is provided
  useEffect(() => {
    if (!modeParam || !['popular', 'top_rated', 'now_playing', 'upcoming'].includes(modeParam)) {
      navigate('/cast-game-modes');
      return;
    }
  }, [modeParam, navigate]);

  if (gameState.isLoading) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cinema-gold" />
            <h3 className="text-lg font-semibold mb-2">Loading Movies</h3>
            <p className="text-muted-foreground">Getting ready for the ultimate cast guessing challenge...</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto flex flex-row gap-4 items-center justify-between">
          <Link to="/cast-game-modes">
            <button className="flex text-sm md:text-base items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Change Mode
            </button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              {
                selectedMode === 'popular' ? '🔥 Popular Movies' : 
                selectedMode === 'top_rated' ? '⭐ Top Rated' :
                selectedMode === 'now_playing' ? '🎬 Now Playing' :
                '🎭 Upcoming Movies'
              }
            </h1>
          </div>

          <div className="md:hidden"></div> {/* Spacer for flex layout */}
        </div>

        {/* Game-Focused Layout */}
        <div className="max-w-4xl mx-auto">
          {gameState.currentMovie && (
            <CastGame
              movie={gameState.currentMovie}
              mode={selectedMode}
              language={currentLanguage}
              onPlayAgain={() => {
                actions.resetGame();
              }}
              onChangeMode={() => {
                navigate('/cast-game-modes');
              }}
              disabled={gameState.isLoading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CastGamePage;