import { useState, useCallback, useEffect } from 'react';
import { OnchainAchievement, AchievementType, GameState } from '@/types/game';

// Minimal Scroll contract interface (to be deployed)
const SCROLL_CONTRACT_ABI = [
  {
    name: 'mintAchievement',
    type: 'function',
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'achievementId', type: 'uint256' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'getPlayerAchievements',
    type: 'function',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: 'achievements', type: 'uint256[]' }],
  },
];

const ACHIEVEMENT_DEFINITIONS: Record<AchievementType, OnchainAchievement> = {
  victory_classic: {
    id: 'victory_classic',
    name: 'Glucose Master',
    description: 'Won a Classic mode game',
    icon: '🏆',
    points: 100,
    unlocked: false,
  },
  victory_life: {
    id: 'victory_life',
    name: 'Life Keeper',
    description: 'Survived a full Life mode game',
    icon: '❤️',
    points: 250,
    unlocked: false,
  },
  perfect_stability: {
    id: 'perfect_stability',
    name: 'Perfect Balance',
    description: 'Maintained stability between 40-60 for entire game',
    icon: '⚖️',
    points: 150,
    unlocked: false,
  },
  high_combo: {
    id: 'high_combo',
    name: 'Combo Champion',
    description: 'Achieved 50+ combo count',
    icon: '🔥',
    points: 120,
    unlocked: false,
  },
  health_streak: {
    id: 'health_streak',
    name: 'Health Warrior',
    description: 'Won 3 consecutive games',
    icon: '⚔️',
    points: 300,
    unlocked: false,
  },
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    description: 'Played all game modes',
    icon: '🗺️',
    points: 200,
    unlocked: false,
  },
};

export const useScrollIntegration = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<OnchainAchievement[]>(
    Object.values(ACHIEVEMENT_DEFINITIONS)
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [scrollBalance, setScrollBalance] = useState(0);

  // Connect to Scroll wallet
  const connectWallet = useCallback(async () => {
    try {
      // Placeholder: integrate with wagmi/viem for real wallet connection
      // For now, generate a mock address for demonstration
      const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
      setUserAddress(mockAddress);
      setIsConnected(true);
      return mockAddress;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setUserAddress(null);
    setIsConnected(false);
  }, []);

  // Check if achievement should be unlocked based on game result
  const evaluateAchievements = useCallback((gameState: GameState) => {
    const newAchievements = [...achievements];
    const unlockedIds: AchievementType[] = [];

    if (gameState.gameResult === 'victory') {
      if (gameState.gameMode === 'classic') {
        const idx = newAchievements.findIndex(a => a.id === 'victory_classic');
        if (idx !== -1 && !newAchievements[idx].unlocked) {
          newAchievements[idx] = {
            ...newAchievements[idx],
            unlocked: true,
            unlockedAt: Date.now(),
          };
          unlockedIds.push('victory_classic');
        }
      } else if (gameState.gameMode === 'life') {
        const idx = newAchievements.findIndex(a => a.id === 'victory_life');
        if (idx !== -1 && !newAchievements[idx].unlocked) {
          newAchievements[idx] = {
            ...newAchievements[idx],
            unlocked: true,
            unlockedAt: Date.now(),
          };
          unlockedIds.push('victory_life');
        }
      }
    }

    // Perfect stability achievement
    const stability = gameState.stability || gameState.metrics?.stability || 0;
    const metricsHistory = gameState.metricsHistory || [];
    const isPerfectStability =
      stability >= 40 &&
      stability <= 60 &&
      metricsHistory.length > 0 &&
      metricsHistory.every(m => m.stability >= 40 && m.stability <= 60);

    if (isPerfectStability) {
      const idx = newAchievements.findIndex(a => a.id === 'perfect_stability');
      if (idx !== -1 && !newAchievements[idx].unlocked) {
        newAchievements[idx] = {
          ...newAchievements[idx],
          unlocked: true,
          unlockedAt: Date.now(),
        };
        unlockedIds.push('perfect_stability');
      }
    }

    // High combo achievement
    if (gameState.comboCount >= 50) {
      const idx = newAchievements.findIndex(a => a.id === 'high_combo');
      if (idx !== -1 && !newAchievements[idx].unlocked) {
        newAchievements[idx] = {
          ...newAchievements[idx],
          unlocked: true,
          unlockedAt: Date.now(),
        };
        unlockedIds.push('high_combo');
      }
    }

    setAchievements(newAchievements);
    return unlockedIds;
  }, [achievements]);

  // Mint NFT for unlocked achievement (Scroll Sepolia)
  const mintAchievementNFT = useCallback(
    async (achievementId: AchievementType) => {
      if (!userAddress || !isConnected) {
        console.error('Wallet not connected');
        return null;
      }

      setIsMinting(true);
      try {
        // Placeholder: implement with wagmi/viem contract write
        // Mock token ID generation
        const mockTokenId = `0x${Math.random().toString(16).slice(2, 18)}`;

        // Update achievement with token ID
        setAchievements(prev =>
          prev.map(a =>
            a.id === achievementId
              ? { ...a, tokenId: mockTokenId }
              : a
          )
        );

        return mockTokenId;
      } catch (error) {
        console.error('Failed to mint NFT:', error);
        return null;
      } finally {
        setIsMinting(false);
      }
    },
    [userAddress, isConnected]
  );

  // Batch mint multiple achievements
  const mintAchievements = useCallback(
    async (achievementIds: AchievementType[]) => {
      const results = await Promise.all(
        achievementIds.map(id => mintAchievementNFT(id))
      );
      return results;
    },
    [mintAchievementNFT]
  );

  // Get total onchain score
  const getTotalScore = useCallback(() => {
    return achievements.reduce((sum, a) => (a.unlocked ? sum + a.points : sum), 0);
  }, [achievements]);

  return {
    userAddress,
    isConnected,
    isMinting,
    achievements,
    scrollBalance,
    connectWallet,
    disconnectWallet,
    evaluateAchievements,
    mintAchievementNFT,
    mintAchievements,
    getTotalScore,
  };
};
