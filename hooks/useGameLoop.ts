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
    score: 0,
    glucoseLevel: INITIAL_GLUCOSE,
    timer: GAME_DURATION,
    pathLength: 0,
    particles: [],
    isGameActive: false,
    gameResult: null,
    comboCount: 0,
  });
  
  const hexPathRef = useRef<HexPath | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pathExtendRef = useRef<NodeJS.Timeout | null>(null);
  const particleSpawnRef = useRef<NodeJS.Timeout | null>(null);
  const particleMoveRef = useRef<NodeJS.Timeout | null>(null);
  
  const startGame = useCallback(() => {
    hexPathRef.current = new HexPath(width, height);
    
    setGameState({
      score: 0,
      glucoseLevel: INITIAL_GLUCOSE,
      timer: GAME_DURATION,
      pathLength: 1,
      particles: [],
      isGameActive: true,
      gameResult: null,
      comboCount: 0,
    });
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
          endGame(prev.glucoseLevel >= 40 && prev.glucoseLevel <= 60 ? 'victory' : 'defeat');
          return prev;
        }
        return { ...prev, timer: newTimer };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isGameActive, endGame]);

  // Path extension
  useEffect(() => {
    if (!gameState.isGameActive || !hexPathRef.current) return;

    pathExtendRef.current = setInterval(() => {
      const extended = hexPathRef.current?.extend();
      if (extended) {
        setGameState((prev) => ({ ...prev, pathLength: prev.pathLength + 1 }));
      }
    }, PATH_EXTEND_INTERVAL);

    return () => {
      if (pathExtendRef.current) clearInterval(pathExtendRef.current);
    };
  }, [gameState.isGameActive]);

  // Spawn particles
  useEffect(() => {
    if (!gameState.isGameActive) return;

    // Spawn first particle immediately
    const spawnParticle = () => {
      const rand = Math.random();
      let type = GLUCOSE_TYPES[0];
      
      let cumulative = 0;
      for (const glucoseType of GLUCOSE_TYPES) {
        cumulative += glucoseType.spawnChance;
        if (rand <= cumulative) {
          type = glucoseType;
          break;
        }
      }

      const newParticle: GlucoseParticle = {
        id: `particle-${Date.now()}-${Math.random()}`,
        type: type.type,
        position: 0,
        speed: 0.008 + Math.random() * 0.006,
        points: type.basePoints,
        color: type.color,
      };

      setGameState((prev) => ({
        ...prev,
        particles: [...prev.particles, newParticle],
      }));
    };

    // Spawn 3 particles immediately at game start
    spawnParticle();
    setTimeout(spawnParticle, 300);
    setTimeout(spawnParticle, 600);

    particleSpawnRef.current = setInterval(spawnParticle, 1200);

    return () => {
      if (particleSpawnRef.current) clearInterval(particleSpawnRef.current);
    };
  }, [gameState.isGameActive]);

  // Move particles
  useEffect(() => {
    if (!gameState.isGameActive) return;

    particleMoveRef.current = setInterval(() => {
      setGameState((prev) => {
        const updatedParticles = prev.particles
          .map((p) => ({ ...p, position: p.position + p.speed }))
          .filter((p) => p.position < 1);

        // Check for particles that reached the end
        const missedParticles = prev.particles.filter((p) => p.position + p.speed >= 1);
        let newGlucose = prev.glucoseLevel;
        
        missedParticles.forEach((p) => {
          const glucoseDef = GLUCOSE_TYPES.find((g) => g.type === p.type);
          if (glucoseDef) {
            newGlucose = Math.max(0, Math.min(100, newGlucose + glucoseDef.glucoseImpact));
          }
        });

        // Check for critical glucose levels
        if (newGlucose <= 0 || newGlucose >= 100) {
          endGame('defeat');
        }

        return {
          ...prev,
          particles: updatedParticles,
          glucoseLevel: newGlucose,
        };
      });
    }, 50);

    return () => {
      if (particleMoveRef.current) clearInterval(particleMoveRef.current);
    };
  }, [gameState.isGameActive, endGame]);

  const handleParticleTap = useCallback((particleId: string) => {
    setGameState((prev) => {
      const particle = prev.particles.find((p) => p.id === particleId);
      if (!particle) return prev;

      const glucoseDef = GLUCOSE_TYPES.find((g) => g.type === particle.type);
      if (!glucoseDef) return prev;

      const isHealthy = particle.type === 'healthy' || particle.type === 'bonus';
      
      if (isHealthy) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        return {
          ...prev,
          score: prev.score + particle.points,
          glucoseLevel: Math.max(0, Math.min(100, prev.glucoseLevel + glucoseDef.glucoseImpact)),
          particles: prev.particles.filter((p) => p.id !== particleId),
          comboCount: prev.comboCount + 1,
        };
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        return {
          ...prev,
          glucoseLevel: Math.max(0, Math.min(100, prev.glucoseLevel - 10)),
          particles: prev.particles.filter((p) => p.id !== particleId),
          comboCount: 0,
        };
      }
    });
  }, []);

  const getPathData = () => {
    return hexPathRef.current?.getPathData() || '';
  };

  const getBridgeTransforms = () => {
    return hexPathRef.current?.getBridgeTransforms() || [];
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
