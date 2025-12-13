import React, { Suspense } from 'react';
import { Web3Provider } from '@/context/Web3Context';

// Web platform version - wraps children with Web3 context
// Using the same context for cross-platform compatibility
const WebProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
};

export default WebProviders;