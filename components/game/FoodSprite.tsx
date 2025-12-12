import React from 'react';
import { View, Text } from 'react-native';
import { FoodUnit } from '@/types/game';
import { FOOD_DEFINITIONS } from '@/constants/gameConfig';

interface FoodSpriteProps {
  food: FoodUnit;
}

export const FoodSprite: React.FC<FoodSpriteProps> = ({ food }) => {
  const definition = FOOD_DEFINITIONS.find(d => d.type === food.type);
  
  return (
    <View
      className="absolute items-center justify-center"
      style={{
        left: food.position.x,
        top: food.position.y,
        transform: [{ translateX: -25 }, { translateY: -25 }],
      }}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center border-2 shadow-lg"
        style={{
          backgroundColor: definition?.color + '40',
          borderColor: definition?.color,
        }}
      >
        <Text className="text-3xl">{food.sprite}</Text>
      </View>
      <View 
        className="mt-1 px-2 py-0.5 rounded"
        style={{ backgroundColor: definition?.color + 'CC' }}
      >
        <Text className="text-white text-xs font-bold text-center">
          {food.name}
        </Text>
      </View>
    </View>
  );
};
