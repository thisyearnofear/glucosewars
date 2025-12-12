import { useState, useEffect } from 'react';
import { GameTier } from '@/constants/gameTiers';

export interface PlayerProgressState {
  maxTierUnlocked: GameTier;
  currentTier: GameTier;
  gamesPlayed: number;
  bestScore: number;
  skipOnboarding: boolean;
  lastPlayedAt: number | null;
}

const STORAGE_KEY = 'glucoseWars.playerProgress';

export function usePlayerProgress() {
  const [progress, setProgress] = useState<PlayerProgressState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      maxTierUnlocked: 'tier1',
      currentTier: 'tier1',
      gamesPlayed: 0,
      bestScore: 0,
      skipOnboarding: false,
      lastPlayedAt: null,
    };
  });

  // Persist to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const unlockNextTier = (tier: GameTier) => {
    const tiers: GameTier[] = ['tier1', 'tier2', 'tier3'];
    const currentIndex = tiers.indexOf(tier);
    const nextTier = tiers[currentIndex + 1];

    setProgress(prev => ({
      ...prev,
      maxTierUnlocked: nextTier ? nextTier : tier,
    }));
  };

  const updateBestScore = (score: number) => {
    setProgress(prev => ({
      ...prev,
      bestScore: Math.max(prev.bestScore, score),
    }));
  };

  const incrementGamesPlayed = () => {
    setProgress(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      lastPlayedAt: Date.now(),
    }));
  };

  const setSkipOnboarding = (skip: boolean) => {
    setProgress(prev => ({
      ...prev,
      skipOnboarding: skip,
    }));
  };

  return {
    progress,
    unlockNextTier,
    updateBestScore,
    incrementGamesPlayed,
    setSkipOnboarding,
    setCurrentTier: (tier: GameTier) =>
      setProgress(prev => ({ ...prev, currentTier: tier })),
  };
}