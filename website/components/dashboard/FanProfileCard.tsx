'use client';

import { useAccount } from 'wagmi';
import { formatAddress, getTierName, getTierColor, formatFAN, getNextTierThreshold, formatXP } from '@/lib/utils';
import { TIER_BG_COLORS, TIER_THRESHOLDS } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface FanProfileCardProps {
  profile: {
    username: string;
    totalXP: bigint;
    matchesAttended: bigint;
    votesParticipated: bigint;
    contentSubmitted: bigint;
    registeredAt: bigint;
    exists: boolean;
  };
  tier: number;
  balance: bigint | undefined;
}

export function FanProfileCard({ profile, tier, balance }: FanProfileCardProps) {
  const { address } = useAccount();
  const tierName = getTierName(tier);
  const tierColor = getTierColor(tier);
  const tierBg = TIER_BG_COLORS[tierName] || 'bg-amber-600/20';
  const xp = Number(profile.totalXP);
  const nextThreshold = getNextTierThreshold(xp);
  const thresholdValues = Object.values(TIER_THRESHOLDS);
  const currentThreshold = thresholdValues.filter((t) => t <= xp).pop() ?? 0;
  const progress = nextThreshold > currentThreshold ? ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied!');
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="h-16 w-16 rounded-full border-4 border-[#10b981] flex items-center justify-center bg-[#191f31] text-2xl font-bold text-[#4edea3]">
          {profile.username.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-heading text-xl font-bold text-[#dce1fb]">
              {profile.username}
            </h2>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${tierBg} ${tierColor}`}>
              {tierName} Tier
            </span>
          </div>

          <button onClick={copyAddress} className="flex items-center gap-1 mt-1 text-xs font-mono text-[#86948a] hover:text-[#4edea3] transition-colors">
            <Copy className="h-3 w-3" />
            {address ? formatAddress(address) : ''}
          </button>

          {/* XP Progress */}
          <div className="mt-3 max-w-sm">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#bbcabf]">
                {formatXP(xp)} / {formatXP(nextThreshold)} to {getTierName(Math.min(tier + 1, 4))}
              </span>
              <span className="font-mono text-[#4edea3]">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-[#0c1324] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#4edea3] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* FAN Balance */}
        {balance !== undefined && (
          <div className="text-right">
            <p className="font-mono text-2xl font-bold text-[#F59E0B]">
              {formatFAN(balance)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
