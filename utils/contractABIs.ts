/**
 * Contract ABIs for Scroll Sepolia deployments
 * Glucose Wars Achievements contract
 */

export const GLUCOSE_WARS_ACHIEVEMENTS_ABI = [
  {
    type: 'function',
    name: 'mintAchievement',
    inputs: [
      { name: 'achievementId', type: 'uint256' },
      { name: 'privacyMode', type: 'uint8' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPlayerAchievements',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: 'achievements', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAchievementMetadata',
    inputs: [{ name: 'achievementId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'icon', type: 'string' },
      { name: 'points', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AchievementMinted',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'achievementId', type: 'uint256', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: false },
    ],
  },
] as const;
