'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Leaf, Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard/agent');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-sm p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-deep text-white">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-green-deep tracking-tight">Agara Life</span>
        </div>

        <h1 className="text-lg font-semibold text-foreground text-center mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Sign in to your distributor dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agaralife.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground" htmlFor="password">Password</label>
              <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-deep text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-green-mid transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Dev bypass banner */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-xs text-amber-700 font-medium mb-1">Development Mode</p>
            <p className="text-xs text-amber-600">No Supabase keys configured.</p>
            <Link
              href="/dashboard/agent"
              className="inline-block mt-2 text-xs font-semibold text-amber-700 underline"
            >
              Skip to Agent Dashboard →
            </Link>
            <span className="mx-2 text-amber-400">|</span>
            <Link
              href="/dashboard/director"
              className="inline-block mt-2 text-xs font-semibold text-amber-700 underline"
            >
              Director Dashboard →
            </Link>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          Not a distributor yet?{' '}
          <Link href="https://agaralife.com" target="_blank" className="text-primary hover:underline">
            Learn more about Agara Life
          </Link>
        </p>
      </div>
    </div>
  );
}
