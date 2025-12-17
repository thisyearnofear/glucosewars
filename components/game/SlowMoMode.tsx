import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { GameMode } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width * 0.9, 400);

interface SlowMoModeProps {
  onStartGame: (mode: GameMode) => void;
  onBack: () => void;
}

export const SlowMoMode: React.FC<SlowMoModeProps> = ({ onStartGame, onBack }) => {
  const { progress } = usePlayerProgress();
  const { healthProfile } = useHealthProfile(progress.userMode || undefined);
  const [phase, setPhase] = useState<'morning' | 'simulation' | 'evening'>('morning');
  const [plannedMeals, setPlannedMeals] = useState<any[]>([]);
  const [actualMeals, setActualMeals] = useState<any[]>([]);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  
  // Sample meal data for prototyping
  const mealOptions = [
    { id: 'breakfast1', name: 'Oatmeal with Berries', type: 'healthy', glucoseImpact: 40 },
    { id: 'breakfast2', name: 'Pancakes with Syrup', type: 'unhealthy', glucoseImpact: 80 },
    { id: 'lunch1', name: 'Grilled Chicken Salad', type: 'healthy', glucoseImpact: 30 },
    { id: 'lunch2', name: 'Burger and Fries', type: 'unhealthy', glucoseImpact: 90 },
    { id: 'dinner1', name: 'Baked Salmon with Veggies', type: 'healthy', glucoseImpact: 25 },
    { id: 'dinner2', name: 'Pasta Carbonara', type: 'unhealthy', glucoseImpact: 75 },
  ];

  const handlePlanMeal = (mealType: string, mealId: string) => {
    const meal = mealOptions.find(m => m.id === mealId);
    if (meal) {
      setPlannedMeals(prev => [...prev.filter(m => m.mealType !== mealType), { ...meal, mealType }]);
    }
  };

  const handleActualMeal = (mealType: string, mealId: string) => {
    const meal = mealOptions.find(m => m.id === mealId);
    if (meal) {
      setActualMeals(prev => [...prev.filter(m => m.mealType !== mealType), { ...meal, mealType }]);
    }
  };

  const simulateGlucoseImpact = () => {
    // Calculate total predicted glucose impact
    const totalImpact = plannedMeals.reduce((sum, meal) => sum + meal.glucoseImpact, 0);
    const averageImpact = totalImpact / plannedMeals.length;
    
    // Generate simulation data
    const simulation = {
      predictedCurve: generateGlucoseCurve(plannedMeals),
      totalImpact,
      averageImpact,
      insights: getEducationalInsights(plannedMeals),
    };
    
    setSimulationResults(simulation);
    setPhase('simulation');
  };

  const compareWithReality = () => {
    // Calculate actual vs predicted
    const predictedImpact = plannedMeals.reduce((sum, meal) => sum + meal.glucoseImpact, 0);
    const actualImpact = actualMeals.reduce((sum, meal) => sum + meal.glucoseImpact, 0);
    
    const comparison = {
      predictedImpact,
      actualImpact,
      difference: actualImpact - predictedImpact,
      actualCurve: generateGlucoseCurve(actualMeals),
      insights: getComparisonInsights(plannedMeals, actualMeals),
    };
    
    setSimulationResults(prev => ({ ...prev, comparison }));
    setPhase('evening');
  };

  const generateGlucoseCurve = (meals: any[]) => {
    // Simple glucose curve simulation
    return meals.map((meal, index) => ({
      time: index * 2 + 8, // 8am, 10am, 12pm, etc.
      glucoseLevel: 80 + meal.glucoseImpact * 0.8,
      meal: meal.name,
    }));
  };

  const getEducationalInsights = (meals: any[]) => {
    const healthyCount = meals.filter(m => m.type === 'healthy').length;
    const total = meals.length;
    
    if (healthyCount === total) {
      return [
        'Excellent meal choices! This balanced approach helps maintain stable glucose levels.',
        'Your predicted glucose curve shows minimal spikes, which is ideal for diabetes management.',
        'Consider adding light exercise after meals to further improve glucose control.'
      ];
    } else if (healthyCount >= total / 2) {
      return [
        'Good balance of meals. You have some healthier choices mixed with higher-impact options.',
        'The predicted spikes can be managed with proper insulin timing or portion control.',
        'Try replacing one higher-impact meal with a healthier alternative for better stability.'
      ];
    } else {
      return [
        'Your meal plan includes several high-impact choices that may cause significant glucose spikes.',
        'Consider balancing with lower-glycemic foods to reduce overall impact.',
        'Small changes like adding protein or fiber can help mitigate glucose spikes.'
      ];
    }
  };

  const getComparisonInsights = (planned: any[], actual: any[]) => {
    const plannedHealthy = planned.filter(m => m.type === 'healthy').length;
    const actualHealthy = actual.filter(m => m.type === 'healthy').length;
    
    if (actualHealthy > plannedHealthy) {
      return [
        'Great job making healthier choices than planned!',
        'This shows good decision-making in real-world situations.',
        'Keep up this positive trend for better long-term glucose control.'
      ];
    } else if (actualHealthy === plannedHealthy) {
      return [
        'You stuck to your planned meal choices - consistency is key!',
        'This predictable pattern helps with glucose management planning.',
        'Consider experimenting with one healthier swap next time.'
      ];
    } else {
      return [
        'Your actual choices had higher glucose impact than planned.',
        'This is a learning opportunity to understand real-world challenges.',
        'Next time, try to identify triggers that led to different choices.'
      ];
    }
  };

  return (
    <View className="flex-1 bg-[#0a0a12]">
      {/* Header */}
      <View className="w-full flex-row items-center justify-between p-4 absolute top-0 z-10">
        <TouchableOpacity onPress={onBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        <Text className="text-amber-400 text-lg font-bold">SLOW MO MODE</Text>
        <View className="w-8" /> {/* Spacer for symmetry */}
      </View>

      {/* Phase Content */}
      <ScrollView className="flex-1 pt-16 pb-20">
        {/* Morning Planning Phase */}
        {phase === 'morning' && (
          <View className="items-center px-4">
            <Text className="text-5xl mb-4">☀️</Text>
            <Text className="text-amber-400 text-3xl font-bold mb-2">MORNING PLANNING</Text>
            <Text className="text-white text-xl text-center mb-6">
              Plan your meals for today
            </Text>

            {/* Meal Planning */}
            <View className="w-full max-w-[350px] mb-6">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                const planned = plannedMeals.find(m => m.mealType === mealType);
                return (
                  <View key={mealType} className="mb-4">
                    <Text className="text-purple-300 text-sm font-bold mb-2">
                      {mealType.toUpperCase()}
                    </Text>
                    <View className="flex-row gap-2">
                      {mealOptions.filter(m => m.id.includes(mealType)).map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          onPress={() => handlePlanMeal(mealType, option.id)}
                          className={`flex-1 p-3 rounded-lg border ${
                            planned?.id === option.id
                              ? 'bg-green-600/30 border-green-400'
                              : 'bg-black/40 border-purple-700'
                          }`}
                        >
                          <Text className="text-white text-xs text-center mb-1">
                            {option.name}
                          </Text>
                          <Text className={`text-xs text-center ${
                            option.type === 'healthy' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {option.type === 'healthy' ? 'Healthy' : 'High Impact'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Educational Content */}
            <View className="bg-black/60 p-4 rounded-xl border border-cyan-700 mb-6 w-full max-w-[350px]">
              <Text className="text-cyan-400 text-xs font-bold mb-2">📚 LEARNING TIP</Text>
              <Text className="text-white text-sm">
                Planning meals helps you anticipate glucose impacts and make informed decisions throughout the day.
              </Text>
            </View>

            {/* Simulation Button */}
            {plannedMeals.length === 3 && (
              <TouchableOpacity
                onPress={simulateGlucoseImpact}
                className="px-8 py-4 rounded-2xl border-4 bg-amber-600 border-amber-400 w-full max-w-[300px]"
                style={{
                  shadowColor: '#f59e0b',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                <Text className="text-white text-base font-bold text-center">
                  SIMULATE GLUCOSE IMPACT
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Simulation Phase */}
        {phase === 'simulation' && simulationResults && (
          <View className="items-center px-4">
            <Text className="text-5xl mb-4">🧪</Text>
            <Text className="text-amber-400 text-3xl font-bold mb-2">SIMULATION</Text>
            <Text className="text-white text-xl text-center mb-6">
              Predicted glucose impact
            </Text>

            {/* Glucose Curve Visualization */}
            <View className="bg-black/60 p-4 rounded-xl border border-purple-700 mb-6 w-full max-w-[350px]">
              <Text className="text-purple-300 text-xs font-bold mb-3">PREDICTED GLUCOSE CURVE</Text>
              {simulationResults.predictedCurve.map((point: any, index: number) => (
                <View key={index} className="flex-row items-center mb-2">
                  <Text className="text-gray-400 text-xs w-16">{point.time}:00</Text>
                  <View className="flex-1 h-2 bg-gray-700 rounded mr-2">
                    <View 
                      className="h-2 bg-amber-400 rounded"
                      style={{ width: `${(point.glucoseLevel - 80) / 2}%` }}
                    />
                  </View>
                  <Text className="text-white text-xs w-12">{point.glucoseLevel} mg/dL</Text>
                </View>
              ))}
              <Text className="text-green-300 text-xs mt-2">
                📊 Average predicted impact: {simulationResults.averageImpact.toFixed(1)} mg/dL
              </Text>
            </View>

            {/* Educational Insights */}
            <View className="bg-black/60 p-4 rounded-xl border border-cyan-700 mb-6 w-full max-w-[350px]">
              <Text className="text-cyan-400 text-xs font-bold mb-2">🎓 EDUCATIONAL INSIGHTS</Text>
              {simulationResults.insights.map((insight: string, index: number) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-cyan-300 mr-2">•</Text>
                  <Text className="text-white text-xs flex-1">{insight}</Text>
                </View>
              ))}
            </View>

            {/* Interactive Adjustments */}
            <View className="bg-black/60 p-4 rounded-xl border border-amber-700 mb-6 w-full max-w-[350px]">
              <Text className="text-amber-400 text-xs font-bold mb-3">🔄 WHAT IF SCENARIOS</Text>
              <View className="space-y-2">
                <TouchableOpacity className="p-2 bg-black/40 rounded border border-amber-600">
                  <Text className="text-amber-300 text-xs text-center">+ Add 15min Exercise</Text>
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-black/40 rounded border border-green-600">
                  <Text className="text-green-300 text-xs text-center">+ Replace One Meal</Text>
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-black/40 rounded border border-blue-600">
                  <Text className="text-blue-300 text-xs text-center">+ Adjust Portion Size</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Evening Reflection Button */}
            <TouchableOpacity
              onPress={() => setPhase('evening')}
              className="px-8 py-4 rounded-2xl border-4 bg-purple-600 border-purple-400 w-full max-w-[300px]"
              style={{
                shadowColor: '#a855f7',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text className="text-white text-base font-bold text-center">
                PROCEED TO EVENING REFLECTION
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Evening Reflection Phase */}
        {phase === 'evening' && simulationResults?.comparison && (
          <View className="items-center px-4">
            <Text className="text-5xl mb-4">🌙</Text>
            <Text className="text-amber-400 text-3xl font-bold mb-2">EVENING REFLECTION</Text>
            <Text className="text-white text-xl text-center mb-6">
              Compare prediction with reality
            </Text>

            {/* Comparison Summary */}
            <View className="bg-black/60 p-4 rounded-xl border border-cyan-700 mb-6 w-full max-w-[350px]">
              <Text className="text-cyan-400 text-xs font-bold mb-3">COMPARISON SUMMARY</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-xs">Predicted Impact:</Text>
                <Text className="text-white text-xs">{simulationResults.comparison.predictedImpact} mg/dL</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-xs">Actual Impact:</Text>
                <Text className="text-white text-xs">{simulationResults.comparison.actualImpact} mg/dL</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-400 text-xs">Difference:</Text>
                <Text className={`text-xs ${
                  simulationResults.comparison.difference < 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {simulationResults.comparison.difference < 0 ? '↓' : '↑'} {Math.abs(simulationResults.comparison.difference)} mg/dL
                </Text>
              </View>
              <Text className={`text-xs text-center ${
                Math.abs(simulationResults.comparison.difference) < 20 ? 'text-green-400' : 'text-amber-400'
              }`}>
                {Math.abs(simulationResults.comparison.difference) < 20 ? 
                  'Great consistency! ✅' : 
                  'Learning opportunity 📚'
                }
              </Text>
            </View>

            {/* Actual Meal Input */}
            {actualMeals.length < 3 && (
              <View className="w-full max-w-[350px] mb-6">
                <Text className="text-purple-300 text-sm font-bold mb-3 text-center">
                  WHAT DID YOU ACTUALLY EAT?
                </Text>
                {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                  const actual = actualMeals.find(m => m.mealType === mealType);
                  return (
                    <View key={mealType} className="mb-3">
                      <Text className="text-white text-xs mb-1">
                        {mealType.toUpperCase()}:
                      </Text>
                      <View className="flex-row gap-1">
                        {mealOptions.filter(m => m.id.includes(mealType)).map((option) => (
                          <TouchableOpacity
                            key={option.id}
                            onPress={() => handleActualMeal(mealType, option.id)}
                            className={`flex-1 p-2 rounded border ${
                              actual?.id === option.id
                                ? 'bg-blue-600/30 border-blue-400'
                                : 'bg-black/40 border-gray-600'
                            }`}
                          >
                            <Text className="text-white text-xs text-center">
                              {option.name.split(' ')[0]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Comparison Insights */}
            <View className="bg-black/60 p-4 rounded-xl border border-green-700 mb-6 w-full max-w-[350px]">
              <Text className="text-green-400 text-xs font-bold mb-2">🎓 REFLECTION INSIGHTS</Text>
              {simulationResults.comparison.insights.map((insight: string, index: number) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-green-300 mr-2">•</Text>
                  <Text className="text-white text-xs flex-1">{insight}</Text>
                </View>
              ))}
            </View>

            {/* Educational Takeaways */}
            <View className="bg-black/60 p-4 rounded-xl border border-amber-700 mb-6 w-full max-w-[350px]">
              <Text className="text-amber-400 text-xs font-bold mb-2">📚 KEY TAKEAWAYS</Text>
              <View className="flex-row items-start mb-2">
                <Text className="text-amber-300 mr-2">•</Text>
                <Text className="text-white text-xs flex-1">
                  Planning helps anticipate glucose impacts throughout the day
                </Text>
              </View>
              <View className="flex-row items-start mb-2">
                <Text className="text-amber-300 mr-2">•</Text>
                <Text className="text-white text-xs flex-1">
                  Real-world choices may differ from plans - that's okay!
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-amber-300 mr-2">•</Text>
                <Text className="text-white text-xs flex-1">
                  Use these insights to make better choices tomorrow
                </Text>
              </View>
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              onPress={() => onStartGame('slowmo')}
              className="px-8 py-4 rounded-2xl border-4 bg-green-600 border-green-400 w-full max-w-[300px]"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text className="text-white text-base font-bold text-center">
                COMPLETE SLOW MO MODE
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};