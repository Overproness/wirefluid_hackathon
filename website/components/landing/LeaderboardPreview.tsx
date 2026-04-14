"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useTotalFans } from "@/hooks/useProfile";
import { TIER_BG_COLORS } from "@/lib/constants";
import { CONTRACTS } from "@/lib/contracts";
import { formatAddress, getTierColor, getTierName } from "@/lib/utils";
import { useReadContract } from "wagmi";

function FanRow({ index }: { index: number }) {
  const { data: fanAddress } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: "allFans",
    args: [BigInt(index)],
  });

  const { data: profile } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: "getProfile",
    args: fanAddress ? [fanAddress as `0x${string}`] : undefined,
    query: { enabled: !!fanAddress },
  });

  const { data: tier } = useReadContract({
    ...CONTRACTS.FanIdentity,
    functionName: "getTier",
    args: fanAddress ? [fanAddress as `0x${string}`] : undefined,
    query: { enabled: !!fanAddress },
  });

  const { data: balance } = useReadContract({
    ...CONTRACTS.FanToken,
    functionName: "balanceOf",
    args: fanAddress ? [fanAddress as `0x${string}`] : undefined,
    query: { enabled: !!fanAddress },
  });

  if (!profile || !fanAddress) {
    return (
      <tr>
        <td colSpan={5} className="py-3 px-4">
          <Skeleton className="h-8 w-full bg-[#191f31]" />
        </td>
      </tr>
    );
  }

  const p = profile as { username: string; totalXP: bigint; exists: boolean };
  const tierNum = tier as number;
  const tierName = getTierName(tierNum);
  const tierColor = getTierColor(tierNum);
  const tierBg = TIER_BG_COLORS[tierName] || "bg-amber-600/20";
  const xp = Number(p.totalXP);
  const fan = balance ? Number(balance) / 1e18 : 0;

  return (
    <tr className="border-b border-[rgba(134,148,138,0.08)]">
      <td className="py-3 px-4 font-mono text-lg font-bold text-[#4edea3]">
        {String(index + 1).padStart(2, "0")}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#191f31] flex items-center justify-center text-xs font-bold text-[#4edea3]">
            {p.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-[#dce1fb]">{p.username}</p>
            <p className="text-xs font-mono text-[#86948a]">
              {formatAddress(fanAddress as string)}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${tierBg} ${tierColor}`}
        >
          {tierName}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#bbcabf]">
            Lvl. {Math.floor(xp / 100)}
          </span>
          <div className="flex-1 h-1.5 bg-[#191f31] rounded-full overflow-hidden max-w-[100px]">
            <div
              className="h-full bg-[#4edea3] rounded-full"
              style={{ width: `${Math.min(xp / 150, 100)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-[#86948a]">
            {Math.min(Math.round(xp / 150), 100)}%
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="font-mono text-sm font-bold text-[#F59E0B]">
          {Math.floor(fan).toLocaleString()}
        </span>
        <span className="font-mono text-xs text-[#bbcabf] ml-1">FAN</span>
      </td>
    </tr>
  );
}

export function LeaderboardPreview() {
  const { totalFans, isLoading } = useTotalFans();
  const count = totalFans ? Math.min(Number(totalFans), 5) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#dce1fb]">
            Stadium Elite
          </h2>
          <p className="text-sm text-[#bbcabf] mt-1">
            The highest-performing fans in the ecosystem this season.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(134,148,138,0.15)]">
              <th className="py-3 px-4 text-left font-mono text-xs uppercase tracking-widest text-[#86948a]">
                Rank
              </th>
              <th className="py-3 px-4 text-left font-mono text-xs uppercase tracking-widest text-[#86948a]">
                Fan Profile
              </th>
              <th className="py-3 px-4 text-left font-mono text-xs uppercase tracking-widest text-[#86948a]">
                Tier Badge
              </th>
              <th className="py-3 px-4 text-left font-mono text-xs uppercase tracking-widest text-[#86948a]">
                Experience Progress
              </th>
              <th className="py-3 px-4 text-right font-mono text-xs uppercase tracking-widest text-[#86948a]">
                Fan Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="py-3 px-4">
                    <Skeleton className="h-8 w-full bg-[#191f31]" />
                  </td>
                </tr>
              ))
            ) : count === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#86948a]">
                  No fans registered yet. Be the first!
                </td>
              </tr>
            ) : (
              Array.from({ length: count }).map((_, i) => (
                <FanRow key={i} index={i} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
