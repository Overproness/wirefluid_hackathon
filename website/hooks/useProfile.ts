'use client';

import { CONTRACTS } from '@/lib/contracts';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export function useProfile(address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const target = address || connectedAddress;

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: 'getProfile',
    args: target ? [target] : undefined,
    query: { enabled: !!target },
  });

  const { data: tier, isLoading: tierLoading } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: 'getTier',
    args: target ? [target] : undefined,
    query: { enabled: !!target },
  });

  const { data: voteWeight } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: 'getVoteWeight',
    args: target ? [target] : undefined,
    query: { enabled: !!target },
  });

  return {
    profile: profile as {
      username: string;
      totalXP: bigint;
      matchesAttended: bigint;
      votesParticipated: bigint;
      contentSubmitted: bigint;
      registeredAt: bigint;
      exists: boolean;
    } | undefined,
    tier: tier as number | undefined,
    voteWeight: voteWeight as bigint | undefined,
    isLoading: profileLoading || tierLoading,
    refetchProfile,
  };
}

export function useIsRegistered(address?: `0x${string}`) {
  const { profile, isLoading } = useProfile(address);
  return {
    isRegistered: profile?.exists ?? false,
    isLoading,
  };
}

export function useRegister() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Welcome to CricketChain! 🏏', {
        description: 'Your fan profile has been created.',
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      toast.error('Registration failed', {
        description: error.message.includes('Already registered')
          ? 'This wallet is already registered.'
          : 'Transaction failed. Please try again.',
      });
    }
  }, [error]);

  return {
    register: (username: string) =>
      writeContract({
        ...CONTRACTS.FanIdentity,
        functionName: 'register',
        args: [username],
      }),
    isPending,
    isSuccess,
    hash,
  };
}

export function useTotalFans() {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: 'totalFans',
  });
  return { totalFans: data as bigint | undefined, isLoading };
}

export function useAllFans(index: number) {
  const { data } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: 'allFans',
    args: [BigInt(index)],
    query: { enabled: index >= 0 },
  });
  return data as `0x${string}` | undefined;
}
