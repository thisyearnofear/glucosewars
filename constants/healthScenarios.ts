import { HealthScenario, HealthScenarioConfig, HealthProfile, GlucoseReading } from '@/types/health';

export const HEALTH_SCENARIOS: Record<HealthScenario, HealthScenarioConfig> = {
  recently_diagnosed: {
    id: 'recently_diagnosed',
    label: 'Recently Diagnosed',
    description: 'You were diagnosed with Type 2 diabetes 3 months ago. Still learning to manage.',
    diabetesType: 'type2',
    startingGlucose: 165,
    insulinRegimen: 'none',
    dailyInsulinUnits: 0,
    targetRange: { min: 70, max: 180 },
    emotionalContext: 'Feeling overwhelmed but determined. This game can help you understand how your body responds to food.',
  },
  well_controlled: {
    id: 'well_controlled',
    label: 'Well Controlled',
    description: 'You\'ve been managing Type 1 diabetes well for years. This is your routine.',
    diabetesType: 'type1',
    startingGlucose: 118,
    insulinRegimen: 'pump',
    dailyInsulinUnits: 35,
    targetRange: { min: 80, max: 160 },
    emotionalContext: 'You\'ve got this down. The game reflects your discipline. Can you maintain perfect balance?',
  },
  struggling: {
    id: 'struggling',
    label: 'Struggling',
    description: 'Type 1 for 5 years. Glucose control has been erratic lately.',
    diabetesType: 'type1',
    startingGlucose: 248,
    insulinRegimen: 'long_acting',
    dailyInsulinUnits: 40,
    targetRange: { min: 70, max: 180 },
    emotionalContext: 'High reading this morning. Stress has been getting to you. This game teaches you what actually helps.',
  },
  newly_aware: {
    id: 'newly_aware',
    label: 'Newly Aware',
    description: 'Prediabetic. Your doc says you can reverse this with lifestyle changes.',
    diabetesType: 'prediabetic',
    startingGlucose: 112,
    insulinRegimen: 'none',
    dailyInsulinUnits: 0,
    targetRange: { min: 70, max: 140 },
    emotionalContext: 'This is your wake-up call. Show yourself what\'s possible in the next 6 months.',
  },
};

/**
 * Generate mock glucose readings based on scenario
 * Simulates continuous glucose monitoring
 */
export const generateMockReadings = (
  scenario: HealthScenario,
  hoursBack: number = 24
): GlucoseReading[] => {
  const config = HEALTH_SCENARIOS[scenario];
  const readings: GlucoseReading[] = [];
  const now = Date.now();
  const readingIntervalMs = (60 * 60 * 1000) / 3; // 3 readings per hour (typical CGM frequency)

  // Generate realistic glucose curve
  for (let i = hoursBack * 3; i >= 0; i--) {
    const timestamp = now - i * readingIntervalMs;
    
    // Simulate meal patterns + sleep
    const hour = new Date(timestamp).getHours();
    
    let baseGlucose = config.startingGlucose;
    let variance = 0;
    
    // Sleep period (2am-7am) - typically lower
    if (hour >= 2 && hour < 7) {
      baseGlucose = config.startingGlucose - 15;
    }
    
    // Breakfast spike (7-9am)
    if (hour >= 7 && hour < 9) {
      variance = 25 + Math.random() * 30;
    }
    
    // Post-breakfast recovery (9-11am)
    if (hour >= 9 && hour < 11) {
      variance = 15 + Math.random() * 15;
    }
    
    // Lunch time (12-2pm)
    if (hour >= 12 && hour < 14) {
      variance = 20 + Math.random() * 25;
    }
    
    // Post-lunch (2-4pm)
    if (hour >= 14 && hour < 16) {
      variance = 10 + Math.random() * 10;
    }
    
    // Dinner (6-8pm)
    if (hour >= 18 && hour < 20) {
      variance = 30 + Math.random() * 20;
    }
    
    // Evening (8pm-midnight)
    if (hour >= 20 || hour < 2) {
      variance = 5 + Math.random() * 10;
    }
    
    const glucose = Math.round(baseGlucose + variance + (Math.random() - 0.5) * 10);
    
    // Determine trend
    let trend: GlucoseReading['trend'] = 'stable';
    if (i > 0) {
      const prevGlucose = readings[readings.length - 1]?.value || glucose;
      const delta = glucose - prevGlucose;
      if (delta > 20) trend = 'rapidly_rising';
      else if (delta > 10) trend = 'rising';
      else if (delta < -20) trend = 'rapidly_falling';
      else if (delta < -10) trend = 'falling';
      else trend = 'stable';
    }
    
    readings.push({
      value: Math.max(40, Math.min(400, glucose)), // Clamp to realistic range
      timestamp,
      source: 'simulated',
      trend,
      trendArrow: ((): '↑↑' | '↑' | '→' | '↓' | '↓↓' | undefined => {
        switch (trend) {
          case 'rapidly_rising': return '↑↑';
          case 'rising': return '↑';
          case 'stable': return '→';
          case 'falling': return '↓';
          case 'rapidly_falling': return '↓↓';
          default: return undefined;
        }
      })(),
    });
  }
  
  return readings.reverse();
};

