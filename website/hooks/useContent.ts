'use client';

import { CONTRACTS } from '@/lib/contracts';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export function useContentCount() {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.ContentManager,
    functionName: 'contentCount',
  });
  return { contentCount: data as bigint | undefined, isLoading };
}

export function useSubmission(contentId: number) {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.ContentManager,
    functionName: 'getSubmission',
    args: [BigInt(contentId)],
    query: { enabled: contentId > 0 },
  });
  return {
    submission: data as {
      contentId: bigint;
      creator: `0x${string}`;
      metadataURI: string;
      title: string;
      description: string;
      status: number;
      submittedAt: bigint;
      reviewedAt: bigint;
    } | undefined,
    isLoading,
  };
}

export function usePendingSubmissions() {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.ContentManager,
    functionName: 'getPendingSubmissions',
  });
  return { pendingIds: data as bigint[] | undefined, isLoading };
}

export function useCreatorSubmissions(address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const target = address || connectedAddress;

  const { data, isLoading } = useReadContract({
    ...CONTRACTS.ContentManager,
    functionName: 'getSubmissionsByCreator',
    args: target ? [target] : undefined,
    query: { enabled: !!target },
  });
  return { contentIds: data as bigint[] | undefined, isLoading };
}

export function useContentRevenue(contentId: number) {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.RevenueSplitter,
    functionName: 'getContentRevenue',
    args: [BigInt(contentId)],
    query: { enabled: contentId > 0 },
  });
  return {
    revenue: data as [bigint, bigint, bigint, bigint, bigint] | undefined,
    isLoading,
  };
}

export function useClaimable(contentId: number, address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const target = address || connectedAddress;

  const { data, isLoading } = useReadContract({
    ...CONTRACTS.RevenueSplitter,
    functionName: 'getClaimable',
    args: target ? [BigInt(contentId), target] : undefined,
    query: { enabled: !!target && contentId > 0 },
  });
  return { claimable: data as bigint | undefined, isLoading };
}

export function useSubmitContent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Content submitted! 📝', { description: 'A moderator will review it soon.' });
  }, [isSuccess]);

  useEffect(() => {
    if (error) toast.error('Submission failed', {
      description: error.message.includes('Must be a registered fan')
        ? 'Please register your fan profile first.'
        : 'Transaction reverted.',
    });
  }, [error]);

  return {
    submitContent: (metadataURI: string, title: string, description: string) =>
      writeContract({
        ...CONTRACTS.ContentManager,
        functionName: 'submitContent',
        args: [metadataURI, title, description],
      }),
    isPending,
    isSuccess,
  };
}

export function useTipContent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Tip sent! ❤️', { description: 'Creator will receive 50% of your tip.' });
  }, [isSuccess]);

  useEffect(() => {
    if (error) toast.error('Tip failed');
  }, [error]);

  return {
    tipContent: (contentId: number, value: bigint) =>
      writeContract({
        ...CONTRACTS.ContentManager,
        functionName: 'tipContent',
        args: [BigInt(contentId)],
        value,
      }),
    isPending,
    isSuccess,
  };
}

export function useSponsorContent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Sponsorship funded! 💎');
  }, [isSuccess]);

  return {
    sponsorContent: (contentId: number, value: bigint) =>
      writeContract({
        ...CONTRACTS.ContentManager,
        functionName: 'sponsorContent',
        args: [BigInt(contentId)],
        value,
      }),
    isPending,
    isSuccess,
  };
}

export function useClaimRevenue() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Revenue claimed! 💰');
  }, [isSuccess]);

  useEffect(() => {
    if (error) toast.error('Claim failed', { description: 'Nothing to claim.' });
  }, [error]);

  return {
    claimRevenue: (contentId: number) =>
      writeContract({
        ...CONTRACTS.RevenueSplitter,
        functionName: 'claimRevenue',
        args: [BigInt(contentId)],
      }),
    isPending,
    isSuccess,
  };
}
