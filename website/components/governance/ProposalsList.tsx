'use client';

import { useProposalCount, useProposal, useHasVoted, useWinningOption, useOptionVotes } from '@/hooks/useGovernance';
import { PROPOSAL_TYPES, PROPOSAL_STATES } from '@/lib/constants';
import { formatAddress, formatVotes } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAccount } from 'wagmi';

function ProposalCard({ proposalId }: { proposalId: number }) {
  const { proposal, isLoading } = useProposal(proposalId);
  const { address } = useAccount();
  const { hasVoted } = useHasVoted(proposalId, address);

  if (isLoading || !proposal) {
    return <Skeleton className="h-48 w-full bg-[#191f31] rounded-xl" />;
  }

  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(proposal.endTime);
  const isActive = now < endTime;
  const timeLeft = isActive ? endTime - now : 0;
  const hoursLeft = Math.floor(timeLeft / 3600);
  const minsLeft = Math.floor((timeLeft % 3600) / 60);

  const stateColors: Record<number, string> = {
    0: 'bg-[#4edea3]/20 text-[#4edea3]',
    1: 'bg-[#38BDF8]/20 text-[#38BDF8]',
    2: 'bg-red-500/20 text-red-400',
    3: 'bg-[#a78bfa]/20 text-[#a78bfa]',
  };

  return (
    <Link href={`/governance/${proposalId}`}>
      <div className="glass-card rounded-xl p-5 hover:bg-[rgba(46,52,71,0.5)] transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B]">
              {PROPOSAL_TYPES[proposal.proposalType] || 'General'}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${stateColors[proposal.state] || stateColors[0]}`}>
              {isActive ? 'Active' : PROPOSAL_STATES[proposal.state]}
            </span>
          </div>
          {hasVoted !== undefined && (
            <span className={`text-[10px] font-mono uppercase tracking-widest ${hasVoted ? 'text-[#4edea3]' : 'text-[#F59E0B]'}`}>
              {hasVoted ? '✓ Voted' : 'Not Voted'}
            </span>
          )}
        </div>

        <h3 className="font-heading text-lg font-bold text-[#dce1fb] mb-2">{proposal.title}</h3>
        <p className="text-sm text-[#bbcabf] line-clamp-2 mb-3">{proposal.description}</p>

        <div className="flex items-center justify-between text-xs text-[#86948a]">
          <span>by {formatAddress(proposal.proposer)}</span>
          <span className="font-mono">
            {formatVotes(proposal.totalVotes)} votes
            {isActive && ` • ${hoursLeft}h ${minsLeft}m left`}
          </span>
        </div>

        {/* Quick option preview */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {proposal.options.slice(0, 4).map((opt, i) => (
            <span key={i} className="px-2 py-1 rounded bg-[#191f31] text-[10px] font-mono text-[#bbcabf]">
              {opt}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function ProposalsList() {
  const { proposalCount, isLoading } = useProposalCount();
  const count = proposalCount ? Number(proposalCount) : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full bg-[#191f31] rounded-xl" />
        ))}
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#86948a]">No proposals created yet.</p>
        <p className="text-sm text-[#86948a] mt-2">Be the first to propose something for the PSL community!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProposalCard key={count - i} proposalId={count - i} />
      ))}
    </div>
  );
}
