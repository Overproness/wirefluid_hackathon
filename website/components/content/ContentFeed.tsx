"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentCount, useSubmission } from "@/hooks/useContent";
import { formatAddress } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { SponsorModal } from "./SponsorModal";
import { TipModal } from "./TipModal";

function ContentCard({ contentId }: { contentId: number }) {
  const { submission, isLoading } = useSubmission(contentId);
  const [tipOpen, setTipOpen] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);

  if (isLoading || !submission) {
    return <Skeleton className="h-56 w-full bg-[#191f31] rounded-xl" />;
  }

  // Only show approved content in feed
  if (submission.status !== 1) return null;

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Thumbnail placeholder */}
        <div className="h-40 bg-gradient-to-br from-[#191f31] to-[#0c1324] flex items-center justify-center">
          <span className="text-4xl">🎬</span>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link href={`/content/${contentId}`}>
                <h3 className="font-heading text-lg font-bold text-[#dce1fb] hover:text-[#4edea3] transition-colors truncate">
                  {submission.title}
                </h3>
              </Link>
              <p className="text-xs text-[#86948a] mt-1 line-clamp-2">
                {submission.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#86948a]">
            <span>by {formatAddress(submission.creator)}</span>
            <span>•</span>
            <span>
              {new Date(
                Number(submission.submittedAt) * 1000,
              ).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setTipOpen(true)}
              className="primary-gradient text-white text-xs flex-1"
            >
              ❤️ Tip
            </Button>
            <Button
              size="sm"
              onClick={() => setSponsorOpen(true)}
              variant="outline"
              className="border-[rgba(134,148,138,0.15)] text-[#F59E0B] text-xs flex-1"
            >
              💎 Sponsor
            </Button>
          </div>
        </div>
      </div>

      <TipModal
        contentId={contentId}
        open={tipOpen}
        onClose={() => setTipOpen(false)}
      />
      <SponsorModal
        contentId={contentId}
        open={sponsorOpen}
        onClose={() => setSponsorOpen(false)}
      />
    </>
  );
}

export function ContentFeed() {
  const { contentCount, isLoading } = useContentCount();
  const count = contentCount ? Number(contentCount) : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 w-full bg-[#191f31] rounded-xl" />
        ))}
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#86948a]">No content published yet.</p>
        <p className="text-sm text-[#86948a] mt-2">
          Be the first to submit cricket content!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCard key={i + 1} contentId={i + 1} />
      ))}
    </div>
  );
}
