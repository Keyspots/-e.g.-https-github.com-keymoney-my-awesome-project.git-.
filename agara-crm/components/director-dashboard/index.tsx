'use client';

import React, { useState } from 'react';
import { BarChart3, Users, LayoutDashboard } from 'lucide-react';
import { TeamAlohaLeaderboard } from './TeamAlohaLeaderboard';
import { TeamOverview } from './TeamOverview';
import { AgentTable, type AgentRow } from './AgentTable';
import { cn } from '@/lib/utils';
import type { RegionStats, Profile } from '@/types';

const TABS = [
  { id: 'overview',  label: 'Overview',       icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'leaderboard', label: 'Team Momentum', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'agents',    label: 'All Distributors', icon: <Users className="w-4 h-4" /> },
];

interface DirectorDashboardProps {
  director: Profile;
  regions: RegionStats[];
  agents?: AgentRow[];
}

export function DirectorDashboard({ director, regions, agents = [] }: DirectorDashboardProps) {
  const [tab, setTab] = useState('leaderboard');

  const totalAgents = regions.reduce((s, r) => s + r.agentCount, 0);
  const totalLeads  = regions.reduce((s, r) => s + r.totalLeads, 0);
  const avgRate     = regions.length
    ? regions.reduce((s, r) => s + r.conversionRate, 0) / regions.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">
          Aloha, {director.full_name?.split(' ')[0] ?? 'Director'}! 🏝️
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is how your team is growing across all regions.
        </p>
      </div>

      {/* Quick top-line numbers */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Community Members', value: totalLeads.toLocaleString(), color: 'text-green-deep' },
          { label: 'Active Distributors',     value: totalAgents.toLocaleString(), color: 'text-aloha-teal' },
          { label: 'Team Connection Rate',    value: `${(avgRate * 100).toFixed(1)}%`, color: 'text-gold-dark' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-border p-4 shadow-sm text-center">
            <p className={cn('text-2xl font-black', item.color)}>{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'leaderboard' && (
        <TeamAlohaLeaderboard
          regions={regions}
          totalAgents={totalAgents}
          leadVelocity="+22%"
          activeMarkets="3 (EN, ES, TL)"
        />
      )}

      {tab === 'overview' && (
        <TeamOverview regions={regions} />
      )}

      {tab === 'agents' && (
        <AgentTable agents={agents} />
      )}
    </div>
  );
}
