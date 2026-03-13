import { DirectorDashboard } from '@/components/director-dashboard';
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DirectorDashboardPage() {
  return <DirectorDashboard director={MOCK_DIRECTOR} regions={MOCK_REGIONS} />;
}
