'use client';

import { Users, TrendingUp, Flame, Zap } from 'lucide-react';
import type { RegionStats } from '@/types';

interface TeamOverviewProps {
  regions: RegionStats[];
}

const STATUS_COLORS: Record<string, string> = {
  Hot:          'bg-red-100 text-red-700',
  Accelerating: 'bg-amber-100 text-amber-700',
  Steady:       'bg-green-100 text-green-700',
  Growing:      'bg-blue-100 text-blue-700',
};

export function TeamOverview({ regions }: TeamOverviewProps) {
  const totalAgents  = regions.reduce((s, r) => s + r.agentCount, 0);
  const totalLeads   = regions.reduce((s, r) => s + r.totalLeads, 0);
  const hotLeads     = regions.reduce((s, r) => s + Math.round(r.totalLeads * r.conversionRate * 2), 0);
  const avgMomentum  = regions.length
    ? Math.round(regions.reduce((s, r) => s + r.momentumScore, 0) / regions.length)
    : 0;

  const summaryCards = [
    { label: 'Total Agents',    value: totalAgents,            icon: Users,      color: 'text-green-deep', bg: 'bg-green-light/30' },
    { label: 'Total Leads',     value: totalLeads.toLocaleString(), icon: TrendingUp, color: 'text-primary',    bg: 'bg-secondary/40'   },
    { label: 'Hot Leads',       value: hotLeads,               icon: Flame,      color: 'text-red-600',    bg: 'bg-red-50'         },
    { label: 'Avg Momentum',    value: `${avgMomentum}`,       icon: Zap,        color: 'text-gold',       bg: 'bg-amber-50'       },
  ];

  return (
    <div className="space-y-6">
      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Region breakdown tiles */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Region Breakdown</h3>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {regions.map((region) => (
            <div key={region.region} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">{region.region}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[region.flywheelStatus] ?? 'bg-muted text-muted-foreground'}`}>
                  {region.flywheelStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{region.agentCount}</p>
                  <p className="text-xs text-muted-foreground">Agents</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{region.totalLeads}</p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gold">{region.momentumScore}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Top agent: <span className="font-medium text-foreground">{region.topAgent}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Top language: <span className="font-medium text-foreground">{region.topLanguage}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
