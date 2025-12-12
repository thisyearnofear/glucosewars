import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Modal, StyleSheet } from 'react-native';
import { PrivacySettings, PrivacyMode, Visibility } from '@/types/health';

interface PrivacySettingsProps {
  settings: PrivacySettings;
  onSave: (settings: PrivacySettings) => void;
  onClose: () => void;
  visible: boolean;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsProps> = ({
  settings,
  onSave,
  onClose,
  visible,
}) => {
  const [currentSettings, setCurrentSettings] = useState<PrivacySettings>({ ...settings });

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  const handleModeChange = (mode: PrivacyMode) => {
    setCurrentSettings({
      ...currentSettings,
      mode,
      // When switching to private mode, set more restrictive defaults
      ...(mode === 'private' && {
        glucoseLevels: 'private',
        insulinDoses: 'private',
        achievements: 'private',
        gameStats: 'private',
        healthProfile: 'private',
        encryptHealthData: true,
      }),
      // When switching to standard mode, set more open defaults
      ...(mode === 'standard' && {
        glucoseLevels: 'public',
        insulinDoses: 'public',
        achievements: 'public',
        gameStats: 'public',
        healthProfile: 'public',
        encryptHealthData: false,
      }),
    });
  };

  const handleVisibilityChange = (field: keyof Omit<PrivacySettings, 'mode' | 'encryptHealthData'>, value: Visibility) => {
    setCurrentSettings({
      ...currentSettings,
      [field]: value,
    });
  };

  const VisibilityToggle = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: Visibility; 
    onChange: (value: Visibility) => void 
  }) => (
    <View style={styles.visibilityRow}>
      <Text style={styles.visibilityLabel}>{label}</Text>
      <View style={styles.visibilityButtons}>
        {(['private', 'public', 'healthcare_only'] as Visibility[]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.visibilityButton,
              value === option && styles.visibilityButtonActive,
            ]}
            onPress={() => onChange(option)}
          >
            <Text style={[
              styles.visibilityButtonText,
              value === option && styles.visibilityButtonTextActive
            ]}>
              {option === 'private' ? '🔒 Private' : 
               option === 'public' ? '🌍 Public' : 
               '🏥 Healthcare'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Privacy Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modeSection}>
            <Text style={styles.sectionTitle}>Privacy Mode</Text>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  currentSettings.mode === 'standard' && styles.modeButtonActive,
                ]}
                onPress={() => handleModeChange('standard')}
              >
                <Text style={[
                  styles.modeButtonText,
                  currentSettings.mode === 'standard' && styles.modeButtonTextActive
                ]}>
                  Standard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  currentSettings.mode === 'private' && styles.modeButtonActive,
                ]}
                onPress={() => handleModeChange('private')}
              >
                <Text style={[
                  styles.modeButtonText,
                  currentSettings.mode === 'private' && styles.modeButtonTextActive
                ]}>
                  Private
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modeDescription}>
              {currentSettings.mode === 'standard'
                ? 'Data is stored normally'
                : 'Data is encrypted before storage'}
            </Text>
          </View>

          <View style={styles.encryptionSection}>
            <View style={styles.encryptionRow}>
              <Text style={styles.encryptionLabel}>Encrypt Health Data</Text>
              <Switch
                value={currentSettings.encryptHealthData}
                onValueChange={(value) =>
                  setCurrentSettings({ ...currentSettings, encryptHealthData: value })
                }
              />
            </View>
          </View>

          <View style={styles.visibilitySection}>
            <Text style={styles.sectionTitle}>Data Visibility</Text>
            <VisibilityToggle
              label="Glucose Levels"
              value={currentSettings.glucoseLevels}
              onChange={(value) => handleVisibilityChange('glucoseLevels', value)}
            />
            <VisibilityToggle
              label="Insulin Doses"
              value={currentSettings.insulinDoses}
              onChange={(value) => handleVisibilityChange('insulinDoses', value)}
            />
            <VisibilityToggle
              label="Achievements"
              value={currentSettings.achievements}
              onChange={(value) => handleVisibilityChange('achievements', value)}
            />
            <VisibilityToggle
              label="Game Stats"
              value={currentSettings.gameStats}
              onChange={(value) => handleVisibilityChange('gameStats', value)}
            />
            <VisibilityToggle
              label="Health Profile"
              value={currentSettings.healthProfile}
              onChange={(value) => handleVisibilityChange('healthProfile', value)}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#9ca3af',
  },
  modeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 10,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  modeButtonText: {
    color: '#d1d5db',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  modeDescription: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  encryptionSection: {
    marginBottom: 20,
  },
  encryptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  encryptionLabel: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  visibilitySection: {
    marginBottom: 20,
  },
  visibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visibilityLabel: {
    color: '#e5e7eb',
    fontSize: 14,
    flex: 1,
  },
  visibilityButtons: {
    flexDirection: 'row',
    flex: 1.5,
    justifyContent: 'space-between',
  },
  visibilityButton: {
    flex: 1,
    padding: 6,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  visibilityButtonActive: {
    backgroundColor: '#06b6d4',
  },
  visibilityButtonText: {
    color: '#d1d5db',
    fontSize: 10,
  },
  visibilityButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6b7280',
    marginRight: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});