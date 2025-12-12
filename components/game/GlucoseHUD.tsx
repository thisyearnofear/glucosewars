import React from 'react';
import { View, Text } from 'react-native';

interface GlucoseHUDProps {
  score: number;
  glucoseLevel: number;
  timer: number;
  comboCount: number;
}

export const GlucoseHUD: React.FC<GlucoseHUDProps> = ({
  score,
  glucoseLevel,
  timer,
  comboCount,
}) => {
  const getGlucoseColor = () => {
    if (glucoseLevel >= 40 && glucoseLevel <= 60) return '#10b981';
    if (glucoseLevel >= 76 || glucoseLevel <= 24) return '#ef4444';
    return '#f59e0b';
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-black/80 border-t-2 border-purple-600">
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Score */}
        <View className="flex-1 items-center">
          <Text className="text-purple-300 text-xs font-bold">SCORE</Text>
          <Text className="text-white text-xl font-bold">{score}</Text>
        </View>

        {/* Glucose Level */}
        <View className="flex-2 items-center px-4">
          <Text className="text-purple-300 text-xs font-bold mb-1">GLUCOSE</Text>
          <View className="w-48 h-6 bg-gray-800 rounded-full border-2 border-purple-700 overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${glucoseLevel}%`,
                backgroundColor: getGlucoseColor(),
              }}
            />
          </View>
          <Text className="text-white text-xs mt-1" style={{ color: getGlucoseColor() }}>
            {Math.round(glucoseLevel)}%
          </Text>
        </View>

        {/* Timer */}
        <View className="flex-1 items-center">
          <Text className="text-purple-300 text-xs font-bold">TIME</Text>
          <Text className={`text-2xl font-bold ${timer <= 10 ? 'text-red-500' : 'text-white'}`}>
            {timer}s
          </Text>
        </View>
      </View>

      {/* Combo indicator */}
      {comboCount > 0 && (
        <View className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-500 px-4 py-2 rounded-full border-2 border-yellow-700">
          <Text className="text-black text-lg font-bold">
            {comboCount}x COMBO!
          </Text>
        </View>
      )}
    </View>
  );
};
