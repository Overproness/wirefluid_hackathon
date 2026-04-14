'use client';

import { useMatchCount, useMatch, useTicketCategory, useTokenIdCounter, useBuyTicket } from '@/hooks/useTickets';
import { formatWire } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { useState } from 'react';
import { BuyTicketModal } from './BuyTicketModal';

function MatchCard({ matchId }: { matchId: number }) {
  const { match, isLoading } = useMatch(matchId);
  const { tokenIdCounter } = useTokenIdCounter();
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  if (isLoading || !match) {
    return <Skeleton className="h-64 w-full bg-[#191f31] rounded-xl" />;
  }

  if (!match.active) return null;

  const totalTokens = tokenIdCounter ? Number(tokenIdCounter) : 0;

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="bg-[#0c1324] p-4 border-b border-[rgba(134,148,138,0.08)]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B] mb-1">
            Match #{matchId}
          </p>
          <h3 className="font-heading text-xl font-bold text-[#dce1fb]">{match.name}</h3>
          <p className="text-xs text-[#86948a] mt-1">
            {new Date(Number(match.date) * 1000).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-[#86948a] mb-3">Ticket Categories</p>
          {Array.from({ length: totalTokens }).map((_, i) => (
            <CategoryRow key={i + 1} tokenId={i + 1} matchId={matchId} onBuy={() => setSelectedTokenId(i + 1)} />
          ))}
          {totalTokens === 0 && (
            <p className="text-sm text-[#86948a] py-2">No ticket categories available.</p>
          )}
        </div>
      </div>

      {selectedTokenId && (
        <BuyTicketModal
          tokenId={selectedTokenId}
          open={!!selectedTokenId}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </>
  );
}

function CategoryRow({ tokenId, matchId, onBuy }: { tokenId: number; matchId: number; onBuy: () => void }) {
  const { category } = useTicketCategory(tokenId);

  if (!category || Number(category.matchId) !== matchId) return null;

  const soldOut = Number(category.sold) >= Number(category.totalSupply);
  const remaining = Number(category.totalSupply) - Number(category.sold);
  const progressPct = (Number(category.sold) / Number(category.totalSupply)) * 100;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0c1324]/50">
      <div className="flex-1">
        <p className="text-sm font-medium text-[#dce1fb]">{category.categoryName}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-mono text-xs text-[#4edea3]">{formatWire(category.price)}</span>
          <div className="h-1 flex-1 max-w-[80px] bg-[#191f31] rounded-full overflow-hidden">
            <div className="h-full bg-[#4edea3] rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-[10px] text-[#86948a]">{remaining} left</span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onBuy}
        disabled={soldOut}
        className={soldOut
          ? 'bg-[#191f31] text-[#86948a] cursor-not-allowed text-xs'
          : 'primary-gradient text-white text-xs hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
        }
      >
        {soldOut ? 'Sold Out' : 'Buy'}
      </Button>
    </div>
  );
}

export function MatchesList() {
  const { matchCount, isLoading } = useMatchCount();
  const count = matchCount ? Number(matchCount) : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 w-full bg-[#191f31] rounded-xl" />
        ))}
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#86948a]">No matches scheduled yet.</p>
        <p className="text-sm text-[#86948a] mt-2">Check back soon for upcoming PSL matches.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MatchCard key={i + 1} matchId={i + 1} />
      ))}
    </div>
  );
}
