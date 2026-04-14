'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
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

export const config = getDefaultConfig({
  appName: 'CricketChain',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [wirefluidTestnet],
  ssr: true,
});
