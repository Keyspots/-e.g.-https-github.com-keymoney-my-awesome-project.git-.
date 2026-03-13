'use client';

import React from 'react';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import type { Profile } from '@/types';

interface HeroSectionProps {
  agent: Profile;
  greeting: string;
}

export function HeroSection({ agent, greeting }: HeroSectionProps) {
  const firstName = agent.full_name?.split(' ')[0] ?? 'Your Guide';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-deep via-green-mid to-green-light text-white py-16 px-6">
      {/* Tropical leaf SVG decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg viewBox="0 0 600 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <path d="M-50 350 Q150 100 300 50 Q450 100 650 350 Q450 250 300 280 Q150 250 -50 350Z" fill="white" />
          <path d="M400 -30 Q550 100 600 300 Q500 200 400 250 Q350 150 400 -30Z" fill="white" opacity="0.5" />
        </svg>
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Agara badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Leaf className="w-3.5 h-3.5 text-gold-light" />
          Agara Life Wellness
        </div>

        {/* Agent photo */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-white/40 overflow-hidden bg-green-mid shadow-xl">
              {agent.photo_url ? (
                <Image
                  src={agent.photo_url}
                  alt={agent.full_name ?? 'Agent'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/80">
                  {firstName[0]}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold rounded-full border-2 border-white flex items-center justify-center">
              <Leaf className="w-4 h-4 text-green-deep" />
            </div>
          </div>
        </div>

        {/* Greeting + name */}
        <p className="text-lg text-white/80 font-medium mb-1">{greeting}</p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
          I am {agent.full_name ?? 'your Agara guide'}
        </h1>
        <p className="text-base text-white/80 max-w-md mx-auto leading-relaxed">
          I help people discover how simple, natural choices create lasting energy, clarity, and vitality.
          Let me put together your personal wellness starting point.
        </p>
      </div>
    </section>
  );
}
