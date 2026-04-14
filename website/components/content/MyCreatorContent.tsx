'use client';

import { useCreatorSubmissions, useSubmission, useContentRevenue, useClaimable, useClaimRevenue } from '@/hooks/useContent';
import { CONTENT_STATUSES } from '@/lib/constants';
import { formatWire } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CreatorContentRow({ contentId }: { contentId: number }) {
  const { submission, isLoading } = useSubmission(contentId);
  const { revenue } = useContentRevenue(contentId);
  const { claimable } = useClaimable(contentId);
  const { claimRevenue, isPending } = useClaimRevenue();

  if (isLoading || !submission) {
    return <Skeleton className="h-20 w-full bg-[#191f31] rounded-lg" />;
  }

  const statusColors: Record<number, string> = {
    0: 'bg-[#F59E0B]/20 text-[#F59E0B]',
    1: 'bg-[#4edea3]/20 text-[#4edea3]',
    2: 'bg-red-500/20 text-red-400',
  };

  const totalRevenue = revenue ? revenue[0] : BigInt(0);
  const claimableAmount = claimable || BigInt(0);

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0c1324]/50">
      <div className="flex-1 min-w-0">
        <Link href={`/content/${contentId}`}>
          <p className="text-sm font-medium text-[#dce1fb] hover:text-[#4edea3] transition-colors truncate">
            {submission.title}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${statusColors[submission.status]}`}>
            {CONTENT_STATUSES[submission.status]}
          </span>
          {totalRevenue > BigInt(0) && (
            <span className="text-xs font-mono text-[#bbcabf]">
              Revenue: {formatWire(totalRevenue)}
            </span>
          )}
        </div>
      </div>

      {claimableAmount > BigInt(0) && (
        <Button
          size="sm"
          onClick={() => claimRevenue(contentId)}
          disabled={isPending}
          className="primary-gradient text-white text-xs"
        >
          {isPending ? 'Claiming…' : `Claim ${formatWire(claimableAmount)}`}
        </Button>
      )}
    </div>
  );
}

export function MyCreatorContent() {
  const { contentIds, isLoading } = useCreatorSubmissions();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full bg-[#191f31] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!contentIds || contentIds.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#86948a]">You haven&apos;t submitted any content yet.</p>
        <p className="text-sm text-[#86948a] mt-2">Switch to the Submit tab to share your first creation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#bbcabf] mb-4">{contentIds.length} submission(s)</p>
      {[...contentIds].reverse().map((id) => (
        <CreatorContentRow key={Number(id)} contentId={Number(id)} />
      ))}
    </div>
  );
}
