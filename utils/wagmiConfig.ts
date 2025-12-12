import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { scrollSepolia } from 'wagmi/chains';

// Get from: https://cloud.walletconnect.com
// Set in environment: EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID
const projectId = process.env.EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'test-project-id';

export const wagmiConfig = getDefaultConfig({
  appName: 'Glucose Wars',
  projectId,
  chains: [scrollSepolia],
  ssr: false,
});