/**
 * Create initial health profile from scenario
 */
export const createHealthProfile = (scenario: HealthScenario, name: string = 'Player'): HealthProfile => {
  const config = HEALTH_SCENARIOS[scenario];
  const recentReadings = generateMockReadings(scenario, 24);
  
  return {
    name,
    diabetesType: config.diabetesType,
    diagnosedYear: config.diabetesType === 'type1'
      ? new Date().getFullYear() - 5
      : new Date().getFullYear() - 1,

    currentGlucose: recentReadings[recentReadings.length - 1]?.value || config.startingGlucose,
    recentReadings: recentReadings.slice(-6), // Last 2 hours
    activeInsulin: [],

    targetRange: config.targetRange,
    insulinSensitivityFactor: 50, // 1 unit = 50 mg/dL drop
    carbsToInsulinRatio: 10, // 1 unit per 10g carbs

    insulinType: config.insulinRegimen,
    basalRate: config.insulinRegimen === 'pump' ? 1.5 : undefined,

    sleepHours: 7,
    stressLevel: 45,
    exerciseMinutes: 30,

    dailyHistory: [],

    // Default privacy settings
    privacySettings: {
      mode: 'standard',
      encryptHealthData: false,
      glucoseLevels: 'public',
      insulinDoses: 'public',
      achievements: 'public',
      gameStats: 'public',
      healthProfile: 'public',
    },
  };
};

/**
 * Glucose zone classifications
 */
export const GLUCOSE_ZONES = {
  critical_low: { min: 0, max: 54, label: 'Critical Low', color: '#ef4444', emoji: '🚨' },
  low: { min: 55, max: 69, label: 'Low', color: '#f97316', emoji: '⚠️' },
  in_range: { min: 70, max: 180, label: 'In Range', color: '#22c55e', emoji: '✓' },
  high: { min: 181, max: 240, label: 'High', color: '#eab308', emoji: '⚠️' },
  critical_high: { min: 241, max: 400, label: 'Critical High', color: '#dc2626', emoji: '🚨' },
};

export const getGlucoseZone = (glucose: number) => {
  for (const [key, zone] of Object.entries(GLUCOSE_ZONES)) {
    if (glucose >= zone.min && glucose <= zone.max) {
      return zone;
    }
  }
  return GLUCOSE_ZONES.critical_high;
};

/**
 * Insulin mechanics
 */
export const INSULIN_PROFILES = {
  rapid: {
    name: 'Rapid-Acting (Humalog, Novolog)',
    onsetMins: 15,
    peakMins: 60,
    durationMins: 300, // 5 hours
    glucoseDrop: 'sharp',
  },
  intermediate: {
    name: 'Intermediate-Acting (NPH)',
    onsetMins: 60,
    peakMins: 240,
    durationMins: 600, // 10 hours
    glucoseDrop: 'gradual',
  },
  long_acting: {
    name: 'Long-Acting (Lantus, Levemir)',
    onsetMins: 120,
    peakMins: 480,
    durationMins: 1440, // 24 hours
    glucoseDrop: 'sustained',
  },
  pump: {
    name: 'Insulin Pump',
    onsetMins: 10,
    peakMins: 45,
    durationMins: 240,
    glucoseDrop: 'controlled',
  },
  none: {
    name: 'No Insulin',
    onsetMins: 0,
    peakMins: 0,
    durationMins: 0,
    glucoseDrop: 'none',
  },
};
