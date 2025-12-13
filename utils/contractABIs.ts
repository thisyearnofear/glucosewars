/**
 * Contract ABIs for Scroll Sepolia deployments
 * Glucose Wars Achievements contract
 */

export const GLUCOSE_WARS_ACHIEVEMENTS_ABI = [
  {
    type: 'function',
    name: 'mintAchievement',
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'achievementId', type: 'uint256' },
      { name: 'tokenURI', type: 'string' },
      { name: 'privacyMode', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mintFairAchievement',
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'achievementId', type: 'uint256' },
      { name: 'tokenURI', type: 'string' },
      { name: 'privacyMode', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'updateAchievementPrivacy',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'newPrivacy', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPlayerAchievements',
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'privacyMode', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPublicAchievements',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isAchievementVerified',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AchievementMinted',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'achievementId', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AchievementPrivacyUpdated',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'newPrivacy', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'RandomnessReceived',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'randomness', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'FairnessVerified',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'randomness', type: 'uint256', indexed: false },
    ],
  },
] as const;

// Anyrand VRF Interface
interface IAnyrand {
  getRequestPrice: (callbackGasLimit: bigint) => Promise<[bigint, bigint]>;
  requestRandomness: (deadline: bigint, callbackGasLimit: bigint) => Promise<bigint>;
  getRequestState: (requestId: bigint) => Promise<number>;
}

// Export Anyrand ABI for VRF integration
export const ANYRAND_VRF_ABI = [
  {
    type: 'function',
    name: 'getRequestPrice',
    inputs: [{ name: 'callbackGasLimit', type: 'uint256' }],
    outputs: [
      { name: 'totalPrice', type: 'uint256' },
      { name: 'effectiveFeePerGas', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'requestRandomness',
    inputs: [
      { name: 'deadline', type: 'uint256' },
      { name: 'callbackGasLimit', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getRequestState',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const;
