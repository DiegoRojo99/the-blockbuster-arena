import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { LanguageSelector } from "@/components/LanguageSelector";
import { MovieModeOption } from "@/types/tmdb";

const ModeSelectionPage = () => {
  const navigate = useNavigate();

  const gameModes: MovieModeOption[] = [
    {
      id: 'popular',
      name: 'Popular Movies',
      description: 'Most popular movies right now on TMDB',
      icon: '🔥'
    },
    {
      id: 'top_rated',
      name: 'Top Rated',
      description: 'Highest rated movies of all time',
      icon: '⭐'
    },
    {
      id: 'now_playing',
      name: 'Now Playing',
      description: 'Recently released movies (last 2 years)',
      icon: '🎬'
    },
    {
      id: 'upcoming',
      name: 'Upcoming',
      description: 'Movies coming soon to theaters',
      icon: '🎭'
    },
    {
      id: 'custom',
      name: 'Custom Movie',
      description: 'Choose a specific movie to challenge friends',
      icon: '🎯'
    }
  ];

  const handleModeSelect = (modeId: string) => {
    if (modeId === 'custom') {
      navigate('/cast-game/custom');
    } else {
      navigate(`/cast-game?mode=${modeId}`);
    }
  };

  return (
    <Layout className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto pt-8 p-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent [text-shadow:0_0_20px_hsl(var(--cinema-gold)/0.4)] dark:[text-shadow:0_0_30px_hsl(var(--cinema-gold)/0.7)]">
                Cast Guessing Game
              </h1>
              <p className="text-muted-foreground mt-1">
                Choose a movie category to start playing
              </p>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
          </div>
        </div>

        {/* Game Description */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              🎭 How to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <p className="text-muted-foreground">
              We'll show you cast members from a movie one by one. Your goal is to guess the movie title before all cast members are revealed!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge variant="secondary">🎯 Fewer reveals = Better score</Badge>
              <Badge variant="secondary">🔄 Continuous gameplay</Badge>
              <Badge variant="secondary">📱 Mobile friendly</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Mode Selection Grid */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">
            Choose Your Movie Category
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {gameModes.map((mode, index) => (
              <Card 
                key={mode.id}
                className="gradient-card shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleModeSelect(mode.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="text-5xl mb-4 group-hover:animate-float transition-all duration-300">
                    {mode.icon}
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent [text-shadow:0_0_15px_hsl(var(--cinema-gold)/0.3)] dark:[text-shadow:0_0_20px_hsl(var(--cinema-gold)/0.5)]">
                    {mode.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full gradient-gold text-cinema-dark font-semibold hover:shadow-glow transition-all duration-300"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Playing
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <Card className="gradient-card shadow-card border-cinema-gold/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-3 text-cinema-gold">
              🎬 More Modes Coming Soon!
            </h3>
            <p className="text-muted-foreground text-sm">
              We're working on exciting new game modes including decade-based challenges, 
              genre-specific rounds, and actor-focused categories. Stay tuned!
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ModeSelectionPage;