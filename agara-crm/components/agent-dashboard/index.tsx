'use client';

import React, { useState } from 'react';
import { StatsCards } from './StatsCards';
import { LeadHeatmap } from './LeadHeatmap';
import { FlywheelVelocity } from './FlywheelVelocity';
import { RecentOptins } from './RecentOptins';
import { ShareLinkCard } from './ShareLinkCard';
import { PersonaSettings } from './PersonaSettings';
import type { AgentStats, Lead, GreetingPersona, Profile } from '@/types';

interface AgentDashboardProps {
  agent: Profile;
  stats: AgentStats;
  recentLeads: Lead[];
}

export function AgentDashboard({ agent, stats, recentLeads }: AgentDashboardProps) {
  const [persona, setPersona] = useState<GreetingPersona>(agent.greeting_preference ?? 'Aloha');

  function handleRescore(leadId: string) {
    // TODO: call /api/leads/[leadId]/rescore
    console.log('Re-scoring lead:', leadId);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">
          {persona === 'Aloha'   && `Aloha, ${agent.full_name?.split(' ')[0] ?? 'Friend'}! 🌴`}
          {persona === 'Hola'    && `Hola, ${agent.full_name?.split(' ')[0] ?? 'Amigo'}! 🌺`}
          {persona === 'Kumusta' && `Kumusta, ${agent.full_name?.split(' ')[0] ?? 'Ka-partner'}! 🏝️`}
          {persona === 'Hello'   && `Hello, ${agent.full_name?.split(' ')[0] ?? 'there'}! 👋`}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is a snapshot of your community and how it is growing.
        </p>
      </div>

      {/* KPI Cards */}
      <StatsCards stats={stats} />

      {/* Middle row: Heatmap + Share Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeadHeatmap data={stats.leadsLast30Days} />
        </div>
        <div className="space-y-4">
          <ShareLinkCard
            agentSlug={agent.agent_slug ?? 'your-name'}
            totalLeads={stats.totalLeads}
            velocityScore={stats.velocityScore}
          />
          <PersonaSettings current={persona} onChange={setPersona} />
        </div>
      </div>

      {/* Flywheel journey */}
      <FlywheelVelocity stats={stats} />

      {/* Recent community members */}
      <RecentOptins leads={recentLeads} onRescore={handleRescore} />
    </div>
  );
}
