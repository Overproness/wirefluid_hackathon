'use client';

import { useCreatorSubmissions, useSubmission } from '@/hooks/useContent';
import { CONTENT_STATUSES } from '@/lib/constants';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function ContentRow({ contentId }: { contentId: number }) {
  const { submission, isLoading } = useSubmission(contentId);

  if (isLoading || !submission) {
    return <Skeleton className="h-16 w-full bg-[#191f31] rounded-lg" />;
  }

  const statusColors: Record<number, string> = {
    0: 'bg-[#F59E0B]/20 text-[#F59E0B]',
    1: 'bg-[#4edea3]/20 text-[#4edea3]',
    2: 'bg-red-500/20 text-red-400',
  };

  return (
    <Link href={`/content/${contentId}`}>
      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#191f31]/50 transition-colors">
        <div className="h-10 w-14 rounded-lg bg-[#191f31] flex items-center justify-center">
          <span className="text-xs text-[#86948a]">📄</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#dce1fb] truncate">{submission.title}</p>
          <p className="text-xs text-[#86948a] truncate">{submission.description}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${statusColors[submission.status] || statusColors[0]}`}>
          {CONTENT_STATUSES[submission.status]}
        </span>
      </div>
    </Link>
  );
}

export function MyContentSection() {
  const { contentIds, isLoading } = useCreatorSubmissions();

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-[#dce1fb]">Recent Submissions</h3>
        <Link href="/content" className="text-xs font-mono text-[#38BDF8] uppercase tracking-widest hover:text-[#7bd0ff]">
          View All →
        </Link>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-[#191f31] rounded-lg" />
          ))
        ) : !contentIds || contentIds.length === 0 ? (
          <p className="text-sm text-[#86948a] py-4 text-center">No content submitted yet.</p>
        ) : (
          contentIds.slice(-3).reverse().map((id) => (
            <ContentRow key={Number(id)} contentId={Number(id)} />
          ))
        )}
      </div>
    </div>
  );
}
