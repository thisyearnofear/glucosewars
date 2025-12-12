import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface NarratorCalloutProps {
  message: string;
  type?: 'announcement' | 'warning' | 'combo';
  visible: boolean;
}

export const NarratorCallout: React.FC<NarratorCalloutProps> = ({
  message,
  type = 'announcement',
  visible,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 300 })
      );
    }
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  if (!visible) return null;
  
  const getColors = () => {
    switch (type) {
      case 'warning':
        return 'bg-red-900 border-red-500';
      case 'combo':
        return 'bg-purple-900 border-purple-500';
      default:
        return 'bg-amber-900 border-amber-500';
    }
  };
  
  return (
    <View className="absolute inset-0 items-center justify-center pointer-events-none z-50">
      <Animated.View 
        style={animatedStyle}
        className={`px-8 py-4 rounded-xl border-4 ${getColors()} shadow-2xl`}
      >
        <Text className="text-white text-2xl font-bold text-center tracking-wider">
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};
