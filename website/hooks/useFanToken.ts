'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';

export function useFanTokenBalance(address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const target = address || connectedAddress;

  const { data, isLoading, refetch } = useReadContract({
    ...CONTRACTS.FanToken,
    functionName: 'balanceOf',
    args: target ? [target] : undefined,
    query: { enabled: !!target },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

export function useFanTokenTotalSupply() {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.FanToken,
    functionName: 'totalSupply',
  });
  return { totalSupply: data as bigint | undefined, isLoading };
}
