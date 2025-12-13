import React from 'react';
import { Web3Provider } from '@/context/Web3Context';

// Native platform version - wraps children with Web3 context
const WebProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
};

export default WebProviders;