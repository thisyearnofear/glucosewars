import React from 'react';

// Native platform version - renders nothing as wallet connection is handled in MainMenu
const WebOnlyConnectButton: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // Since we're using our cross-platform Web3 context, this component just renders children
  return <>{children}</>;
};

export default WebOnlyConnectButton;