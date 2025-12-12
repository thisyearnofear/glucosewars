import React from 'react';
import { View, Text } from 'react-native';
import { getStabilityColor, getStabilityZone } from '@/utils/gameLogic';

interface RealmStabilityMeterProps {
  stability: number;
}

export const RealmStabilityMeter: React.FC<RealmStabilityMeterProps> = ({ stability }) => {
  const zone = getStabilityZone(stability);
  const color = getStabilityColor(stability);
  
  const getZoneLabel = () => {
    switch (zone) {
      case 'balanced': return 'BALANCED';
      case 'warning': return 'WARNING';
      case 'critical-high': return 'CRITICAL HIGH';
      case 'critical-low': return 'CRITICAL LOW';
    }
  };
  
  return (
    <View className="w-full px-4 py-3 bg-black/80 border-b-2 border-amber-600">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-amber-200 text-xs font-bold tracking-wider">
          REALM STABILITY
        </Text>
        <Text className="text-white text-xs font-bold" style={{ color }}>
          {getZoneLabel()}
        </Text>
      </View>
      
      <View className="h-6 bg-gray-800 rounded-full border-2 border-amber-700 overflow-hidden">
        <View 
          className="h-full rounded-full transition-all"
          style={{ 
            width: `${stability}%`,
            backgroundColor: color,
          }}
        />
      </View>
      
      <View className="flex-row justify-between mt-1">
        <Text className="text-cyan-400 text-xs">0%</Text>
        <Text className="text-amber-200 text-xs">{Math.round(stability)}%</Text>
        <Text className="text-red-400 text-xs">100%</Text>
      </View>
    </View>
  );
};
