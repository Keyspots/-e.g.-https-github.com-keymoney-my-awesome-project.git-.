'use client';

import React from 'react';
import { HeroSection } from './HeroSection';
import { LeadMagnetForm } from './LeadMagnetForm';
import { Leaf } from 'lucide-react';
import type { Profile } from '@/types';

const GREETING: Record<string, string> = {
  Aloha:   'Aloha! 🌴',
  Hola:    'Hola! 🌺',
  Kumusta: 'Kumusta! 🏝️',
  Hello:   'Hello! 👋',
};

interface AgentLandingPageProps {
  agent: Profile;
}

export function AgentLandingPage({ agent }: AgentLandingPageProps) {
  const greeting = GREETING[agent.greeting_preference ?? 'Aloha'];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection agent={agent} greeting={greeting} />

      {/* Value propositions */}
      <section className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
          What you will receive
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: '🌿', title: 'A Personal Wellness Plan', desc: 'Built around your specific goals.' },
            { icon: '📖', title: 'Product Guidance',         desc: 'Know which Agara products fit your life.' },
            { icon: '🤝', title: 'Direct Access to Me',      desc: 'A real conversation, no pressure.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-border p-4 text-center shadow-sm">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* The form */}
        <LeadMagnetForm
          agentId={agent.id}
          agentSlug={agent.agent_slug ?? 'agent'}
          persona={agent.greeting_preference ?? 'Aloha'}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center">
        <div className="flex items-center justify-center gap-2 text-green-deep mb-2">
          <Leaf className="w-4 h-4" />
          <span className="text-sm font-semibold">Agara Life</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Distributed by {agent.full_name} &bull; {agent.region ?? 'Independent Distributor'}
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <button className="hover:text-foreground">English</button>
          <button className="hover:text-foreground">Español</button>
          <button className="hover:text-foreground">Filipino</button>
        </div>
      </footer>
    </div>
  );
}
