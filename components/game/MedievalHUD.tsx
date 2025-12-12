import React from 'react';
import { View, Text } from 'react-native';

interface MedievalHUDProps {
  battlePoints: number;
  timer: number;
  comboCount: number;
  comboTitle?: string;
}

export const MedievalHUD: React.FC<MedievalHUDProps> = ({
  battlePoints,
  timer,
  comboCount,
  comboTitle,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const isLowTime = timer <= 10;
  
  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-black/80 border-b-2 border-amber-600">
      <View className="flex-1">
        <Text className="text-amber-200 text-xs font-bold tracking-wider">
          BATTLE POINTS
        </Text>
        <Text className="text-white text-2xl font-bold">
          {battlePoints.toLocaleString()}
        </Text>
      </View>
      
      <View className="items-center px-4">
        <Text 
          className={`text-3xl font-bold ${isLowTime ? 'text-red-500' : 'text-amber-200'}`}
        >
          {formatTime(timer)}
        </Text>
        {isLowTime && (
          <Text className="text-red-500 text-xs font-bold animate-pulse">
            FINAL WAVE!
          </Text>
        )}
      </View>
      
      <View className="flex-1 items-end">
        {comboCount > 0 && (
          <>
            <Text className="text-amber-200 text-xs font-bold tracking-wider">
              COMBO
            </Text>
            <Text className="text-yellow-400 text-2xl font-bold">
              {comboCount}x
            </Text>
            {comboTitle && (
              <Text className="text-purple-400 text-xs font-bold">
                {comboTitle}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};
