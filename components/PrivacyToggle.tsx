import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PrivacyMode } from '@/types/health';

interface PrivacyToggleProps {
  currentMode: PrivacyMode;
  onToggle: (mode: PrivacyMode) => void;
  showLabel?: boolean;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  currentMode,
  onToggle,
  showLabel = true,
}) => {
  const isPrivate = currentMode === 'private';
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>Privacy Mode</Text>
      )}
      <TouchableOpacity
        style={[
          styles.toggleContainer,
          isPrivate ? styles.privateContainer : styles.standardContainer,
        ]}
        onPress={() => onToggle(isPrivate ? 'standard' : 'private')}
      >
        <View style={[
          styles.toggleButton,
          isPrivate ? styles.privateButton : styles.standardButton,
        ]}>
          <Text style={[
            styles.toggleText,
            isPrivate ? styles.privateText : styles.standardText,
          ]}>
            {isPrivate ? '🔒 Private' : '🌐 Standard'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#e5e7eb',
    marginRight: 10,
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 2,
  },
  standardContainer: {
    backgroundColor: '#374151',
  },
  privateContainer: {
    backgroundColor: '#1f2937',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 100,
    alignItems: 'center',
  },
  standardButton: {
    backgroundColor: '#d1d5db',
  },
  privateButton: {
    backgroundColor: '#06b6d4',
  },
  toggleText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  standardText: {
    color: '#1f2937',
  },
  privateText: {
    color: 'white',
  },
});