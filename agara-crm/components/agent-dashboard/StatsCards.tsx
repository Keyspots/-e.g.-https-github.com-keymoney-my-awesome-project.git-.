'use client';

import React from 'react';
import { Users, Flame, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStats } from '@/types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, subtext, iconBg, iconColor, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md',
        highlight ? 'border-gold/40 ring-1 ring-gold/20' : 'border-border',
      )}
    >
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', iconBg)}>
        <div className={cn('w-6 h-6', iconColor)}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-black text-foreground leading-tight">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

interface StatsCardsProps {
  stats: AgentStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const connectionRatePct = `${(stats.connectionRate * 100).toFixed(1)}%`;
  const velocityLabel =
    stats.velocityScore >= 70 ? 'Strong' : stats.velocityScore >= 40 ? 'Steady' : 'Building';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={<Users className="w-6 h-6" />}
        label="Total Members"
        value={stats.totalLeads}
        subtext="People in your community"
        iconBg="bg-green-pale"
        iconColor="text-green-deep"
      />
      <StatCard
        icon={<Flame className="w-6 h-6" />}
        label="Ready to Connect"
        value={stats.hotLeads}
        subtext="Warm and ready for a conversation"
        iconBg="bg-red-100"
        iconColor="text-red-600"
        highlight
      />
      <StatCard
        icon={<TrendingUp className="w-6 h-6" />}
        label="Connection Rate"
        value={connectionRatePct}
        subtext="Visitors who join your circle"
        iconBg="bg-yellow-50"
        iconColor="text-gold-dark"
      />
      <StatCard
        icon={<Zap className="w-6 h-6" />}
        label="Growth Momentum"
        value={`${stats.velocityScore}/100`}
        subtext={velocityLabel}
        iconBg="bg-blue-50"
        iconColor="text-aloha-teal"
      />
    </div>
  );
}
