'use client';

import React from 'react';
import { Map, TrendingUp, Globe, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegionStats } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  Hot:          'bg-red-100 text-red-700',
  Accelerating: 'bg-green-100 text-green-700',
  Steady:       'bg-blue-100 text-blue-700',
  Growing:      'bg-yellow-100 text-yellow-700',
};

const RANK_STYLES = [
  'bg-yellow-400 text-yellow-900',   // Gold
  'bg-gray-300  text-gray-800',      // Silver
  'bg-orange-300 text-orange-900',   // Bronze
];

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={cn('p-4 rounded-2xl text-white shrink-0', color)}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

interface TeamAlohaLeaderboardProps {
  regions: RegionStats[];
  totalAgents: number;
  leadVelocity: string;
  activeMarkets: string;
}

export function TeamAlohaLeaderboard({
  regions,
  totalAgents,
  leadVelocity,
  activeMarkets,
}: TeamAlohaLeaderboardProps) {
  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<Users className="w-6 h-6" />}    label="Total Distributors" value={totalAgents.toLocaleString()} color="bg-blue-500" />
        <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Growth Momentum"    value={leadVelocity}                 color="bg-green-500" />
        <StatCard icon={<Globe className="w-6 h-6" />}    label="Active Markets"       value={activeMarkets}               color="bg-orange-500" />
      </div>

      {/* Region table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Regional Momentum</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time community activity across all regions.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-teal-900 text-white">
              <tr>
                <th className="px-5 py-4 font-semibold text-sm">Rank</th>
                <th className="px-5 py-4 font-semibold text-sm">Region</th>
                <th className="px-5 py-4 font-semibold text-sm">Members</th>
                <th className="px-5 py-4 font-semibold text-sm hidden sm:table-cell">Connection Rate</th>
                <th className="px-5 py-4 font-semibold text-sm hidden md:table-cell">Primary Language</th>
                <th className="px-5 py-4 font-semibold text-sm hidden lg:table-cell">Top Distributor</th>
                <th className="px-5 py-4 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regions
                .sort((a, b) => b.momentumScore - a.momentumScore)
                .map((region, i) => (
                  <tr
                    key={region.region}
                    className={cn(
                      'hover:bg-slate-50 transition-colors',
                      i === 0 && 'bg-yellow-50/60',
                      i === 1 && 'bg-gray-50/60',
                      i === 2 && 'bg-orange-50/40',
                    )}
                  >
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                          i < 3 ? RANK_STYLES[i] : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Map className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-bold text-slate-700 text-sm">{region.region}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm font-medium">
                      {region.totalLeads.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-mono text-teal-600 font-bold text-sm hidden sm:table-cell">
                      {(region.conversionRate * 100).toFixed(0)}%
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-sm hidden md:table-cell">
                      {region.topLanguage}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-sm hidden lg:table-cell">
                      {region.topAgent}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-bold uppercase',
                          STATUS_STYLES[region.flywheelStatus] ?? 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {region.flywheelStatus}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
