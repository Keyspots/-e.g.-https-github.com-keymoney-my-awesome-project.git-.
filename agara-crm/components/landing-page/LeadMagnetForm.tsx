'use client';

import React, { useState } from 'react';
import { Leaf, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { GreetingPersona } from '@/types';

const HEALTH_GOALS = ['Longevity', 'Energy & Vitality', 'Weight Balance', 'Better Sleep'];
const URGENCY_OPTIONS = [
  { value: 'now',      label: 'I am ready to start now' },
  { value: 'soon',     label: 'I am exploring options' },
  { value: 'curious',  label: 'Just learning for now' },
];
const SOURCES = ['Instagram', 'TikTok', 'A Friend', 'Other'];

interface LeadMagnetFormProps {
  agentId: string;
  agentSlug: string;
  persona: GreetingPersona;
}

type Step = 1 | 2 | 3 | 4;

export function LeadMagnetForm({ agentId, agentSlug, persona }: LeadMagnetFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [goals,   setGoals]   = useState<string[]>([]);
  const [business, setBusiness] = useState(false);
  const [urgency, setUrgency] = useState('');
  const [source,  setSource]  = useState('');

  const startedAt = React.useRef(Date.now());

  function toggleGoal(goal: string) {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }

  async function handleSubmit() {
    if (!email || !name) { toast.error('Please add your name and email.'); return; }
    setLoading(true);

    const answers = [...goals, ...(business ? ['Business'] : []), urgency].filter(Boolean);
    const timeOnPage = Math.round((Date.now() - startedAt.current) / 1000);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentSlug,
          fullName: name,
          email,
          phone,
          answers,
          language: 'en',
          timeOnPage,
          personaSelected: persona,
          referralSource: source || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10 px-6 space-y-4">
        <CheckCircle className="w-14 h-14 text-green-deep mx-auto" />
        <h3 className="text-xl font-black text-foreground">Your blueprint is on the way! 🌿</h3>
        <p className="text-muted-foreground">
          Check your inbox. {persona === 'Aloha' ? 'A hui hou' : persona === 'Hola' ? 'Hasta pronto' : persona === 'Kumusta' ? 'Hanggang sa muli' : 'Talk soon'}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border shadow-xl p-6 space-y-6 max-w-md mx-auto">
      {/* Progress */}
      <div className="flex gap-1.5">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div
            key={s}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all',
              s <= step ? 'bg-green-deep' : 'bg-muted',
            )}
          />
        ))}
      </div>

      {/* Step 1: Contact */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Let us get started</h3>
            <p className="text-sm text-muted-foreground">How can I reach out to you?</p>
          </div>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-green-deep/30"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-green-deep/30"
          />
          <input
            type="tel"
            placeholder="Phone or WhatsApp (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-green-deep/30"
          />
          <button
            onClick={() => email && name && setStep(2)}
            disabled={!email || !name}
            className="w-full flex items-center justify-center gap-2 bg-green-deep text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-mid transition-colors disabled:opacity-40"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Health Goal */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">What matters most to you?</h3>
            <p className="text-sm text-muted-foreground">Choose all that apply.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {HEALTH_GOALS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left',
                  goals.includes(goal)
                    ? 'bg-green-deep text-white border-green-deep'
                    : 'bg-muted border-border text-foreground hover:border-green-deep/40',
                )}
              >
                {goal}
              </button>
            ))}
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={business}
              onChange={(e) => setBusiness(e.target.checked)}
              className="mt-0.5 accent-green-deep w-4 h-4"
            />
            <span className="text-sm text-foreground">
              I am also open to a business opportunity with Agara.
            </span>
          </label>
          <button
            onClick={() => goals.length > 0 && setStep(3)}
            disabled={goals.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-green-deep text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-mid transition-colors disabled:opacity-40"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 3: Urgency */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Where are you right now?</h3>
            <p className="text-sm text-muted-foreground">No right answer, just honest.</p>
          </div>
          <div className="space-y-2">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setUrgency(opt.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all',
                  urgency === opt.value
                    ? 'bg-green-deep text-white border-green-deep'
                    : 'bg-muted border-border text-foreground hover:border-green-deep/40',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => urgency && setStep(4)}
            disabled={!urgency}
            className="w-full flex items-center justify-center gap-2 bg-green-deep text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-mid transition-colors disabled:opacity-40"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 4: Source + submit */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">One last thing</h3>
            <p className="text-sm text-muted-foreground">How did you hear about me?</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map((s) => (
              <button
                key={s}
                onClick={() => setSource(s.toLowerCase())}
                className={cn(
                  'px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                  source === s.toLowerCase()
                    ? 'bg-green-deep text-white border-green-deep'
                    : 'bg-muted border-border text-foreground hover:border-green-deep/40',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gold text-green-deep py-3.5 rounded-xl font-bold text-sm hover:bg-gold-dark transition-colors disabled:opacity-60 shadow-md"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating your blueprint...</>
              : <><Leaf className="w-4 h-4" /> Get my Personal Wellness Blueprint</>
            }
          </button>
          <p className="text-xs text-muted-foreground text-center">
            No spam, ever. Just a personalized guide for you.
          </p>
        </div>
      )}
    </div>
  );
}
