'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface DayData {
  date: string;   // ISO yyyy-mm-dd
  count: number;
}

interface LeadHeatmapProps {
  data: DayData[];
  title?: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getIntensityClass(count: number, max: number): string {
  if (count === 0 || max === 0) return 'bg-gray-100';
  const ratio = count / max;
  if (ratio < 0.2) return 'bg-green-pale';
  if (ratio < 0.4) return 'bg-green-light/60';
  if (ratio < 0.6) return 'bg-green-light';
  if (ratio < 0.8) return 'bg-green-mid';
  return 'bg-green-deep';
}

export function LeadHeatmap({ data, title = 'Activity Over the Past 30 Days' }: LeadHeatmapProps) {
  const { weeks, maxCount, total } = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const today = new Date();
    const days: DayData[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ date: key, count: map.get(key) ?? 0 });
    }

    // Pad start to Monday alignment
    const firstDow = (new Date(days[0].date).getDay() + 6) % 7; // 0=Mon
    const padded: (DayData | null)[] = [
      ...Array(firstDow).fill(null),
      ...days,
    ];

    // Chunk into weeks
    const weeks: (DayData | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const total = data.reduce((s, d) => s + d.count, 0);
    return { weeks, maxCount, total };
  }, [data]);

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total} new {total === 1 ? 'person' : 'people'} joined your community
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          {['bg-gray-100', 'bg-green-pale', 'bg-green-light', 'bg-green-mid', 'bg-green-deep'].map((cls) => (
            <div key={cls} className={cn('w-3 h-3 rounded-sm', cls)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {/* Day labels column */}
        <div className="flex flex-col gap-1 mr-1 shrink-0">
          <div className="h-4" /> {/* spacer for month label row */}
          {DAY_LABELS.map((label, i) => (
            <div key={label} className={cn('h-4 w-8 text-[10px] text-muted-foreground leading-4', i % 2 === 0 ? '' : 'invisible')}>
              {label}
            </div>
          ))}
        </div>

        {/* Weeks grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            <div className="h-4 text-[10px] text-muted-foreground leading-4 w-4" />
            {Array.from({ length: 7 }).map((_, di) => {
              const day = week[di];
              return (
                <div
                  key={di}
                  title={day ? `${day.date}: ${day.count} new member${day.count !== 1 ? 's' : ''}` : ''}
                  className={cn(
                    'w-4 h-4 rounded-sm transition-opacity hover:opacity-80 cursor-default',
                    day ? getIntensityClass(day.count, maxCount) : 'opacity-0',
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
