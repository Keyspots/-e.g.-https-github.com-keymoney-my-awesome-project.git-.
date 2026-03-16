import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)   return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/** Convert raw 0–100 score to momentum category. */
export function getMomentumLabel(score: number): 'Hot' | 'Warm' | 'Cold' {
  if (score > 75) return 'Hot';
  if (score > 40) return 'Warm';
  return 'Cold';
}

export function getMomentumColor(category: 'Hot' | 'Warm' | 'Cold') {
  return {
    Hot:  'score-hot',
    Warm: 'score-warm',
    Cold: 'score-cold',
  }[category];
}

/** Compute velocity score (0–100) from average hours to first engagement. */
export function getVelocityScore(avgHoursToEngage: number, conversionRate: number): number {
  const speedScore = Math.max(0, 100 - avgHoursToEngage * 2);
  return Math.round(speedScore * 0.6 + conversionRate * 100 * 0.4);
}

/** Format number with K/M abbreviation. */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function getFlywheelStageName(stage: 1 | 2 | 3 | 4): string {
  return ['Attract', 'Engage', 'Convert', 'Delight'][stage - 1];
}
