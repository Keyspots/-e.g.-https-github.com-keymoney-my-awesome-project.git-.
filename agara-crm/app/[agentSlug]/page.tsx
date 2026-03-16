import { notFound } from 'next/navigation';
import { AgentLandingPage } from '@/components/landing-page';
import type { Profile } from '@/types';

// ─── Mock fallback for dev (no Supabase) ──────────────────────────────────────
const MOCK_AGENTS: Record<string, Profile> = {
  'sarah-jones': {
    id: 'mock-001',
    role: 'agent',
    full_name: 'Sarah Jones',
    photo_url: null,
    agent_slug: 'sarah-jones',
    region: 'Oahu Ohana',
    director_id: null,
    greeting_preference: 'Aloha',
    created_at: '2024-01-15T00:00:00Z',
  },
  'ana-reyes': {
    id: 'mock-002',
    role: 'agent',
    full_name: 'Ana Reyes',
    photo_url: null,
    agent_slug: 'ana-reyes',
    region: 'Maui Nui',
    director_id: null,
    greeting_preference: 'Kumusta',
    created_at: '2024-02-01T00:00:00Z',
  },
};

async function getAgent(slug: string): Promise<Profile | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Dev mode — return mock data
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return MOCK_AGENTS[slug] ?? {
      id: `mock-${slug}`,
      role: 'agent',
      full_name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      photo_url: null,
      agent_slug: slug,
      region: 'Island Ohana',
      director_id: null,
      greeting_preference: 'Aloha',
      created_at: new Date().toISOString(),
    };
  }

  // Production — query Supabase
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('agent_slug', slug)
    .eq('role', 'agent')
    .single();

  return data ?? null;
}

interface Props {
  params: { agentSlug: string };
}

export default async function AgentPublicPage({ params }: Props) {
  const agent = await getAgent(params.agentSlug);

  if (!agent) {
    notFound();
  }

  return <AgentLandingPage agent={agent} />;
}

export async function generateMetadata({ params }: Props) {
  const agent = await getAgent(params.agentSlug);

  if (!agent) {
    return { title: 'Agara Life' };
  }

  return {
    title: `${agent.full_name ?? 'Your Agara Distributor'} — Personalized Wellness Blueprint`,
    description: `Get your free personalized wellness plan from ${agent.full_name ?? 'an Agara Life distributor'}.`,
    openGraph: {
      title: `${agent.full_name} | Agara Life`,
      description: 'Download your free personalized wellness blueprint.',
      images: agent.photo_url ? [agent.photo_url] : [],
    },
  };
}
