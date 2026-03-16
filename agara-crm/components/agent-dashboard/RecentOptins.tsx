'use client';

import React, { useState } from 'react';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { cn, timeAgo, getMomentumColor } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types';

const STATUS_EMOJI: Record<LeadStatus, string> = {
  Hot:  '🔥',
  Warm: '☀️',
  Cold: '❄️',
};

const SOURCE_LABEL: Record<string, string> = {
  landing_page: 'Your Page',
  instagram:    'Instagram',
  tiktok:       'TikTok',
  friend:       'Friend',
};

type SortKey = 'opted_in_at' | 'ai_score' | 'status';

interface RecentOptinsProps {
  leads: Lead[];
  onRescore?: (leadId: string) => void;
}

export function RecentOptins({ leads, onRescore }: RecentOptinsProps) {
  const [sortKey, setSortKey] = useState<SortKey>('opted_in_at');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...leads].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'opted_in_at') {
      cmp = new Date(a.opted_in_at).getTime() - new Date(b.opted_in_at).getTime();
    } else if (sortKey === 'ai_score') {
      cmp = a.ai_score - b.ai_score;
    } else if (sortKey === 'status') {
      const order: Record<LeadStatus, number> = { Hot: 0, Warm: 1, Cold: 2 };
      cmp = order[a.status] - order[b.status];
    }
    return sortAsc ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">New Community Members</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            People who recently joined through your page
          </p>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {leads.length} total
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Person</th>
              <th
                className="text-left px-3 py-3 font-semibold cursor-pointer hover:text-foreground"
                onClick={() => toggleSort('status')}
              >
                <span className="flex items-center gap-1">
                  Readiness <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th
                className="text-left px-3 py-3 font-semibold cursor-pointer hover:text-foreground hidden sm:table-cell"
                onClick={() => toggleSort('opted_in_at')}
              >
                <span className="flex items-center gap-1">
                  Joined <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">Source</th>
              <th className="text-center px-3 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((lead) => (
              <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div>
                    <p className="font-medium text-foreground">
                      {lead.full_name ?? 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
                      getMomentumColor(lead.status),
                    )}
                  >
                    {STATUS_EMOJI[lead.status]} {lead.status}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">
                  {timeAgo(lead.opted_in_at)}
                </td>
                <td className="px-3 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                  {SOURCE_LABEL[lead.metadata?.referral_source ?? lead.source] ?? lead.source}
                </td>
                <td className="px-3 py-3.5 text-center">
                  {onRescore && (
                    <button
                      onClick={() => onRescore(lead.id)}
                      title="Refresh readiness score"
                      className="text-muted-foreground hover:text-green-deep transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mx-auto" />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">
                  <p className="text-2xl mb-2">🌱</p>
                  Share your link to start welcoming people into your community.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
