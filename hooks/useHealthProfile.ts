import { useState, useCallback, useRef } from 'react';
import {
  HealthProfile,
  HealthSimulationState,
  HealthScenario,
  GlucoseReading,
  InsulinDose,
  FoodNutrients,
} from '@/types/health';
import {
  createHealthProfile,
  generateMockReadings,
  GLUCOSE_ZONES,
  getGlucoseZone,
  INSULIN_PROFILES,
} from '@/constants/healthScenarios';

export const useHealthProfile = (initialScenario?: HealthScenario) => {
  const [healthProfile, setHealthProfile] = useState<HealthProfile>(() =>
    initialScenario ? createHealthProfile(initialScenario) : createHealthProfile('newly_aware')
  );

  const [healthSimulation, setHealthSimulation] = useState<HealthSimulationState>({
    simStartTime: Date.now(),
    simCurrentTime: Date.now(),
    timeAccelerationFactor: 24, // 1 minute game = 24 minutes simulated
    currentDayMetrics: {},
    mealAbsorptionCurve: 'normal',
  });

  const glucoseSimulationRef = useRef<number | null>(null);

  /**
   * Update scenario (onboarding)
   */
  const setScenario = useCallback((scenario: HealthScenario, playerName?: string) => {
    const profile = createHealthProfile(scenario, playerName || 'Player');
    setHealthProfile(profile);
  }, []);

  /**
   * Simulate glucose changes based on meals, insulin, exercise
   * Runs continuously during game
   */
  const startGlucoseSimulation = useCallback(() => {
    if (glucoseSimulationRef.current) clearInterval(glucoseSimulationRef.current);

    glucoseSimulationRef.current = setInterval(() => {
      setHealthProfile(prev => {
        const newProfile = { ...prev };
        
        // Advance simulation time
        setHealthSimulation(prevSim => {
          const newSim = { ...prevSim };
          const elapsedMs = Date.now() - prevSim.simStartTime;
          newSim.simCurrentTime = prevSim.simStartTime + (elapsedMs * prevSim.timeAccelerationFactor);
          
          // Glucose dynamics
          let glucoseDelta = 0;

          // 1. Active insulin effect
          const now = newSim.simCurrentTime;
          const activeInsulin = newProfile.activeInsulin.filter(dose => {
            const timeElapsed = (now - dose.administeredAt) / 1000 / 60; // minutes
            return timeElapsed < dose.duration;
          });

          for (const dose of activeInsulin) {
            const timeElapsed = (now - dose.administeredAt) / 1000 / 60; // minutes
            const profile = INSULIN_PROFILES[dose.type] || INSULIN_PROFILES.rapid; // fallback to rapid if type is 'none'
            
            // Estimate insulin effect curve
            const peakEffect = dose.units * 50; // Simplified ISF calculation
            if (timeElapsed < profile.peakMins) {
              // Ramping up to peak
              glucoseDelta -= (peakEffect / profile.peakMins) * (1 / 60); // Per second
            } else if (timeElapsed < profile.durationMins) {
              // Tapering down
              const timeAfterPeak = timeElapsed - profile.peakMins;
              const remainingDuration = profile.durationMins - profile.peakMins;
              glucoseDelta -= (peakEffect / remainingDuration) * (1 / 60); // Per second
            }
          }

          // 2. Meal absorption (if logged)
          if (newSim.lastMealTime) {
            const mealElapsed = (now - newSim.lastMealTime) / 1000 / 60; // minutes
            
            // Peak time varies by absorption curve
            const peakTimeMap = {
              fast: 30,   // Simple carbs peak quickly
              normal: 45, // Standard meal
              slow: 90,   // High fiber, protein-rich
            };
            const mealPeakTime = peakTimeMap[newSim.mealAbsorptionCurve];
            const absorptionDuration = mealPeakTime * 2; // Total ~2 hours
            
            if (mealElapsed < absorptionDuration) {
              const estimatedImpact = newSim.lastMealCarbs ? (newSim.lastMealCarbs / 10) : 30;
              const mealAbsorption = mealElapsed < mealPeakTime
                ? estimatedImpact * (mealElapsed / mealPeakTime)
                : estimatedImpact * (1 - (mealElapsed - mealPeakTime) / mealPeakTime);
              glucoseDelta += mealAbsorption / 60; // Per second
            }
          }

          // 3. Natural glucose decay (liver output, basal metabolism)
          glucoseDelta -= 0.5; // Slight natural decrease per second

          // 4. Stress effect
          glucoseDelta += (newProfile.stressLevel / 100) * 2; // Stress raises glucose

          // Apply delta
          const newGlucose = Math.max(40, Math.min(400, newProfile.currentGlucose + glucoseDelta));
          
          // Create new reading
          const latestReading = newProfile.recentReadings[newProfile.recentReadings.length - 1];
          const glucoseTrend = newGlucose > (latestReading?.value || 0) 
            ? (newGlucose - (latestReading?.value || 0) > 10 ? 'rising' : 'stable')
            : (latestReading?.value || 0) - newGlucose > 10 ? 'falling' : 'stable';

          return {
            ...newSim,
            lastMealTime: newSim.lastMealTime ? 
              (now - newSim.lastMealTime > 120 * 60 * 1000 ? undefined : newSim.lastMealTime)
              : undefined, // Clear meal if 2+ hours old
          };
        });

        // Update glucose
        newProfile.currentGlucose = newProfile.currentGlucose + (Math.random() - 0.5) * 0.5;
        
        // Decay active insulin
        newProfile.activeInsulin = newProfile.activeInsulin.filter(dose => {
          const elapsed = (Date.now() - dose.administeredAt) / 1000 / 60;
          return elapsed < dose.duration;
        });

        return newProfile;
      });
    }, 1000); // Update every second (accelerated by timeAccelerationFactor)

    return () => {
      if (glucoseSimulationRef.current) clearInterval(glucoseSimulationRef.current);
    };
  }, []);

  /**
   * Admin insulin dose
   */
  const administerInsulin = useCallback(
    (units: number, insulinType?: string) => {
      setHealthProfile(prev => ({
        ...prev,
        activeInsulin: [
          ...prev.activeInsulin,
          {
            type: (insulinType as any) || prev.insulinType,
            units,
            administeredAt: Date.now(),
            peakTime: (INSULIN_PROFILES[prev.insulinType] || INSULIN_PROFILES.rapid).peakMins,
            duration: (INSULIN_PROFILES[prev.insulinType] || INSULIN_PROFILES.rapid).durationMins * 60 * 1000,
          },
        ],
      }));
    },
    []
  );

  /**
   * Log a meal (affects glucose curve)
   * Food.estimatedGlucoseImpact becomes a carb estimate for absorption curve
   */
  const logMeal = useCallback((foodNutrients: FoodNutrients) => {
    // Convert glucose impact to carb grams for absorption simulation
    // estimatedGlucoseImpact of 20 mg/dL = ~5 grams carbs roughly
    const estimatedCarbs = foodNutrients.carbs || (foodNutrients.estimatedGlucoseImpact / 5);
    
    setHealthSimulation(prev => ({
      ...prev,
      lastMealTime: Date.now(),
      lastMealCarbs: estimatedCarbs,
      mealAbsorptionCurve: estimateAbsorptionRate(foodNutrients),
    }));
  }, []);

  /**
   * Determine meal absorption curve from food properties
   */
  const estimateAbsorptionRate = (foodNutrients: FoodNutrients): 'fast' | 'normal' | 'slow' => {
    // High GI = fast absorption
    if (foodNutrients.glycemicIndex > 70) return 'fast';
    // Low GI = slow absorption
    if (foodNutrients.glycemicIndex < 40) return 'slow';
    return 'normal';
  };

  /**
   * Update lifestyle factors
   */
  const updateLifestyle = useCallback(
    (updates: Partial<Pick<HealthProfile, 'sleepHours' | 'stressLevel' | 'exerciseMinutes'>>) => {
      setHealthProfile(prev => ({ ...prev, ...updates }));
    },
    []
  );

  /**
   * Get glucose zone classification
   */
  const getZone = useCallback(() => getGlucoseZone(healthProfile.currentGlucose), [healthProfile.currentGlucose]);

  /**
   * Get projected glucose (where it will be at end of current action)
   */
  const getProjectedGlucose = useCallback((minutesAhead: number = 30) => {
    let projected = healthProfile.currentGlucose;

    // Account for active insulin
    for (const dose of healthProfile.activeInsulin) {
      const timeFromAdministration = (Date.now() - dose.administeredAt) / 1000 / 60;
      const timeOfInterest = timeFromAdministration + minutesAhead;
      const profile = INSULIN_PROFILES[dose.type] || INSULIN_PROFILES.rapid;

      if (timeOfInterest < profile.durationMins) {
        const insulinEffect = dose.units * 50; // ISF
        let effect = 0;

        if (timeOfInterest < profile.peakMins) {
          effect = insulinEffect * (timeOfInterest / profile.peakMins);
        } else {
          const afterPeak = timeOfInterest - profile.peakMins;
          const remaining = profile.durationMins - profile.peakMins;
          effect = insulinEffect * (1 - afterPeak / remaining);
        }

        projected -= effect;
      }
    }

    return Math.max(40, Math.min(400, projected));
  }, [healthProfile.currentGlucose, healthProfile.activeInsulin]);

  return {
    healthProfile,
    healthSimulation,
    setScenario,
    startGlucoseSimulation,
    stopGlucoseSimulation: () => {
      if (glucoseSimulationRef.current) clearInterval(glucoseSimulationRef.current);
    },
    administerInsulin,
    logMeal,
    updateLifestyle,
    getZone,
    getProjectedGlucose,
  };
};
