'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { XP_PER_ACTION } from '@/lib/constants';

interface XPBreakdownChartProps {
  profile: {
    totalXP: bigint;
    matchesAttended: bigint;
    votesParticipated: bigint;
    contentSubmitted: bigint;
  };
}

const COLORS = ['#4edea3', '#38BDF8', '#F59E0B'];

export function XPBreakdownChart({ profile }: XPBreakdownChartProps) {
  const attendance = Number(profile.matchesAttended) * XP_PER_ACTION.MATCH_ATTENDANCE;
  const governance = Number(profile.votesParticipated) * XP_PER_ACTION.VOTE;
  const content = Number(profile.contentSubmitted) * XP_PER_ACTION.CONTENT_APPROVED;
  const total = attendance + governance + content;

  const data = [
    { name: 'Attendance', value: attendance || 1 },
    { name: 'Governance', value: governance || 1 },
    { name: 'Content', value: content || 1 },
  ];

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-heading text-lg font-bold text-[#dce1fb] mb-4">XP Composition</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(25,31,49,0.95)',
                  border: '1px solid rgba(134,148,138,0.15)',
                  borderRadius: '8px',
                  color: '#dce1fb',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-[#dce1fb]">{Number(profile.totalXP)}</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#86948a]">Total XP</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {[
            { label: 'Attendance', pct: total > 0 ? Math.round((attendance / total) * 100) : 33, color: '#4edea3' },
            { label: 'Governance', pct: total > 0 ? Math.round((governance / total) * 100) : 33, color: '#38BDF8' },
            { label: 'Content', pct: total > 0 ? Math.round((content / total) * 100) : 34, color: '#F59E0B' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-[#bbcabf] flex-1">{item.label}</span>
              <span className="font-mono text-sm text-[#dce1fb]">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
