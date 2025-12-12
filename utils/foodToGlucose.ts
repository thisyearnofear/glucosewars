/**
 * Food-to-Glucose Integration
 * Maps game food definitions to health glucose impacts
 * Single source of truth for how food affects glucose
 */

import { FoodUnit, FoodDefinition } from '@/types/game';
import { FoodNutrients } from '@/types/health';
import { ALLY_FOODS, ENEMY_FOODS } from '@/constants/gameConfig';

/**
 * Create a food-to-glucose mapping from game food definitions
 * Used when player consumes food during battle
 */
const FOOD_GLUCOSE_MAP = new Map<string, FoodNutrients>();

// Build mapping on module load
ALLY_FOODS.concat(ENEMY_FOODS).forEach((foodDef: FoodDefinition) => {
  FOOD_GLUCOSE_MAP.set(foodDef.name, {
    name: foodDef.name,
    type: foodDef.type,
    carbs: estimateCarbs(foodDef),
    protein: estimateProtein(foodDef),
    fat: estimateFat(foodDef),
    glycemicIndex: estimateGlycemicIndex(foodDef),
    estimatedGlucoseImpact: calculateGlucoseImpact(foodDef),
  });
});

/**
 * Estimate carbs from food type and effects
 * Negative glucoseImpact suggests higher carb/sugar content
 */
function estimateCarbs(foodDef: FoodDefinition): number {
  const baseCarbs: Record<string, number> = {
    // High-carb foods
    sugar: 45,
    candy: 50,
    processed: 35,
    soda: 40,
    energy_drink: 50,
    coffee: 2,
    
    // Medium-carb
    whole_grain: 35,
    fruit: 25,
    
    // Low-carb
    vegetable: 8,
    protein: 2,
    water: 0,
    dairy: 10,
    nuts: 6,
    tea: 1,
    alcohol: 5,
    fast_food: 40,
  };
  
  return baseCarbs[foodDef.type] || 15;
}

/**
 * Estimate protein from food type
 */
function estimateProtein(foodDef: FoodDefinition): number {
  const baseProtein: Record<string, number> = {
    protein: 25,
    dairy: 8,
    nuts: 6,
    whole_grain: 4,
    vegetable: 3,
    food: 2,
    alcohol: 0,
    water: 0,
    sugar: 0,
    candy: 0,
  };
  
  return baseProtein[foodDef.type] || 2;
}

/**
 * Estimate fat from food type
 */
function estimateFat(foodDef: FoodDefinition): number {
  const baseFat: Record<string, number> = {
    nuts: 14,
    protein: 12,
    dairy: 8,
    fast_food: 15,
    processed: 12,
    whole_grain: 2,
    alcohol: 0,
    vegetable: 0,
    fruit: 0,
    water: 0,
    sugar: 2,
  };
  
  return baseFat[foodDef.type] || 3;
}

/**
 * Estimate glycemic index (0-100) based on food type
 * Higher = faster glucose spike
 */
function estimateGlycemicIndex(foodDef: FoodDefinition): number {
  const baseGI: Record<string, number> = {
    // High GI (fast spike)
    sugar: 98,
    candy: 97,
    soda: 95,
    processed: 80,
    energy_drink: 90,
    whole_grain: 55,
    
    // Medium GI
    fruit: 55,
    fast_food: 70,
    coffee: 0,
    alcohol: 0,
    
    // Low GI (slow, steady)
    vegetable: 15,
    protein: 0,
    water: 0,
    dairy: 35,
    nuts: 20,
    tea: 0,
  };
  
  return baseGI[foodDef.type] || 50;
}

/**
 * Calculate expected glucose impact in mg/dL
 * Based on game's glucoseImpact value
 * 
 * Negative glucoseImpact = enemy food = raises glucose (bad)
 * Positive glucoseImpact = ally food = minimal impact
 */
function calculateGlucoseImpact(foodDef: FoodDefinition): number {
  // For enemy foods (negative glucoseImpact), they cause glucose spikes
  // Map the game's -8 to +25 mg/dL rise
  // For ally foods (positive glucoseImpact), minimal impact
  
  if (foodDef.glucoseImpact < 0) {
    // Enemy food: convert negative impact to positive glucose rise
    // -8 becomes ~20 mg/dL, -15 becomes ~35 mg/dL
    return Math.abs(foodDef.glucoseImpact) * 2.5;
  } else {
    // Ally food: minimal impact (slight rise from carbs if any)
    return foodDef.glucoseImpact * 3; // Small positive impact
  }
}

/**
 * Get glucose nutrients for a food unit
 * Returns null if food not found (shouldn't happen in normal flow)
 */
export const getFoodNutrients = (food: FoodUnit): FoodNutrients | null => {
  return FOOD_GLUCOSE_MAP.get(food.name) || null;
};

/**
 * Get glucose impact for a specific food type
 */
export const getGlucoseImpactForFood = (foodName: string): number => {
  const nutrients = FOOD_GLUCOSE_MAP.get(foodName);
  return nutrients?.estimatedGlucoseImpact || 0;
};

/**
 * Recalculate glucose impact accounting for insulin sensitivity
 * isf = Insulin Sensitivity Factor (how many mg/dL does 1 unit insulin drop glucose)
 */
export const calculatePostMealGlucose = (
  currentGlucose: number,
  foodNutrients: FoodNutrients,
  insulinSensitivityFactor: number = 50
): number => {
  // Estimate insulin needed for meal
  const estimatedCarbs = foodNutrients.carbs;
  const carbsToInsulinRatio = 10; // 1 unit per 10g carbs (typical)
  const estimatedInsulinNeeded = estimatedCarbs / carbsToInsulinRatio;
  
  // Expected glucose rise from food
  const glucoseRise = foodNutrients.estimatedGlucoseImpact;
  
  // Expected glucose drop from insulin (if available)
  const insulinDrop = estimatedInsulinNeeded * insulinSensitivityFactor;
  
  // Net glucose change
  const netChange = glucoseRise - insulinDrop;
  
  return Math.max(40, Math.min(400, currentGlucose + netChange));
};

export default FOOD_GLUCOSE_MAP;
