"use client";

import { SponsorModal } from "@/components/content/SponsorModal";
import { TipModal } from "@/components/content/TipModal";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useClaimable,
  useClaimRevenue,
  useContentRevenue,
  useSubmission,
} from "@/hooks/useContent";
import { useProfile } from "@/hooks/useProfile";
import { CONTENT_STATUSES } from "@/lib/constants";
import { formatAddress, formatWire } from "@/lib/utils";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { useAccount } from "wagmi";

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId: id } = use(params);
  const contentId = parseInt(id);
  const { address } = useAccount();
  const { submission, isLoading } = useSubmission(contentId);
  const { revenue } = useContentRevenue(contentId);
  const { claimable } = useClaimable(contentId);
  const { claimRevenue, isPending: claimPending } = useClaimRevenue();
  const creatorProfile = useProfile(submission?.creator);
  const [tipOpen, setTipOpen] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);

  const statusColors: Record<number, string> = {
    0: "bg-[#F59E0B]/20 text-[#F59E0B]",
    1: "bg-[#4edea3]/20 text-[#4edea3]",
    2: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/content"
          className="inline-flex items-center gap-2 text-sm text-[#bbcabf] hover:text-[#4edea3] mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Content Hub
        </Link>

        {isLoading || !submission ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3 bg-[#191f31]" />
            <Skeleton className="h-64 w-full bg-[#191f31] rounded-xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${statusColors[submission.status]}`}
                >
                  {CONTENT_STATUSES[submission.status]}
                </span>
                <span className="text-xs text-[#86948a]">
                  Submitted{" "}
                  {new Date(
                    Number(submission.submittedAt) * 1000,
                  ).toLocaleDateString()}
                </span>
              </div>
              <h1 className="font-heading text-3xl font-bold text-[#dce1fb]">
                {submission.title}
              </h1>
            </div>

            {/* Creator info */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#191f31] border-2 border-[#10b981] flex items-center justify-center text-[#4edea3] font-bold">
                {creatorProfile.profile?.username?.charAt(0)?.toUpperCase() ||
                  "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-[#dce1fb]">
                  {creatorProfile.profile?.username ||
                    formatAddress(submission.creator)}
                </p>
                <p className="text-xs text-[#86948a]">
                  {formatAddress(submission.creator)}
                </p>
              </div>
            </div>

            {/* Content area */}
            <div className="glass-card rounded-xl p-6">
              <p className="text-[#bbcabf] leading-relaxed">
                {submission.description}
              </p>
              {submission.metadataURI && (
                <a
                  href={submission.metadataURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-sm text-[#38BDF8] hover:text-[#7bd0ff]"
                >
                  View Content <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Revenue stats */}
            {revenue && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-heading text-lg font-bold text-[#dce1fb] mb-4">
                  Revenue Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="font-mono text-lg font-bold text-[#4edea3]">
                      {formatWire(revenue[0])}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">
                      Total
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold text-[#dce1fb]">
                      {formatWire(revenue[1])}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">
                      Tips
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold text-[#F59E0B]">
                      {formatWire(revenue[2])}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">
                      Sponsors
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold text-[#38BDF8]">
                      {formatWire(revenue[3])}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">
                      Creator Share
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {submission.status === 1 && (
                <>
                  <Button
                    onClick={() => setTipOpen(true)}
                    className="primary-gradient text-white flex-1"
                  >
                    ❤️ Tip Creator
                  </Button>
                  <Button
                    onClick={() => setSponsorOpen(true)}
                    variant="outline"
                    className="border-[rgba(134,148,138,0.15)] text-[#F59E0B] flex-1"
                  >
                    💎 Sponsor
                  </Button>
                </>
              )}
              {claimable &&
                claimable > BigInt(0) &&
                address?.toLowerCase() === submission.creator.toLowerCase() && (
                  <Button
                    onClick={() => claimRevenue(contentId)}
                    disabled={claimPending}
                    className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black"
                  >
                    {claimPending
                      ? "Claiming…"
                      : `Claim ${formatWire(claimable)}`}
                  </Button>
                )}
            </div>
          </div>
        )}

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
      </main>
      <Footer />
    </div>
  );
}
