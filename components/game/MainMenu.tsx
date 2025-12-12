import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { ControlMode, GameMode } from '@/types/game';

const { width } = Dimensions.get('window');

interface MainMenuProps {
  onStartBattle: (controlMode: ControlMode, gameMode: GameMode) => void;
}

const FloatingFood: React.FC<{ emoji: string; delay: number; isAlly: boolean }> = ({ emoji, delay, isAlly }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      translateY.setValue(-50);
      translateX.setValue(40 + Math.random() * (width - 80));
      opacity.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.6, duration: 500, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 600, duration: 8000, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ translateX }, { translateY }],
        opacity,
      }}
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center border-2"
        style={{ 
          borderColor: isAlly ? '#22c55e' : '#ef4444',
          backgroundColor: isAlly ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        }}
      >
        <Text className="text-2xl">{emoji}</Text>
      </View>
    </Animated.View>
  );
};

export const MainMenu: React.FC<MainMenuProps> = ({ onStartBattle }) => {
  const [selectedMode, setSelectedMode] = useState<ControlMode>('swipe');
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('classic');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for start button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const floatingFoods = [
    { emoji: '🥦', isAlly: true },
    { emoji: '🍩', isAlly: false },
    { emoji: '🥕', isAlly: true },
    { emoji: '🍬', isAlly: false },
    { emoji: '🐟', isAlly: true },
    { emoji: '🍔', isAlly: false },
    { emoji: '🍎', isAlly: true },
    { emoji: '🥤', isAlly: false },
  ];

  return (
    <View className="flex-1 bg-[#0f0f1a] items-center justify-center">
      {/* Animated background foods */}
      {floatingFoods.map((food, i) => (
        <FloatingFood 
          key={i} 
          emoji={food.emoji} 
          delay={i * 1000} 
          isAlly={food.isAlly}
        />
      ))}

      {/* Dark overlay */}
      <View className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-black/50" />

      {/* Content */}
      <View className="items-center z-10 px-6">
        {/* Title */}
        <View className="items-center mb-6">
          <Text className="text-6xl mb-2">🏰</Text>
          <Text className="text-amber-400 text-4xl font-bold text-center tracking-wider">
            GLUCOSE
          </Text>
          <Text className="text-white text-4xl font-bold text-center tracking-wider">
            WARS
          </Text>
          <Text className="text-purple-300 text-base text-center italic mt-1">
            Defend Your Kingdom
          </Text>
        </View>

        {/* Combined Mode Selector */}
        <View className="bg-black/60 p-3 rounded-2xl border-2 border-purple-700 mb-4 w-full max-w-sm">
          <Text className="text-purple-400 text-xs font-bold text-center mb-2">
            🎯 GAME MODE
          </Text>
          
          <View className="flex-row space-x-2 mb-3">
            <TouchableOpacity
              onPress={() => setSelectedGameMode('classic')}
              className={`flex-1 p-2 rounded-lg border ${
                selectedGameMode === 'classic' 
                  ? 'bg-amber-600/30 border-amber-500' 
                  : 'bg-gray-800/50 border-gray-600'
              }`}
            >
              <Text className="text-xl text-center">⚔️</Text>
              <Text className={`text-center font-bold text-xs ${
                selectedGameMode === 'classic' ? 'text-amber-400' : 'text-gray-400'
              }`}>
                CLASSIC
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedGameMode('life')}
              className={`flex-1 p-2 rounded-lg border ${
                selectedGameMode === 'life' 
                  ? 'bg-purple-600/30 border-purple-500' 
                  : 'bg-gray-800/50 border-gray-600'
              }`}
            >
              <Text className="text-xl text-center">🌅</Text>
              <Text className={`text-center font-bold text-xs ${
                selectedGameMode === 'life' ? 'text-purple-400' : 'text-gray-400'
              }`}>
                LIFE MODE
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text className="text-amber-400 text-xs font-bold text-center mb-2">
            🎮 CONTROLS
          </Text>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setSelectedMode('swipe')}
              className={`flex-1 p-2 rounded-lg border ${
                selectedMode === 'swipe' 
                  ? 'bg-green-600/30 border-green-500' 
                  : 'bg-gray-800/50 border-gray-600'
              }`}
            >
              <Text className="text-xl text-center">👆</Text>
              <Text className={`text-center font-bold text-xs ${
                selectedMode === 'swipe' ? 'text-green-400' : 'text-gray-400'
              }`}>
                SWIPE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedMode('tap')}
              className={`flex-1 p-2 rounded-lg border ${
                selectedMode === 'tap' 
                  ? 'bg-blue-600/30 border-blue-500' 
                  : 'bg-gray-800/50 border-gray-600'
              }`}
            >
              <Text className="text-xl text-center">🖱️</Text>
              <Text className={`text-center font-bold text-xs ${
                selectedMode === 'tap' ? 'text-blue-400' : 'text-gray-400'
              }`}>
                TAP
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick tips */}
        <View className="bg-black/60 p-3 rounded-2xl border-2 border-amber-700 mb-4 w-full max-w-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="text-lg mr-1">👆</Text>
              <Text className="text-green-400 text-xs font-bold">RALLY</Text>
              <Text className="text-gray-400 text-xs ml-1">🥦🥕</Text>
            </View>
            <View className="flex-row items-center flex-1">
              <Text className="text-lg mr-1">👇</Text>
              <Text className="text-red-400 text-xs font-bold">BANISH</Text>
              <Text className="text-gray-400 text-xs ml-1">🍩🍔</Text>
            </View>
          </View>
        </View>

        {/* Start button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={() => onStartBattle(selectedMode, selectedGameMode)}
            className={`px-10 py-4 rounded-2xl border-4 ${
              selectedGameMode === 'life' 
                ? 'bg-purple-600 border-purple-400' 
                : 'bg-amber-600 border-amber-400'
            }`}
            style={{
              shadowColor: selectedGameMode === 'life' ? '#a855f7' : '#f59e0b',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 10,
            }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">{selectedGameMode === 'life' ? '🌅' : '⚔️'}</Text>
              <Text className="text-white text-xl font-bold">
                {selectedGameMode === 'life' ? 'START DAY' : 'START BATTLE'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Tip */}
        <View className="mt-3 px-4">
          <Text className="text-purple-400 text-xs text-center">
            💡 Chain correct actions for COMBO bonuses!
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="absolute bottom-4">
        <Text className="text-gray-600 text-xs text-center">
          A 60-Second Medieval Battle
        </Text>
      </View>
    </View>
  );
};
