import { useState, useCallback, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { OnchainAchievement, AchievementType, GameState } from '@/types/game';
import { GLUCOSE_WARS_ACHIEVEMENTS_ABI } from '@/utils/contractABIs';
import { GLUCOSE_WARS_ACHIEVEMENTS } from '@/utils/contractAddresses';

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
  const { address, isConnected } = useAccount();
  const [achievements, setAchievements] = useState<OnchainAchievement[]>(
    Object.values(ACHIEVEMENT_DEFINITIONS)
  );
  const [mintingAchievementId, setMintingAchievementId] = useState<AchievementType | null>(null);

  // Get achievement index for contract call
  const getAchievementIndex = (id: AchievementType): number => {
    return achievements.findIndex(a => a.id === id);
  };

  // Contract write hook for minting
  const {
    writeContract,
    data: writeHash,
    isPending: isWritePending,
    error: writeError,
  } = useContractWrite();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  // Define isMinting based on contract write state
  const isMinting = isWritePending || isConfirming;

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
      if (!address || !isConnected) {
        console.error('Wallet not connected');
        return null;
      }

      // Check if achievement is already minted
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement?.unlocked) {
        console.error('Cannot mint NFT for locked achievement:', achievementId);
        return null;
      }

      if (achievement.tokenId) {
        console.log('NFT already minted for achievement:', achievementId);
        return achievement.tokenId; // Return existing token ID
      }

      setMintingAchievementId(achievementId);

      try {
        const achievementIndex = getAchievementIndex(achievementId);
        if (achievementIndex === -1) {
          console.error('Achievement not found:', achievementId);
          setMintingAchievementId(null);
          return null;
        }

        // Call contract write
        // Privacy mode: 0 = public, 1 = private, 2 = healthcare_only
        const privacyMode = 0; // Public by default (can be enhanced with privacy settings)

        writeContract({
          address: GLUCOSE_WARS_ACHIEVEMENTS.address as `0x${string}`,
          abi: GLUCOSE_WARS_ACHIEVEMENTS_ABI,
          functionName: 'mintAchievement',
          args: [BigInt(achievementIndex), privacyMode] as [bigint, number], // Type assertion to match ABI: uint256, uint8
        });

        return achievementId; // Return achievement ID, actual token ID comes from event
      } catch (error) {
        console.error('Failed to initiate mint:', error);
        setMintingAchievementId(null);
        return null;
      }
    },
    [address, isConnected, achievements, writeContract, getAchievementIndex]
  );

  // Handle successful mint confirmation
  useEffect(() => {
    if (isConfirmed && mintingAchievementId && writeHash) {
      // For now, storing the transaction hash. In production, we'd decode the event logs
      // to get the actual token ID from the AchievementMinted event
      setAchievements(prev =>
        prev.map(a =>
          a.id === mintingAchievementId
            ? { ...a, tokenId: writeHash, unlocked: true }
            : a
        )
      );
      setMintingAchievementId(null);
    }
  }, [isConfirmed, mintingAchievementId, writeHash]);

  // Handle mint errors
  useEffect(() => {
    if (writeError && mintingAchievementId) {
      console.error('Mint failed:', writeError);
      setMintingAchievementId(null);
    }
  }, [writeError, mintingAchievementId]);

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
    userAddress: address,
    isConnected,
    isMinting,
    achievements,
    evaluateAchievements,
    mintAchievementNFT,
    mintAchievements,
    getTotalScore,
  };
};
