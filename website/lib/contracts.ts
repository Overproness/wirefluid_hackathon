import { ContentManagerABI } from './abis/ContentManager';
import { FanIdentityABI } from './abis/FanIdentity';
import { FanTokenABI } from './abis/FanToken';
import { PSLGovernorABI } from './abis/PSLGovernor';
import { RevenueSplitterABI } from './abis/RevenueSplitter';
import { TicketFactoryABI } from './abis/TicketFactory';

export const CONTRACTS = {
  FanToken: {
    address: '0x8Ec5cD1A9b0D98429E91F296B0c7acAd329545d3' as const,
    abi: FanTokenABI,
  },
  FanIdentity: {
    address: '0xc94d28025e2123A65f70594b379A79cBaA64AE93' as const,
    abi: FanIdentityABI,
  },
  TicketFactory: {
    address: '0x5fb18Edd5340EAeB6AeaD2a66B8491B16F71b9dd' as const,
    abi: TicketFactoryABI,
  },
  RevenueSplitter: {
    address: '0xf2407E277497c0A78cbC544550b76172A1ff163d' as const,
    abi: RevenueSplitterABI,
  },
  ContentManager: {
    address: '0xB3C42f652639272A6D8d297c8A2894182fC46bAC' as const,
    abi: ContentManagerABI,
  },
  PSLGovernor: {
    address: '0x1b8b0eA5600354E3e643c52237a4e080aE732DA1' as const,
    abi: PSLGovernorABI,
  },
} as const;
