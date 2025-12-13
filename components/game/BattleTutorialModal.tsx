import React, { useEffect } from 'react';
import { View, Text, Animated, Modal, TouchableOpacity } from 'react-native';
import { FoodDefinition } from '@/types/game';

interface BattleTutorialModalProps {
  visible: boolean;
  food?: FoodDefinition;
  onDismiss: () => void;
  controlMode: 'swipe' | 'tap';
}

export const BattleTutorialModal: React.FC<BattleTutorialModalProps> = ({
  visible,
  food,
  onDismiss,
  controlMode,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(onDismiss, 4000);
      return () => {
        clearTimeout(timer);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);
      };
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible, onDismiss]);

  if (!food) return null;

  const isAlly = food.faction === 'ally';
  const direction = isAlly ? '👆' : '👇';
  const buttonText = isAlly ? '👆 RALLY' : '👇 BANISH';
  const color = isAlly ? '#22c55e' : '#ef4444';

  return (
    <Modal visible={visible} transparent animationType="none">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
            backgroundColor: '#0f0f1a',
            borderRadius: 20,
            borderWidth: 2,
            borderColor: color,
            padding: 24,
            maxWidth: 320,
          }}
        >
          {/* Food preview */}
          <Text style={{ fontSize: 60, marginBottom: 16 }}>{food.sprite}</Text>

          {/* Instruction */}
          <Text style={{ fontSize: 14, color: '#d1d5db', textAlign: 'center', marginBottom: 16, fontWeight: '600' }}>
            {isAlly
              ? `🥗 This is HEALTHY\nSwipe or tap ${direction} to RALLY it!`
              : `🍩 This is JUNK FOOD\nSwipe or tap ${direction} to BANISH it!`}
          </Text>

          {/* Action buttons - only show if tap mode for clarity */}
          {controlMode === 'tap' && (
            <TouchableOpacity
              onPress={onDismiss}
              style={{
                backgroundColor: color,
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 12,
                marginBottom: 8,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                {buttonText}
              </Text>
            </TouchableOpacity>
          )}

          {/* Auto-dismiss hint */}
          <Text style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
            Dismisses automatically in 4 seconds
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};
