/**
 * Contract Addresses Configuration
 * 
 * Centralized location for all deployed contract addresses on Scroll Sepolia
 * Updated: 2025-12-12
 */

// Main Achievement Contract
export const GLUCOSE_WARS_ACHIEVEMENTS = {
    address: '0xf36223131aDA53e94B08F0c098A6A93424D68EE3',
    explorerUrl: 'https://sepolia-blockscout.scroll.io/address/0xf36223131aDA53e94B08F0c098A6A93424D68EE3',
    network: 'Scroll Sepolia',
    chainId: 534351,
    contractName: 'GlucoseWarsAchievements',
    symbol: 'GWA',
    description: 'Privacy-controlled achievement NFTs with Anyrand VRF verification'
};

// Anyrand VRF Service
export const ANYRAND_VRF = {
    address: '0x5d8570e6d734184357f3969b23050d64913be681',
    network: 'Scroll Sepolia',
    chainId: 534351,
    service: 'Anyrand VRF',
    description: 'Verifiable Random Function service for fair achievement minting'
};

// Define contract types
interface ContractWithExplorer {
  address: string;
  explorerUrl: string;
  network: string;
  chainId: number;
  contractName?: string;
  symbol?: string;
  description: string;
}

interface ServiceContract {
  address: string;
  network: string;
  chainId: number;
  service: string;
  description: string;
}

// Union type for all contracts
type ContractConfig = ContractWithExplorer | ServiceContract;

// All contracts for easy import
export const CONTRACTS: Record<string, ContractConfig> = {
    GLUCOSE_WARS_ACHIEVEMENTS,
    ANYRAND_VRF
};

// Helper function to get contract address by name
export const getContractAddress = (contractName: keyof typeof CONTRACTS): string => {
    const contract = CONTRACTS[contractName];
    return contract.address;
};

// Helper function to get explorer URL for a contract
export const getExplorerUrl = (contractName: keyof typeof CONTRACTS): string | null => {
    const contract = CONTRACTS[contractName];
    if ('explorerUrl' in contract) {
        return contract.explorerUrl;
    }
    return null;
};

// Network information
export const NETWORK_INFO = {
    name: 'Scroll Sepolia',
    chainId: 534351,
    rpcUrl: 'https://sepolia-rpc.scroll.io',
    explorerUrl: 'https://sepolia-blockscout.scroll.io',
    currency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    }
};