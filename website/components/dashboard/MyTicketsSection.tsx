'use client';

import { useTokenIdCounter, useTicketBalance, useTicketCategory, useMatch, useIsCheckedIn } from '@/hooks/useTickets';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { formatWire } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function TicketCard({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();
  const { balance } = useTicketBalance(tokenId, address);
  const { category } = useTicketCategory(tokenId);
  const { isCheckedIn } = useIsCheckedIn(tokenId, address);

  const matchId = category ? Number(category.matchId) : 0;
  const { match } = useMatch(matchId);

  if (!balance || Number(balance) === 0) return null;
  if (!category || !match) return null;

  return (
    <div className="glass-card rounded-xl p-4 min-w-[280px]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B]">
            {match.name}
          </p>
          <h4 className="font-heading text-lg font-bold text-[#dce1fb] mt-1">
            {category.categoryName}
          </h4>
        </div>
        <div className="h-8 w-8 rounded-lg bg-[#191f31] flex items-center justify-center">
          <span className="text-lg">🎫</span>
        </div>
      </div>
      <p className="text-xs text-[#86948a] mb-3">
        {new Date(Number(match.date) * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[#bbcabf]">
          Qty: {Number(balance)}
        </span>
        {isCheckedIn ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#4edea3]/20 text-[#4edea3]">
            Checked In
          </span>
        ) : (
          <Button size="sm" className="primary-gradient text-white text-xs h-7 px-3">
            Check-in
          </Button>
        )}
      </div>
    </div>
  );
}

export function MyTicketsSection() {
  const { tokenIdCounter, isLoading } = useTokenIdCounter();
  const count = tokenIdCounter ? Number(tokenIdCounter) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-[#dce1fb] uppercase">Active Match Tickets</h2>
        <div className="flex gap-2">
          <button className="h-8 w-8 rounded-lg bg-[#191f31] flex items-center justify-center text-[#bbcabf] hover:text-[#4edea3]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 rounded-lg bg-[#191f31] flex items-center justify-center text-[#bbcabf] hover:text-[#4edea3]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 min-w-[280px] bg-[#191f31] rounded-xl" />
          ))
        ) : count === 0 ? (
          <p className="text-sm text-[#86948a] py-8">No tickets found. Browse matches to get started.</p>
        ) : (
          Array.from({ length: count }).map((_, i) => (
            <TicketCard key={i + 1} tokenId={i + 1} />
          ))
        )}
      </div>
    </div>
  );
}
