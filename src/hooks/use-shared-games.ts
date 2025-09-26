// =============================================
// SHARED GAMES HOOK
// =============================================
// React hook for managing shared cast games
// Handles sharing games and submitting attempts
// =============================================

import { useState } from 'react';
import { SharedCastGameService } from '@/services/sharedGamesService';
import type { ShareGameData, SubmitAttemptData } from '@/types/shared-games';

export const useSharedGames = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const shareGame = async (gameData: ShareGameData): Promise<string | null> => {
    setIsSharing(true);
    setShareError(null);
    
    try {
      const { shareSlug } = await SharedCastGameService.createSharedGame(gameData);
      const fullUrl = `${window.location.origin}/cast-game/shared/${shareSlug}`;
      setShareUrl(fullUrl);
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(fullUrl);
      } catch (clipboardError) {
        console.warn('Failed to copy to clipboard:', clipboardError);
      }
      
      return fullUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share game';
      setShareError(errorMessage);
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  const submitAttempt = async (attemptData: SubmitAttemptData) => {
    try {
      return await SharedCastGameService.submitAttempt(attemptData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit attempt';
      throw new Error(errorMessage);
    }
  };

  const getGame = async (shareSlug: string) => {
    try {
      return await SharedCastGameService.getSharedGame(shareSlug);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get game';
      throw new Error(errorMessage);
    }
  };

  const getLeaderboard = async (shareSlug: string) => {
    try {
      return await SharedCastGameService.getGameLeaderboard(shareSlug);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get leaderboard';
      throw new Error(errorMessage);
    }
  };

  const getStats = async (shareSlug: string) => {
    try {
      return await SharedCastGameService.getGameStats(shareSlug);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get stats';
      throw new Error(errorMessage);
    }
  };

  const clearShareState = () => {
    setShareError(null);
    setShareUrl(null);
  };

  return {
    // State
    isSharing,
    shareError,
    shareUrl,
    
    // Actions
    shareGame,
    submitAttempt,
    getGame,
    getLeaderboard,
    getStats,
    clearShareState
  };
};