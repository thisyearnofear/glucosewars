import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { ControlMode, UserMode } from '@/types/game';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { USER_MODE_CONFIGS } from '@/constants/userModes';
import { PrivacyToggle } from '@/components/PrivacyToggle';
import { PrivacySettingsModal } from '@/components/PrivacySettings';

const { width } = Dimensions.get('window');

interface MainMenuProps {
  onStartGame: (controlMode: ControlMode) => void;
  onUserModeSelected?: (mode: string) => void;
  userModeSelected?: boolean;
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

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onUserModeSelected, userModeSelected }) => {
  const [selectedMode, setSelectedMode] = useState<ControlMode>('swipe');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { progress, setUserMode, setPrivacyMode, updatePrivacySettings } = usePlayerProgress();
  const [showUserModeSelector, setShowUserModeSelector] = useState(userModeSelected === false);

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

  // Get player progress info for display
  const tierNames = {
    tier1: 'Tutorial',
    tier2: 'Challenge 1',
    tier3: 'Challenge 2',
  };

  const progressInfo = progress.maxTierUnlocked !== 'tier1' ? (
    <View className="bg-black/60 p-3 rounded-xl border border-amber-700 mb-4 w-full max-w-sm">
      <Text className="text-amber-400 text-xs font-bold text-center mb-1">
        🏆 YOUR PROGRESS
      </Text>
      <Text className="text-white text-sm text-center">
        Unlocked: {tierNames[progress.maxTierUnlocked]}
      </Text>
      {progress.bestScore > 0 && (
        <Text className="text-green-400 text-xs text-center mt-1">
          Best Score: {progress.bestScore}
        </Text>
      )}
    </View>
  ) : null;

  if (showUserModeSelector) {
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

        {/* User Mode Selector */}
        <View className="items-center z-10 px-6">
          {/* Title */}
          <View className="items-center mb-8">
            <Text className="text-5xl mb-3">🎮</Text>
            <Text className="text-white text-3xl font-bold text-center">
              Choose Your Role
            </Text>
            <Text className="text-purple-300 text-sm text-center mt-2">
              Personalize your glucose journey
            </Text>
          </View>

          {/* Mode Options */}
          <View className="w-full max-w-sm space-y-3">
            {(Object.keys(USER_MODE_CONFIGS) as UserMode[]).map((mode) => {
              const config = USER_MODE_CONFIGS[mode];
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => {
                    setUserMode(mode);
                    setShowUserModeSelector(false);
                    onUserModeSelected?.(mode);
                  }}
                  className="bg-black/60 p-4 rounded-xl border-2 border-purple-700 active:bg-purple-900/40"
                >
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-3">{config.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-white text-base font-bold">
                        {config.name}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        {config.description}
                      </Text>
                    </View>
                    <Text className="text-purple-400 text-lg">›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-gray-600 text-xs text-center mt-8 max-w-sm">
            💡 You can change this anytime in settings
          </Text>
        </View>
      </View>
    );
  }

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

        {/* Progress Info (only for returning players) */}
        {progressInfo}

        {/* Privacy Controls */}
        <View className="bg-black/60 p-3 rounded-xl border border-cyan-700 mb-4 w-full max-w-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-cyan-400 text-xs font-bold mb-1">
                🔐 PRIVACY
              </Text>
              <PrivacyToggle
                currentMode={progress.privacyMode}
                onToggle={(mode) => {
                  setPrivacyMode(mode);
                }}
              />
            </View>
            <TouchableOpacity
              className="p-2 ml-2"
              onPress={() => setShowPrivacySettings(true)}
            >
              <Text className="text-cyan-400 text-2xl">⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Control Mode Selector */}
        <View className="bg-black/60 p-3 rounded-2xl border-2 border-purple-700 mb-4 w-full max-w-sm">
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
            onPress={() => onStartGame(selectedMode)}
            className={`px-10 py-4 rounded-2xl border-4 bg-amber-600 border-amber-400`}
            style={{
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 10,
            }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">⚔️</Text>
              <Text className="text-white text-xl font-bold">
                START BATTLE
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

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        settings={progress.privacySettings || {
          mode: 'standard',
          encryptHealthData: false,
          glucoseLevels: 'public',
          insulinDoses: 'public',
          achievements: 'public',
          gameStats: 'public',
          healthProfile: 'public',
        }}
        onSave={(settings) => {
          updatePrivacySettings(settings);
          setShowPrivacySettings(false);
        }}
        onClose={() => setShowPrivacySettings(false)}
        visible={showPrivacySettings}
      />
    </View>
  );
};