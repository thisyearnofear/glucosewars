import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sword, UtensilsCrossed } from 'lucide-react-native';

interface PowerUpButtonsProps {
  exerciseCharges: number;
  rationCharges: number;
  onExercise: () => void;
  onRations: () => void;
}

export const PowerUpButtons: React.FC<PowerUpButtonsProps> = ({
  exerciseCharges,
  rationCharges,
  onExercise,
  onRations,
}) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row justify-between p-4 bg-gradient-to-t from-black/90 to-transparent">
      <TouchableOpacity
        onPress={onExercise}
        disabled={exerciseCharges === 0}
        className={`flex-1 mr-2 p-4 rounded-xl border-4 ${
          exerciseCharges > 0
            ? 'bg-blue-900 border-blue-500 active:bg-blue-800'
            : 'bg-gray-800 border-gray-600 opacity-50'
        }`}
        activeOpacity={0.8}
      >
        <View className="items-center">
          <Sword size={32} color={exerciseCharges > 0 ? '#3b82f6' : '#6b7280'} />
          <Text className="text-white text-xs font-bold mt-2 text-center">
            CALL TO EXERCISE
          </Text>
          <Text className="text-blue-300 text-xs mt-1">
            -50 Stability
          </Text>
          <View className="flex-row mt-2">
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                className={`w-3 h-3 rounded-full mx-1 ${
                  i < exerciseCharges ? 'bg-blue-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={onRations}
        disabled={rationCharges === 0}
        className={`flex-1 ml-2 p-4 rounded-xl border-4 ${
          rationCharges > 0
            ? 'bg-amber-900 border-amber-500 active:bg-amber-800'
            : 'bg-gray-800 border-gray-600 opacity-50'
        }`}
        activeOpacity={0.8}
      >
        <View className="items-center">
          <UtensilsCrossed size={32} color={rationCharges > 0 ? '#f59e0b' : '#6b7280'} />
          <Text className="text-white text-xs font-bold mt-2 text-center">
            EMERGENCY RATIONS
          </Text>
          <Text className="text-amber-300 text-xs mt-1">
            +25 Stability
          </Text>
          <View className="flex-row mt-2">
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                className={`w-3 h-3 rounded-full mx-1 ${
                  i < rationCharges ? 'bg-amber-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
