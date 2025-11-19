import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { CustomMovieSelector } from "@/components/cast-game/CustomMovieSelector";
import { TMDBMovie } from "@/types/tmdb";

const CustomMoviePage = () => {
  const navigate = useNavigate();

  const handleMovieSelect = (movie: TMDBMovie, playMode: 'local' | 'share') => {
    if (playMode === 'local') {
      // Navigate to game with custom movie ID
      navigate(`/cast-game/custom/${movie.id}`);
    }
    // For share mode, the URL is already generated in the component
  };

  return (
    <Layout className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto pt-8 p-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link to="/cast-game-modes">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Modes
                </button>
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              🎯 Custom Movie Challenge
            </h1>
            <p className="text-muted-foreground mt-1">
              Choose a specific movie to play or challenge your friends
            </p>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-gradient-to-r from-cinema-gold/10 to-cinema-purple/10 border border-cinema-gold/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3">How it works</h2>
          <div className="space-y-2 text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-xl">1️⃣</span>
              <span>Search for any movie from the TMDB database</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-xl">2️⃣</span>
              <span>Choose to <strong>Play Now</strong> (start immediately) or <strong>Generate Share Link</strong> (challenge friends)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-xl">3️⃣</span>
              <span>When sharing, your friends will get the same movie to guess - perfect for competitions!</span>
            </p>
          </div>
        </div>

        {/* Custom Movie Selector */}
        <CustomMovieSelector onMovieSelect={handleMovieSelect} />
      </div>
    </Layout>
  );
};

export default CustomMoviePage;
