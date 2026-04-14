'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import { useFanTokenBalance } from '@/hooks/useFanToken';
import { useCreatorSubmissions, useContentCount } from '@/hooks/useContent';
import { FanProfileCard } from './FanProfileCard';
import { StatsGrid } from './StatsGrid';
import { XPBreakdownChart } from './XPBreakdownChart';
import { MyContentSection } from './MyContentSection';
import { ActiveProposalsCTA } from './ActiveProposalsCTA';
import { MyTicketsSection } from './MyTicketsSection';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardContent() {
  const { address } = useAccount();
  const { profile, tier, isLoading } = useProfile();
  const { balance } = useFanTokenBalance();

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full bg-[#191f31] rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 bg-[#191f31] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-[#dce1fb] uppercase">
          Welcome back, {profile.username}
        </h1>
        <p className="text-[#bbcabf] text-sm mt-1">
          Your arena performance is peaking. Check your rewards below.
        </p>
      </div>

      {/* Active Proposals CTA */}
      <ActiveProposalsCTA />

      {/* Profile Card */}
      <FanProfileCard profile={profile} tier={tier ?? 0} balance={balance} />

      {/* Stats Grid */}
      <StatsGrid profile={profile} />

      {/* XP Chart + Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <XPBreakdownChart profile={profile} />
        <MyContentSection />
      </div>

      {/* My Tickets */}
      <MyTicketsSection />
    </div>
  );
}
