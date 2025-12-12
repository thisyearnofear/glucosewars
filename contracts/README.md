# GlucoseWars Smart Contracts

This directory contains the Solidity smart contracts for GlucoseWars, deployed on the Scroll network.

## Contract: GlucoseWarsAchievements.sol

### Overview
This contract manages privacy-controlled achievement NFTs with Anyrand VRF verification for fair events. It's specifically designed for the Scroll network and integrates with Anyrand's VRF service for provably fair randomness.

### Key Features

1. **Privacy-Controlled Achievements**:
   - Achievements can be set as 'public', 'private', or 'healthcare_only'
   - Users can update privacy settings after minting
   - Separate tracking by privacy category

2. **Anyrand VRF Integration**:
   - Fair achievement minting using Scroll-compatible VRF
   - Implements IRandomiserCallbackV3 interface
   - Tracks verification status and randomness values

3. **Achievement Categories**:
   - Organized by privacy modes
   - Separate stats tracking for public vs private achievements
   - Player-specific achievement management

### Deployment Addresses

**Scroll Sepolia Testnet:**
- Contract Address: 0xf36223131aDA53e94B08F0c098A6A93424D68EE3
- Contract Explorer: https://sepolia-blockscout.scroll.io/address/0xf36223131aDA53e94B08F0c098A6A93424D68EE3
- Anyrand VRF: 0x5d8570e6d734184357f3969b23050d64913be681

### Deployment Information
- **Network**: Scroll Sepolia (Chain ID: 534351)
- **Deployer**: Contract deployed and verified on Scroll Sepolia testnet
- **Verification**: Contract source code verified on Scroll Blockscout
- **Last Updated**: 2025-12-12

### Interfaces Used
- `IRandomiserCallbackV3`: For receiving randomness from Anyrand
- `IAnyrand`: For requesting randomness and checking request states

### Functions

- `mintAchievement()`: Main function to mint privacy-controlled achievements
- `mintFairAchievement()`: Mint with VRF verification for fair events
- `updateAchievementPrivacy()`: Change privacy setting of existing achievement
- `getPlayerAchievements()`: Get achievements by privacy mode
- `getPublicAchievements()`: Get public achievements for display

### Security
- Only owner (game backend) can mint achievements
- Only Anyrand contract can call the randomness callback
- Proper access control on privacy updates