'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { AgentStats } from '@/types';

const STAGES = [
  { id: 1, name: 'Attract',  desc: 'Share & Discovery',      color: '#40916C' },
  { id: 2, name: 'Engage',   desc: 'Conversations Started',   color: '#0077BE' },
  { id: 3, name: 'Convert',  desc: 'Products & Memberships',  color: '#D4AF37' },
  { id: 4, name: 'Delight',  desc: 'Referrals Generated',     color: '#9333EA' },
];

interface VelocityGaugeProps {
  score: number; // 0–100
}

function VelocityGauge({ score }: VelocityGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 140;
  const radius = 56;
  const strokeWidth = 12;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const startAngle = Math.PI * 0.75;
    const fullAngle  = Math.PI * 1.5;
    const endAngle   = startAngle + fullAngle * (score / 100);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + fullAngle);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth   = strokeWidth;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Filled arc
    const arcColor = score >= 70 ? '#D4AF37' : score >= 40 ? '#40916C' : '#9CA3AF';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = arcColor;
    ctx.lineWidth   = strokeWidth;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }, [score]);

  const label =
    score >= 70 ? 'Strong' : score >= 40 ? 'Steady' : 'Building';
  const labelColor =
    score >= 70 ? 'text-gold' : score >= 40 ? 'text-green-mid' : 'text-muted-foreground';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-foreground">{score}</span>
          <span className={cn('text-[11px] font-semibold uppercase tracking-wide', labelColor)}>
            {label}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Growth Momentum</p>
    </div>
  );
}

interface FlywheelVelocityProps {
  stats: AgentStats;
}

export function FlywheelVelocity({ stats }: FlywheelVelocityProps) {
  const maxCount = Math.max(...stats.flywheelStages.map((s) => s.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-1">Your Growth Journey</h3>
      <p className="text-xs text-muted-foreground mb-5">
        How people move from first contact to becoming part of your team.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Gauge */}
        <VelocityGauge score={stats.velocityScore} />

        {/* Funnel stages */}
        <div className="flex-1 w-full space-y-3">
          {STAGES.map((stage) => {
            const stageData = stats.flywheelStages.find((s) => s.stage === stage.id);
            const count = stageData?.count ?? 0;
            const pct = Math.round((count / maxCount) * 100);
            const prevCount = stage.id > 1
              ? (stats.flywheelStages.find((s) => s.stage === (stage.id - 1) as 1|2|3|4)?.count ?? 0)
              : count;
            const dropOff = prevCount > 0 ? Math.round((1 - count / prevCount) * 100) : 0;

            return (
              <div key={stage.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-semibold text-foreground">{stage.name}</span>
                    <span className="text-muted-foreground hidden sm:inline">{stage.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{count.toLocaleString()}</span>
                    {stage.id > 1 && dropOff > 0 && (
                      <span className="text-muted-foreground text-[10px]">({dropOff}% drop)</span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
