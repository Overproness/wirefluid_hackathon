'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useProposalCount() {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.PSLGovernor,
    functionName: 'proposalCount',
  });
  return { proposalCount: data as bigint | undefined, isLoading };
}

export function useProposal(proposalId: number) {
  const { data, isLoading, refetch } = useReadContract({
    ...CONTRACTS.PSLGovernor,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
    query: { enabled: proposalId > 0 },
  });

  return {
    proposal: data as {
      proposalId: bigint;
      proposalType: number;
      title: string;
      description: string;
      options: string[];
      startTime: bigint;
      endTime: bigint;
      proposer: `0x${string}`;
      state: number;
      totalVotes: bigint;
    } | undefined,
    isLoading,
    refetch,
  };
}

export function useOptionVotes(proposalId: number, optionIndex: number) {
  const { data } = useReadContract({
    ...CONTRACTS.PSLGovernor,
    functionName: 'getOptionVotes',
    args: [BigInt(proposalId), BigInt(optionIndex)],
    query: { enabled: proposalId > 0 },
  });
  return { votes: data as bigint | undefined };
}

export function useHasVoted(proposalId: number, address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const target = address || connectedAddress;

  const { data, refetch } = useReadContract({
    ...CONTRACTS.PSLGovernor,
    functionName: 'hasUserVoted',
    args: target ? [BigInt(proposalId), target] : undefined,
    query: { enabled: !!target && proposalId > 0 },
  });
  return { hasVoted: data as boolean | undefined, refetch };
}

export function useVoteWeight(address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const target = address || connectedAddress;

  const { data } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: 'getVoteWeight',
    args: target ? [target] : undefined,
    query: { enabled: !!target },
  });
  return { voteWeight: data as bigint | undefined };
}

export function useCreateProposal() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Proposal created! 🗳️');
  }, [isSuccess]);

  useEffect(() => {
    if (error) toast.error('Proposal creation failed');
  }, [error]);

  return {
    createProposal: (
      proposalType: number,
      title: string,
      description: string,
      options: string[],
      duration: number
    ) =>
      writeContract({
        ...CONTRACTS.PSLGovernor,
        functionName: 'createProposal',
        args: [proposalType, title, description, options, BigInt(duration)],
      }),
    isPending,
    isSuccess,
  };
}

export function useVote() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Vote cast! +25 XP 🏏', { description: 'Your voice shapes PSL governance.' });
  }, [isSuccess]);

  useEffect(() => {
    if (error) toast.error('Vote failed', {
      description: error?.message?.includes('Already voted')
        ? "You've already voted on this proposal."
        : error?.message?.includes('Voting ended')
          ? "This proposal's voting period has closed."
          : 'Transaction reverted.',
    });
  }, [error]);

  return {
    vote: (proposalId: number, optionIndex: number) =>
      writeContract({
        ...CONTRACTS.PSLGovernor,
        functionName: 'vote',
        args: [BigInt(proposalId), BigInt(optionIndex)],
      }),
    isPending,
    isSuccess,
  };
}

export function useWinningOption(proposalId: number) {
  const { data } = useReadContract({
    ...CONTRACTS.PSLGovernor,
    functionName: 'getWinningOption',
    args: [BigInt(proposalId)],
    query: { enabled: proposalId > 0 },
  });
  return {
    winningIndex: data ? (data as [bigint, bigint])[0] : undefined,
    winningVotes: data ? (data as [bigint, bigint])[1] : undefined,
  };
}
