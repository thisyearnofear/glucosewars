import React from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Platform } from 'react-native';

// Web platform version - now renders nothing as wallet connection is handled in MainMenu
// This component is preserved for potential future use of RainbowKit features
const WebOnlyConnectButton: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // Since we're using our cross-platform Web3 context, this component just renders children
  // RainbowKit components can be added here if needed
  return <>{children}</>;
};

export default WebOnlyConnectButton;