import { DirectorDashboard } from '@/components/director-dashboard';
import type { AgentRow } from '@/components/director-dashboard/AgentTable';
import type { Profile, RegionStats } from '@/types';

// ─── Mock data (replace with Supabase queries once connected) ─────────────────

const MOCK_DIRECTOR: Profile = {
  id: 'mock-director-001',
  role: 'regional_director',
  full_name: 'David Kahananui',
  photo_url: null,
  agent_slug: null,
  region: 'Pacific West',
  director_id: null,
  greeting_preference: 'Aloha',
  created_at: '2023-09-01T00:00:00Z',
};

const MOCK_REGIONS: RegionStats[] = [
  {
    region: 'Oahu Ohana',
    agentCount: 48,
    totalLeads: 420,
    conversionRate: 0.18,
    topLanguage: 'English',
    momentumScore: 336,
    flywheelStatus: 'Hot',
    topAgent: 'Sarah Jones',
  },
  {
    region: 'Maui Health',
    agentCount: 22,
    totalLeads: 215,
    conversionRate: 0.12,
    topLanguage: 'Tagalog',
    momentumScore: 172,
    flywheelStatus: 'Steady',
    topAgent: 'Leilani Akana',
  },
  {
    region: 'Big Island Biz',
    agentCount: 19,
    totalLeads: 188,
    conversionRate: 0.24,
    topLanguage: 'Spanish',
    momentumScore: 225,
    flywheelStatus: 'Accelerating',
    topAgent: 'Carlos Rivera',
  },
  {
    region: 'Global Outreach',
    agentCount: 14,
    totalLeads: 95,
    conversionRate: 0.08,
    topLanguage: 'English',
    momentumScore: 76,
    flywheelStatus: 'Growing',
    topAgent: 'Priya Nair',
  },
];

const MOCK_AGENTS: AgentRow[] = [
  { id: 'a1', role: 'agent', full_name: 'Sarah Jones',    photo_url: null, agent_slug: 'sarah-jones',    region: 'Oahu Ohana',     director_id: 'mock-director-001', greeting_preference: 'Aloha',   created_at: '2024-01-15T00:00:00Z', totalLeads: 42, hotLeads: 7,  velocityScore: 72, lastActive: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'a2', role: 'agent', full_name: 'Leilani Akana',  photo_url: null, agent_slug: 'leilani-akana',  region: 'Maui Health',    director_id: 'mock-director-001', greeting_preference: 'Aloha',   created_at: '2024-02-01T00:00:00Z', totalLeads: 38, hotLeads: 5,  velocityScore: 65, lastActive: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'a3', role: 'agent', full_name: 'Carlos Rivera',  photo_url: null, agent_slug: 'carlos-rivera',  region: 'Big Island Biz', director_id: 'mock-director-001', greeting_preference: 'Hola',    created_at: '2024-01-20T00:00:00Z', totalLeads: 55, hotLeads: 12, velocityScore: 81, lastActive: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'a4', role: 'agent', full_name: 'Priya Nair',     photo_url: null, agent_slug: 'priya-nair',     region: 'Global Outreach',director_id: 'mock-director-001', greeting_preference: 'Hello',   created_at: '2024-03-01T00:00:00Z', totalLeads: 19, hotLeads: 2,  velocityScore: 41, lastActive: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'a5', role: 'agent', full_name: 'Maria Santos',   photo_url: null, agent_slug: 'maria-santos',   region: 'Oahu Ohana',     director_id: 'mock-director-001', greeting_preference: 'Kumusta', created_at: '2024-02-10T00:00:00Z', totalLeads: 31, hotLeads: 4,  velocityScore: 58, lastActive: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'a6', role: 'agent', full_name: 'John Dela Cruz', photo_url: null, agent_slug: 'john-dela-cruz', region: 'Maui Health',    director_id: 'mock-director-001', greeting_preference: 'Kumusta', created_at: '2024-03-05T00:00:00Z', totalLeads: 14, hotLeads: 1,  velocityScore: 33, lastActive: new Date(Date.now() - 48 * 3600000).toISOString() },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DirectorDashboardPage() {
  return <DirectorDashboard director={MOCK_DIRECTOR} regions={MOCK_REGIONS} agents={MOCK_AGENTS} />;
}
