import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// When Supabase is not configured (local dev without .env.local),
// skip auth checks so the UI can be previewed with mock data.
const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // ── Dev bypass: no Supabase keys → allow all dashboard routes ────────────
  if (!SUPABASE_CONFIGURED) {
    const path = request.nextUrl.pathname;
    if (path === '/dashboard' || path === '/dashboard/') {
      return NextResponse.redirect(new URL('/dashboard/agent', request.url));
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // ── 1. Unauthenticated users ─────────────────────────────────────────────
  if (!user) {
    if (path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // ── 2. Fetch profile (role + subscription) ───────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // ── 3. Subscription gating ───────────────────────────────────────────────
  if (path.startsWith('/dashboard')) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('agent_id', user.id)
      .maybeSingle();

    const isActive = !subscription || subscription.status === 'active';

    if (!isActive) {
      await supabase
        .from('leads')
        .update({ routed_to: 'DIRECTOR' })
        .eq('agent_id', user.id)
        .eq('routed_to', null);

      return NextResponse.redirect(new URL('/billing/renew', request.url));
    }
  }

  // ── 4. Director-only routes ───────────────────────────────────────────────
  if (path.startsWith('/dashboard/director')) {
    if (profile?.role !== 'regional_director') {
      return NextResponse.redirect(new URL('/dashboard/agent', request.url));
    }
  }

  // ── 5. Agent routes — redirect directors to their view ───────────────────
  if (path === '/dashboard' || path === '/dashboard/') {
    const target = profile?.role === 'regional_director'
      ? '/dashboard/director'
      : '/dashboard/agent';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/leads/:path*',
  ],
};
