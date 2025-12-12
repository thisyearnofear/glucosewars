/**
 * Scroll Smart Contract Interface
 * Deployed on Scroll Sepolia testnet
 * Handles achievement NFT minting and storage
 */

export const SCROLL_CONFIG = {
  CHAIN_ID: 534351, // Scroll Sepolia testnet
  RPC_URL: 'https://sepolia-rpc.scroll.io',
  EXPLORER_URL: 'https://sepolia-blockscout.scroll.io',
  // Update with deployed contract address
  CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
};

/**
 * Minimal Solidity contract for achievements
 * Deploy to Scroll Sepolia before production
 */
export const CONTRACT_SOURCE = `
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GlucoseWarsAchievements is ERC721, Ownable {
  uint256 private tokenIdCounter;
  
  mapping(address => uint256[]) public playerAchievements;
  mapping(uint256 => string) public achievementURIs;
  
  event AchievementMinted(address indexed player, uint256 indexed tokenId, uint256 achievementId);
  
  constructor() ERC721("Glucose Wars Achievements", "GWA") {}
  
  function mintAchievement(
    address player,
    uint256 achievementId,
    string memory tokenURI
  ) external onlyOwner returns (uint256) {
    uint256 tokenId = tokenIdCounter++;
    _safeMint(player, tokenId);
    achievementURIs[tokenId] = tokenURI;
    playerAchievements[player].push(tokenId);
    
    emit AchievementMinted(player, tokenId, achievementId);
    return tokenId;
  }
  
  function getPlayerAchievements(address player) 
    external 
    view 
    returns (uint256[] memory) 
  {
    return playerAchievements[player];
  }
  
  function tokenURI(uint256 tokenId)
    public
    view
    override
    returns (string memory)
  {
    return achievementURIs[tokenId];
  }
}
`;

/**
 * Achievement metadata for NFT minting
 * IPFS/Arweave ready
 */
export const ACHIEVEMENT_METADATA = {
  victory_classic: {
    name: 'Glucose Master',
    description: 'Won a Classic mode game - proof of glucose management mastery',
    image: 'ipfs://QmXXXX/glucose_master.png', // Update with actual IPFS hash
    attributes: [
      { trait_type: 'Rarity', value: 'Common' },
      { trait_type: 'Category', value: 'Victory' },
      { trait_type: 'Points', value: '100' },
    ],
  },
  victory_life: {
    name: 'Life Keeper',
    description: 'Survived a full Life mode game - advanced health management',
    image: 'ipfs://QmXXXX/life_keeper.png',
    attributes: [
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Category', value: 'Victory' },
      { trait_type: 'Points', value: '250' },
    ],
  },
  perfect_stability: {
    name: 'Perfect Balance',
    description: 'Maintained optimal glucose levels throughout entire game',
    image: 'ipfs://QmXXXX/perfect_balance.png',
    attributes: [
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Category', value: 'Excellence' },
      { trait_type: 'Points', value: '150' },
    ],
  },
  high_combo: {
    name: 'Combo Champion',
    description: 'Achieved 50+ consecutive correct swipes',
    image: 'ipfs://QmXXXX/combo_champion.png',
    attributes: [
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Category', value: 'Skill' },
      { trait_type: 'Points', value: '120' },
    ],
  },
  health_streak: {
    name: 'Health Warrior',
    description: 'Won 3 consecutive games',
    image: 'ipfs://QmXXXX/health_warrior.png',
    attributes: [
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Category', value: 'Dedication' },
      { trait_type: 'Points', value: '300' },
    ],
  },
  explorer: {
    name: 'Explorer',
    description: 'Played all available game modes',
    image: 'ipfs://QmXXXX/explorer.png',
    attributes: [
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Category', value: 'Discovery' },
      { trait_type: 'Points', value: '200' },
    ],
  },
};

/**
 * Helper to generate NFT metadata JSON
 */
export const generateMetadataJSON = (
  achievementId: keyof typeof ACHIEVEMENT_METADATA,
  playerAddress: string
) => {
  const base = ACHIEVEMENT_METADATA[achievementId];
  return {
    ...base,
    attributes: [
      ...base.attributes,
      { trait_type: 'Earned By', value: playerAddress },
      { trait_type: 'Earned On', value: new Date().toISOString() },
    ],
  };
};
