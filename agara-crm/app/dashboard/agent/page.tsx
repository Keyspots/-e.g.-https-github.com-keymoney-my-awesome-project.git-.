import { AgentDashboard } from '@/components/agent-dashboard';
import type { AgentStats, Lead, Profile } from '@/types';

// ─── Mock data (replace with Supabase queries once connected) ─────────────────

const MOCK_AGENT: Profile = {
  id: 'mock-agent-001',
  role: 'agent',
  full_name: 'Sarah Jones',
  photo_url: null,
  agent_slug: 'sarah-jones',
  region: 'Oahu Ohana',
  director_id: null,
  greeting_preference: 'Aloha',
  created_at: '2024-01-15T00:00:00Z',
};

function makeHeatmapData(): { date: string; count: number }[] {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 8),
    });
  }
  return data;
}

const MOCK_STATS: AgentStats = {
  totalLeads: 42,
  hotLeads: 7,
  connectionRate: 0.18,
  velocityScore: 64,
  leadsLast30Days: makeHeatmapData(),
  flywheelStages: [
    { stage: 1, name: 'Attract',  count: 42 },
    { stage: 2, name: 'Engage',   count: 28 },
    { stage: 3, name: 'Convert',  count: 11 },
    { stage: 4, name: 'Delight',  count: 4  },
  ],
};

const MOCK_LEADS: Lead[] = [
  {
    id: '1', agent_id: 'mock-agent-001',
    email: 'maria.santos@email.com', full_name: 'Maria Santos', phone: null,
    status: 'Hot', ai_score: 0.88, flywheel_stage: 3,
    opted_in_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    last_interaction: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    source: 'landing_page',
    metadata: { answers: ['Longevity', 'Business'], language: 'tl', referral_source: 'instagram' },
  },
  {
    id: '2', agent_id: 'mock-agent-001',
    email: 'john.dela.cruz@gmail.com', full_name: 'John Dela Cruz', phone: null,
    status: 'Warm', ai_score: 0.55, flywheel_stage: 2,
    opted_in_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    last_interaction: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    source: 'landing_page',
    metadata: { answers: ['Energy', 'Weight'], language: 'en', referral_source: 'friend' },
  },
  {
    id: '3', agent_id: 'mock-agent-001',
    email: 'ana.reyes@email.com', full_name: 'Ana Reyes', phone: null,
    status: 'Warm', ai_score: 0.62, flywheel_stage: 2,
    opted_in_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    last_interaction: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    source: 'landing_page',
    metadata: { answers: ['Longevity'], language: 'es', referral_source: 'instagram' },
  },
  {
    id: '4', agent_id: 'mock-agent-001',
    email: 'mark.garcia@email.com', full_name: 'Mark Garcia', phone: null,
    status: 'Cold', ai_score: 0.22, flywheel_stage: 1,
    opted_in_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    last_interaction: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    source: 'landing_page',
    metadata: { answers: ['Energy'], language: 'en', referral_source: 'tiktok' },
  },
  {
    id: '5', agent_id: 'mock-agent-001',
    email: 'lei.nakamura@gmail.com', full_name: 'Lei Nakamura', phone: null,
    status: 'Hot', ai_score: 0.91, flywheel_stage: 3,
    opted_in_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    last_interaction: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    source: 'landing_page',
    metadata: { answers: ['Business', 'Longevity'], language: 'en', referral_source: 'instagram' },
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentDashboardPage() {
  return (
    <AgentDashboard
      agent={MOCK_AGENT}
      stats={MOCK_STATS}
      recentLeads={MOCK_LEADS}
    />
  );
}
