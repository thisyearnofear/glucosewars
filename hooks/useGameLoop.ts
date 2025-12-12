import { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameState, GlucoseParticle } from '@/types/game';
import { 
  GAME_DURATION, 
  INITIAL_GLUCOSE,
  GLUCOSE_TYPES,
  PATH_EXTEND_INTERVAL,
} from '@/constants/gameConfig';
import { HexPath } from '@/utils/hexPath';

const { width, height } = Dimensions.get('window');

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>({
    // Core
    score: 0,
    timer: GAME_DURATION,
    foods: [],
    isGameActive: false,
    gameResult: null,
    gameMode: 'classic',

    // Multi-metric system
    metrics: {
      energy: 50,
      hydration: 50,
      nutrition: 50,
      stability: 50,
    },
    stability: INITIAL_GLUCOSE,

    // Time of day (Life Mode)
    timePhase: 'morning',
    morningCondition: 'normal_day',

    // Plot twists
    activePlotTwist: null,
    plotTwistTimer: 0,
    plotTwistsTriggered: 0,

    // Special modes
    activeSpecialMode: null,
    specialModeTimer: 0,
    foodTypeStreak: { type: '', count: 0 },

    // Combo system
    comboCount: 0,
    comboTimer: 0,
    lastSwipeTime: 0,

    // Power-ups
    exerciseCharges: 3,
    rationCharges: 3,

    // 4-Direction Swipe System
    savedFoods: [{ food: null, savedAt: 0 }, { food: null, savedAt: 0 }, { food: null, savedAt: 0 }],
    socialStats: { totalShares: 0, shareStreak: 0, socialMeter: 0 },
    lastSwipeAction: null,

    // UI state
    announcement: null,
    announcementType: 'info',
    announcementPosition: { x: 'center', y: 'top' },
    announcementScience: null,
    showTutorial: true,
    tutorialStep: 0,
    screenShake: 0,
    isPaused: false,

    // Dynamic speed modifiers
    speedMultiplier: 1.0,
    spawnRateMultiplier: 1.0,

    // Stats tracking
    correctSwipes: 0,
    incorrectSwipes: 0,
    optimalSwipes: 0,
    timeInBalanced: 0,
    timeInWarning: 0,
    timeInCritical: 0,
    metricsHistory: [],
    shareableMoments: [],
  });
  
  const hexPathRef = useRef<HexPath | null>(null);
  const timerRef = useRef<number | null>(null);
  const pathExtendRef = useRef<number | null>(null);
  const particleSpawnRef = useRef<number | null>(null);
  const particleMoveRef = useRef<number | null>(null);
  
  const startGame = useCallback(() => {
    hexPathRef.current = new HexPath(width, height);

    setGameState(prev => ({
      ...prev,
      // Core
      score: 0,
      timer: GAME_DURATION,
      foods: [],
      isGameActive: true,
      gameResult: null,

      // Multi-metric system
      metrics: {
        energy: 50,
        hydration: 50,
        nutrition: 50,
        stability: 50,
      },
      stability: INITIAL_GLUCOSE,

      // UI state
      announcement: null,
      comboCount: 0,

      // Stats tracking
      correctSwipes: 0,
      incorrectSwipes: 0,
      optimalSwipes: 0,
      metricsHistory: [],
    }));
  }, []);
  
  const endGame = useCallback((result: 'victory' | 'defeat') => {
    setGameState((prev) => ({
      ...prev,
      isGameActive: false,
      gameResult: result,
    }));
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (pathExtendRef.current) clearInterval(pathExtendRef.current);
    if (particleSpawnRef.current) clearInterval(particleSpawnRef.current);
    if (particleMoveRef.current) clearInterval(particleMoveRef.current);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameState.isGameActive) return;

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        const newTimer = prev.timer - 1;
        if (newTimer <= 0) {
          // Use stability instead of glucoseLevel for victory condition
          endGame(prev.stability >= 40 && prev.stability <= 60 ? 'victory' : 'defeat');
          return prev;
        }
        return { ...prev, timer: newTimer };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isGameActive, endGame]);


  // Placeholder effect - game mechanics have changed
  useEffect(() => {
    if (!gameState.isGameActive) return;

    // Current game uses food swiping instead of particle tapping
    // This effect is maintained for compatibility but may be removed

    return () => {
      // Cleanup
    };
  }, [gameState.isGameActive]);

  const handleParticleTap = useCallback((particleId: string) => {
    // This function is for the old particle system and is no longer used
    // Current game uses handleSwipe in useBattleGame instead
    console.log("Particle tap handler - this is an old function from previous game version");
  }, []);

  const getPathData = () => {
    // Hex path system is from previous game version
    return '';
  };

  const getBridgeTransforms = () => {
    // Hex path system is from previous game version
    return [];
  };

  return {
    gameState,
    startGame,
    endGame,
    handleParticleTap,
    getPathData,
    getBridgeTransforms,
  };
};
