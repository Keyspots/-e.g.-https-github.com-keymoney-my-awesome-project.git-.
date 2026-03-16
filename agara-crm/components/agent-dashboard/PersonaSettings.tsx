'use client';

import React, { useState } from 'react';
import { Settings2, Check } from 'lucide-react';
import type { GreetingPersona } from '@/types';

const PERSONAS: { value: GreetingPersona; label: string; region: string }[] = [
  { value: 'Aloha',   label: 'Aloha! 🌴',    region: 'Hawaii' },
  { value: 'Hola',    label: 'Hola! 🌺',     region: 'Latin America' },
  { value: 'Kumusta', label: 'Kumusta! 🏝️',  region: 'Philippines' },
  { value: 'Hello',   label: 'Hello! 👋',    region: 'All Markets' },
];

interface PersonaSettingsProps {
  current: GreetingPersona;
  onChange: (persona: GreetingPersona) => void;
}

export function PersonaSettings({ current, onChange }: PersonaSettingsProps) {
  const [open, setOpen] = useState(false);
  const selected = PERSONAS.find((p) => p.value === current) ?? PERSONAS[0];

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Settings2 className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Greeting Style</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Choose how you welcome people when they open your personal page and receive your follow-up.
      </p>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted rounded-xl border border-border text-sm font-medium text-foreground hover:border-green-deep/40 transition-colors"
        >
          <span>{selected.label}</span>
          <span className="text-xs text-muted-foreground">{selected.region}</span>
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden">
            {PERSONAS.map((persona) => (
              <button
                key={persona.value}
                onClick={() => { onChange(persona.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
              >
                <span className="font-medium">{persona.label}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {persona.region}
                  {current === persona.value && <Check className="w-3.5 h-3.5 text-green-deep" />}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
