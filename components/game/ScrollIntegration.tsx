import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useScrollIntegration } from '@/hooks/useScrollIntegration';
import { OnchainAchievement } from '@/types/game';

interface ScrollIntegrationProps {
  visible?: boolean;
  onDismiss?: () => void;
}

export const ScrollIntegration: React.FC<ScrollIntegrationProps> = ({
  visible = true,
  onDismiss,
}) => {
  const {
    userAddress,
    isConnected,
    isMinting,
    achievements,
    getTotalScore,
    connectWallet,
    disconnectWallet,
  } = useScrollIntegration();

  if (!visible) return null;

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <View className="flex-1 bg-black/95 border border-cyan-500/30 rounded-lg p-4 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">⛓️ Scroll Integration</Text>
        <Pressable
          onPress={onDismiss}
          className="w-8 h-8 justify-center items-center"
        >
          <Text className="text-white text-lg">✕</Text>
        </Pressable>
      </View>

      {/* Wallet Status */}
      <View className="bg-slate-900 rounded-lg p-3 mb-4 border border-slate-700">
        {isConnected && userAddress ? (
          <View>
            <Text className="text-emerald-400 text-sm font-semibold mb-2">
              ✓ Connected
            </Text>
            <Text className="text-gray-300 text-xs font-mono mb-3 break-all">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </Text>
            <Pressable
              onPress={disconnectWallet}
              className="bg-red-900/40 border border-red-600/50 rounded px-3 py-2"
            >
              <Text className="text-red-300 text-xs font-semibold text-center">
                Disconnect
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text className="text-gray-400 text-sm mb-3">
              Connect Scroll Sepolia wallet to mint achievements as NFTs
            </Text>
            <Pressable
              onPress={connectWallet}
              className="bg-cyan-600/30 border border-cyan-500 rounded px-4 py-2"
            >
              <Text className="text-cyan-300 text-sm font-semibold text-center">
                Connect Wallet
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Score Display */}
      <View className="bg-slate-900/50 rounded-lg p-3 mb-4 border border-slate-700">
        <Text className="text-gray-400 text-xs mb-1">Onchain Score</Text>
        <Text className="text-cyan-300 text-2xl font-bold">
          {getTotalScore()}
        </Text>
      </View>

      {/* Achievements List */}
      {achievements.length > 0 && (
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-sm font-semibold">Achievements</Text>
            <Text className="text-gray-500 text-xs">
              {unlockedAchievements.length}/{achievements.length}
            </Text>
          </View>

          <ScrollView
            nestedScrollEnabled
            className="bg-slate-900/30 rounded-lg border border-slate-700 max-h-40"
          >
            {achievements.map((achievement, idx) => (
              <AchievementItem
                key={achievement.id}
                achievement={achievement}
                isLast={idx === achievements.length - 1}
                isMinting={isMinting}
                isConnected={isConnected}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Info Footer */}
      <View className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
        <Text className="text-gray-500 text-xs leading-5">
          NFTs are minted on Scroll Sepolia testnet. Achievements unlock based on game performance.
          Earn tokens by completing health goals.
        </Text>
      </View>
    </View>
  );
};

interface AchievementItemProps {
  achievement: OnchainAchievement;
  isLast: boolean;
  isMinting: boolean;
  isConnected: boolean;
}

const AchievementItem: React.FC<AchievementItemProps> = ({
  achievement,
  isLast,
  isMinting,
  isConnected,
}) => {
  const { mintAchievementNFT } = useScrollIntegration();
  const [localMinting, setLocalMinting] = useState(false);

  const handleMint = async () => {
    setLocalMinting(true);
    await mintAchievementNFT(achievement.id);
    setLocalMinting(false);
  };

  return (
    <View
      className={`px-3 py-2 flex-row justify-between items-center ${
        !isLast ? 'border-b border-slate-700' : ''
      }`}
    >
      <View className="flex-1">
        <Text
          className={`text-sm font-semibold ${
            achievement.unlocked ? 'text-emerald-300' : 'text-gray-500'
          }`}
        >
          {achievement.icon} {achievement.name}
        </Text>
        <Text className="text-gray-500 text-xs">{achievement.points} pts</Text>
      </View>

      <View className="flex-row items-center gap-2">
        {achievement.unlocked ? (
          <View className="flex-row items-center gap-2">
            {achievement.tokenId ? (
              <View className="bg-emerald-900/30 px-2 py-1 rounded border border-emerald-600/50">
                <Text className="text-emerald-400 text-xs font-mono">
                  Minted
                </Text>
              </View>
            ) : isConnected ? (
              <Pressable
                onPress={handleMint}
                disabled={localMinting || isMinting}
                className={`px-2 py-1 rounded border ${
                  localMinting || isMinting
                    ? 'bg-gray-700/30 border-gray-600/50'
                    : 'bg-cyan-900/30 border-cyan-600/50'
                }`}
              >
                {localMinting || isMinting ? (
                  <ActivityIndicator size="small" color="#06b6d4" />
                ) : (
                  <Text className="text-cyan-400 text-xs font-semibold">Mint</Text>
                )}
              </Pressable>
            ) : (
              <View className="bg-amber-900/30 px-2 py-1 rounded border border-amber-600/50">
                <Text className="text-amber-400 text-xs">Connect</Text>
              </View>
            )}
            <Text className="text-emerald-400 text-sm">✓</Text>
          </View>
        ) : (
          <Text className="text-gray-600 text-xs">Locked</Text>
        )}
      </View>
    </View>
  );
};
