'use client';

import { useProposalCount, useProposal, useHasVoted } from '@/hooks/useGovernance';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActiveProposalsCTA() {
  const { proposalCount } = useProposalCount();
  const count = proposalCount ? Number(proposalCount) : 0;

  // Simple check - just show if there are proposals
  if (count === 0) return null;

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4 border-l-4 border-[#F59E0B]">
      <div className="h-10 w-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
        <Bell className="h-5 w-5 text-[#F59E0B]" />
      </div>
      <div className="flex-1">
        <h4 className="font-heading text-sm font-bold text-[#dce1fb]">Active Proposals</h4>
        <p className="text-xs text-[#bbcabf]">
          {count} pending DAO votes found. Cast your vote to earn 50 XP per proposal.
        </p>
      </div>
      <Link href="/governance">
        <Button className="primary-gradient text-white text-xs font-mono uppercase tracking-widest px-4">
          Vote Now
        </Button>
      </Link>
    </div>
  );
}
