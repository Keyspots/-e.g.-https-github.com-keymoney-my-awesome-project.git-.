'use client';

import { useState } from 'react';
import { ArrowUpDown, Flame, Wind, Snowflake, ExternalLink } from 'lucide-react';
import type { Profile } from '@/types';

export interface AgentRow extends Profile {
  totalLeads: number;
  hotLeads: number;
  velocityScore: number;
  lastActive: string;  // ISO timestamp
}

interface AgentTableProps {
  agents: AgentRow[];
}

type SortKey = 'full_name' | 'region' | 'totalLeads' | 'hotLeads' | 'velocityScore' | 'lastActive';

const STATUS_BADGE: Record<string, { icon: React.ElementType; label: string; cls: string }> = {
  hot:  { icon: Flame,     label: '🔥 Hot',  cls: 'bg-red-100 text-red-700'   },
  warm: { icon: Wind,      label: '☀️ Warm', cls: 'bg-amber-100 text-amber-700' },
  cold: { icon: Snowflake, label: '❄️ Cold', cls: 'bg-blue-100 text-blue-700'  },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AgentTable({ agents }: AgentTableProps) {
  const [sortKey, setSortKey]   = useState<SortKey>('velocityScore');
  const [sortAsc, setSortAsc]   = useState(false);
  const [search, setSearch]     = useState('');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(false); }
  }

  const filtered = agents
    .filter((a) => {
      const q = search.toLowerCase();
      return (
        (a.full_name ?? '').toLowerCase().includes(q) ||
        (a.region ?? '').toLowerCase().includes(q) ||
        (a.agent_slug ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av: string | number = a[sortKey] ?? '';
      let bv: string | number = b[sortKey] ?? '';
      if (typeof av === 'string' && typeof bv === 'string') {
        av = av.toLowerCase(); bv = bv.toLowerCase();
      }
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  function SortBtn({ col }: { col: SortKey }) {
    return (
      <button
        onClick={() => toggleSort(col)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowUpDown className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">All Agents</h3>
        <input
          type="search"
          placeholder="Search agents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring w-40"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                { label: 'Agent',         key: 'full_name'     as SortKey },
                { label: 'Region',        key: 'region'        as SortKey },
                { label: 'Total Leads',   key: 'totalLeads'    as SortKey },
                { label: 'Hot Leads',     key: 'hotLeads'      as SortKey },
                { label: 'Velocity',      key: 'velocityScore' as SortKey },
                { label: 'Last Active',   key: 'lastActive'    as SortKey },
              ].map((col) => (
                <th key={col.key} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    {col.label} <SortBtn col={col.key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Link</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No agents found
                </td>
              </tr>
            ) : filtered.map((agent, i) => {
              const heat = agent.hotLeads > 0 && agent.hotLeads / agent.totalLeads > 0.3 ? 'hot'
                : agent.velocityScore >= 50 ? 'warm' : 'cold';
              const badge = STATUS_BADGE[heat];

              return (
                <tr
                  key={agent.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i < 3 ? 'bg-gold/5' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {i < 3 && (
                        <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center bg-gold text-white">
                          {i + 1}
                        </span>
                      )}
                      {agent.full_name ?? agent.agent_slug ?? 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{agent.region ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{agent.totalLeads}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                      {badge.label.split(' ')[0]} {agent.hotLeads}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${agent.velocityScore >= 70 ? 'bg-gold' : 'bg-primary'}`}
                          style={{ width: `${agent.velocityScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{agent.velocityScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {relativeTime(agent.lastActive)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/${agent.agent_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Page
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">{filtered.length} of {agents.length} agents</p>
      </div>
    </div>
  );
}
