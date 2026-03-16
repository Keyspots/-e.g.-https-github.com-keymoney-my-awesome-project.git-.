'use client';

import React, { useState, useRef } from 'react';
import { Copy, Check, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareLinkCardProps {
  agentSlug: string;
  totalLeads: number;
  velocityScore: number;
}

export function ShareLinkCard({ agentSlug, totalLeads, velocityScore }: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shareUrl = `agaralife.com/distributor/${agentSlug}`;
  const fullUrl  = `https://agaralife.com/distributor/${agentSlug}`;

  function handleCopy() {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast.success('Link copied! 🌴 Go share it!');
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Your Personal Page</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Share this link and let your story do the work.
        </p>
      </div>

      {/* URL input + copy button */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={shareUrl}
          onClick={() => inputRef.current?.select()}
          className={cn(
            'flex-1 min-w-0 px-3 py-2 bg-muted rounded-xl border text-sm font-mono',
            'text-aloha-teal border-border focus:outline-none focus:ring-2 focus:ring-green-deep/30',
          )}
        />
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0',
            copied
              ? 'bg-green-pale text-green-deep'
              : 'bg-green-deep text-white hover:bg-green-mid active:scale-95',
          )}
        >
          {copied
            ? <><Check className="w-4 h-4" /> Copied!</>
            : <><Copy className="w-4 h-4" /> Copy Link</>
          }
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 bg-green-pale/40 rounded-xl border border-green-pale">
          <div className="w-8 h-8 bg-green-deep rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xl font-black text-green-deep leading-tight">{totalLeads}</p>
            <p className="text-[10px] text-green-mid uppercase tracking-wide font-semibold">People Joined</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xl font-black text-gold-dark leading-tight">{velocityScore}</p>
            <p className="text-[10px] text-gold-dark uppercase tracking-wide font-semibold">Momentum Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
