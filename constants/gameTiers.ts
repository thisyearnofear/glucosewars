import { GameMode } from '@/types/game';
import { HealthScenario } from '@/types/health';

export type GameTier = 'tier1' | 'tier2' | 'tier3';

export interface TierConfig {
  tier: GameTier;
  name: string;
  description: string;
  duration: number; // seconds
  foodSpawnRate: number; // ms between spawns
  maxConcurrentFoods: number;
  swipeDirections: ('up' | 'down' | 'left' | 'right')[];
  showMetrics: boolean;
  showGlucose: boolean;
  showComboCounter: boolean;
  showSocialStats: boolean;
  enablePlotTwists: boolean;
  healthProfile: HealthScenario | 'auto_newly_aware' | 'player_selected' | null;
  tutorialMode: boolean;
  insulinRequired: boolean;
  insulinUIEnabled: boolean;
  dexcomOption: boolean;
  winCondition: 'points >= 100' | 'standard' | 'advanced';
  requiresWin: boolean;
  gameMode: GameMode;
}

export const GAME_TIERS: Record<GameTier, TierConfig> = {
  tier1: {
    tier: 'tier1',
    name: 'Tutorial',
    description: 'Warm-up Round: Learn the basics',
    duration: 30,
    foodSpawnRate: 1500,
    maxConcurrentFoods: 3,
    swipeDirections: ['up', 'down'],
    showMetrics: false,
    showGlucose: false,
    showComboCounter: true,
    showSocialStats: false,
    enablePlotTwists: false,
    healthProfile: null,
    tutorialMode: true,
    insulinRequired: false,
    insulinUIEnabled: false,
    dexcomOption: false,
    winCondition: 'points >= 100',
    requiresWin: true,
    gameMode: 'classic',
  },
  tier2: {
    tier: 'tier2',
    name: 'Challenge 1',
    description: 'Manage your health',
    duration: 60,
    foodSpawnRate: 1200,
    maxConcurrentFoods: 5,
    swipeDirections: ['up', 'down', 'left', 'right'],
    showMetrics: true,
    showGlucose: true,
    showComboCounter: true,
    showSocialStats: true,
    enablePlotTwists: false,
    healthProfile: 'auto_newly_aware',
    tutorialMode: false,
    insulinRequired: false,
    insulinUIEnabled: true,
    dexcomOption: true,
    winCondition: 'standard',
    requiresWin: false,
    gameMode: 'life',
  },
  tier3: {
    tier: 'tier3',
    name: 'Challenge 2',
    description: 'Master advanced play',
    duration: 90,
    foodSpawnRate: 1000,
    maxConcurrentFoods: 7,
    swipeDirections: ['up', 'down', 'left', 'right'],
    showMetrics: true,
    showGlucose: true,
    showComboCounter: true,
    showSocialStats: true,
    enablePlotTwists: true,
    healthProfile: 'player_selected',
    tutorialMode: false,
    insulinRequired: true,
    insulinUIEnabled: true,
    dexcomOption: true,
    winCondition: 'advanced',
    requiresWin: false,
    gameMode: 'life',
  },
};

export function getTierConfig(tier: GameTier): TierConfig {
  return GAME_TIERS[tier];
}