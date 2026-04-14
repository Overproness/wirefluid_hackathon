'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { parseEther } from 'viem';

export function useMatchCount() {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.TicketFactory,
    functionName: 'matchCount',
  });
  return { matchCount: data as bigint | undefined, isLoading };
}

export function useMatch(matchId: number) {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.TicketFactory,
    functionName: 'getMatch',
    args: [BigInt(matchId)],
    query: { enabled: matchId > 0 },
  });
  return {
    match: data as {
      matchId: bigint;
      name: string;
      date: bigint;
      active: boolean;
    } | undefined,
    isLoading,
  };
}

export function useTicketCategory(tokenId: number) {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.TicketFactory,
    functionName: 'getCategory',
    args: [BigInt(tokenId)],
    query: { enabled: tokenId > 0 },
  });
  return {
    category: data as {
      tokenId: bigint;
      matchId: bigint;
      categoryName: string;
      price: bigint;
      maxResalePrice: bigint;
      totalSupply: bigint;
      sold: bigint;
    } | undefined,
    isLoading,
  };
}

export function useTokenIdCounter() {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.TicketFactory,
    functionName: 'tokenIdCounter',
  });
  return { tokenIdCounter: data as bigint | undefined, isLoading };
}

export function useTicketBalance(tokenId: number, address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const target = address || connectedAddress;

  const { data, isLoading } = useReadContract({
    ...CONTRACTS.TicketFactory,
    functionName: 'balanceOf',
    args: target ? [target, BigInt(tokenId)] : undefined,
    query: { enabled: !!target && tokenId > 0 },
  });
  return { balance: data as bigint | undefined, isLoading };
}

export function useIsCheckedIn(tokenId: number, address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const target = address || connectedAddress;

  const { data } = useReadContract({
    ...CONTRACTS.TicketFactory,
    functionName: 'isCheckedIn',
    args: target ? [BigInt(tokenId), target] : undefined,
    query: { enabled: !!target && tokenId > 0 },
  });
  return { isCheckedIn: data as boolean | undefined };
}

export function useTotalListings() {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.TicketFactory,
    functionName: 'totalListings',
  });
  return { totalListings: data as bigint | undefined, isLoading };
}

export function useListing(listingId: number) {
  const { data, isLoading } = useReadContract({
    ...CONTRACTS.TicketFactory,
    functionName: 'getListing',
    args: [BigInt(listingId)],
    query: { enabled: listingId >= 0 },
  });
  return {
    listing: data as {
      seller: `0x${string}`;
      tokenId: bigint;
      price: bigint;
      active: boolean;
    } | undefined,
    isLoading,
  };
}

export function useBuyTicket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Ticket purchased! 🎫');
  }, [isSuccess]);

  useEffect(() => {
    if (error) toast.error('Purchase failed', { description: 'Transaction reverted. Check your balance.' });
  }, [error]);

  return {
    buyTicket: (tokenId: number, price: bigint) =>
      writeContract({
        ...CONTRACTS.TicketFactory,
        functionName: 'buyTicket',
        args: [BigInt(tokenId)],
        value: price,
      }),
    isPending,
    isSuccess,
  };
}

export function useListForResale() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Ticket listed for resale!');
  }, [isSuccess]);

  useEffect(() => {
    if (error) toast.error('Listing failed', { description: 'Exceeds resale cap or no ticket.' });
  }, [error]);

  return {
    listForResale: (tokenId: number, price: bigint) =>
      writeContract({
        ...CONTRACTS.TicketFactory,
        functionName: 'listForResale',
        args: [BigInt(tokenId), price],
      }),
    isPending,
    isSuccess,
  };
}

export function useBuyResaleTicket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Resale ticket purchased! 🎫');
  }, [isSuccess]);

  useEffect(() => {
    if (error) toast.error('Purchase failed');
  }, [error]);

  return {
    buyResaleTicket: (listingId: number, price: bigint) =>
      writeContract({
        ...CONTRACTS.TicketFactory,
        functionName: 'buyResaleTicket',
        args: [BigInt(listingId)],
        value: price,
      }),
    isPending,
    isSuccess,
  };
}

export function useCancelListing() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) toast.success('Listing cancelled');
  }, [isSuccess]);

  return {
    cancelListing: (listingId: number) =>
      writeContract({
        ...CONTRACTS.TicketFactory,
        functionName: 'cancelListing',
        args: [BigInt(listingId)],
      }),
    isPending,
    isSuccess,
  };
}
