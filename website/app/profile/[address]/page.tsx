"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreatorSubmissions } from "@/hooks/useContent";
import { useFanTokenBalance } from "@/hooks/useFanToken";
import { useProfile } from "@/hooks/useProfile";
import { TIER_BG_COLORS, WIRESCAN_URL } from "@/lib/constants";
import {
  formatAddress,
  formatFAN,
  formatXP,
  getNextTierThreshold,
  getTierColor,
  getTierName,
} from "@/lib/utils";
import { Copy, ExternalLink } from "lucide-react";
import { use } from "react";
import { toast } from "sonner";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: addr } = use(params);
  const address = addr as `0x${string}`;
  const { profile, tier, isLoading } = useProfile(address);
  const { balance } = useFanTokenBalance(address);
  const { contentIds } = useCreatorSubmissions(address);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 w-full bg-[#191f31] rounded-xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile || !profile.exists) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-lg text-[#86948a]">
            This address is not a registered CricketChain fan.
          </p>
          <p className="text-sm text-[#86948a] mt-2">
            {formatAddress(address)}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const tierName = getTierName(tier ?? 0);
  const tierColor = getTierColor(tier ?? 0);
  const tierBg = TIER_BG_COLORS[tierName] || "bg-amber-600/20";
  const xp = Number(profile.totalXP);
  const nextThreshold = getNextTierThreshold(xp);

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile card */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full border-4 border-[#10b981] flex items-center justify-center bg-[#191f31] text-3xl font-bold text-[#4edea3]">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-2xl font-bold text-[#dce1fb]">
                  {profile.username}
                </h1>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${tierBg} ${tierColor}`}
                >
                  {tierName} Tier
                </span>
              </div>
              <button
                onClick={copyAddress}
                className="flex items-center gap-1 mt-1 text-xs font-mono text-[#86948a] hover:text-[#4edea3] transition-colors"
              >
                <Copy className="h-3 w-3" /> {formatAddress(address)}
              </button>
              <a
                href={`${WIRESCAN_URL}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs text-[#38BDF8] hover:text-[#7bd0ff]"
              >
                View on WireScan <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-[#4edea3]">
              {formatXP(xp)}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">
              Total XP
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-[#dce1fb]">
              {Number(profile.matchesAttended)}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">
              Matches
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-[#dce1fb]">
              {Number(profile.contentSubmitted)}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">
              Content
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="font-mono text-2xl font-bold text-[#dce1fb]">
              {Number(profile.votesParticipated)}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">
              Votes
            </p>
          </div>
        </div>

        {/* FAN Balance & XP Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a] mb-2">
              FAN Token Balance
            </p>
            <p className="font-mono text-3xl font-bold text-[#F59E0B]">
              {balance !== undefined ? formatFAN(balance) : "—"}
            </p>
          </div>
          <div className="glass-card rounded-xl p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#86948a] mb-2">
              Next Tier
            </p>
            <p className="font-mono text-lg text-[#dce1fb]">
              {formatXP(xp)} / {formatXP(nextThreshold)} XP
            </p>
            <div className="h-2 bg-[#191f31] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#4edea3] rounded-full"
                style={{
                  width: `${Math.min((xp / nextThreshold) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Registered date */}
        <p className="text-xs text-[#86948a] text-center">
          Fan since{" "}
          {new Date(Number(profile.registeredAt) * 1000).toLocaleDateString(
            "en-US",
            {
              month: "long",
              day: "numeric",
              year: "numeric",
            },
          )}
        </p>
      </main>
      <Footer />
    </div>
  );
}
