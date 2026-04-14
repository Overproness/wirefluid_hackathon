'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  okxWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { defineChain } from 'viem';

export const wirefluidTestnet = defineChain({
  id: 92533,
  name: 'WireFluid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'WIRE',
    symbol: 'WIRE',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.wirefluid.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WireScan',
      url: 'https://wirescan.bonk.credit',
    },
  },
  testnet: true,
});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export const config = getDefaultConfig({
  appName: 'CricketChain',
  projectId: projectId || 'dummy-not-used',
  chains: [wirefluidTestnet],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, okxWallet],
    },
    {
      groupName: 'More',
      wallets: [coinbaseWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  ssr: true,
});
