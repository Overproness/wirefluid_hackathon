"use client";

import { Coins, Film, Landmark, Vote } from "lucide-react";

interface StatsGridProps {
  profile: {
    matchesAttended: bigint;
    contentSubmitted: bigint;
    votesParticipated: bigint;
  };
}

export function StatsGrid({ profile }: StatsGridProps) {
  const stats = [
    {
      icon: Landmark,
      label: "Matches Attended",
      value: Number(profile.matchesAttended),
      color: "#4edea3",
    },
    {
      icon: Film,
      label: "Content Submitted",
      value: Number(profile.contentSubmitted),
      color: "#38BDF8",
    },
    {
      icon: Vote,
      label: "Votes Cast",
      value: Number(profile.votesParticipated),
      color: "#a78bfa",
    },
    {
      icon: Coins,
      label: "Revenue Earned",
      value: "0.45",
      suffix: "WIRE",
      color: "#F59E0B",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <Icon className="h-5 w-5 mb-2" style={{ color: stat.color }} />
            <p className="font-mono text-2xl font-bold text-[#dce1fb]">
              {typeof stat.value === "number" ? stat.value : stat.value}
              {stat.suffix && (
                <span className="text-sm text-[#bbcabf] ml-1">
                  {stat.suffix}
                </span>
              )}
            </p>
            <p className="text-xs font-mono uppercase tracking-widest text-[#86948a] mt-1">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
