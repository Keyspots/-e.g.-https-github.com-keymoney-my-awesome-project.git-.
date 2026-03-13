import { NextRequest, NextResponse } from 'next/server';
import { calculateLeadScore } from '@/lib/ai-engine/openai';
import { generateAlohaEmail } from '@/lib/ai-engine/emailTemplates';
import type { Locale, GreetingPersona, Lead, Profile } from '@/types';

interface LeadPayload {
  agentSlug:       string;
  fullName:        string;
  email:           string;
  phone?:          string;
  answers:         string[];
  language:        Locale;
  timeOnPage:      number;
  personaSelected: GreetingPersona;
  referralSource?: string;
}

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  let payload: LeadPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { agentSlug, fullName, email, phone, answers, language, timeOnPage, personaSelected, referralSource } = payload;

  if (!agentSlug || !email || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Missing required fields: agentSlug, email, answers' }, { status: 422 });
  }

  // ── Score the lead ────────────────────────────────────────────────────────
  const leadScore = await calculateLeadScore({ answers, language, timeOnPage, personaSelected });

  // ── Dev mode: return mock response without touching Supabase ─────────────
  if (!SUPABASE_CONFIGURED) {
    const mockLeadId = `dev-${Date.now()}`;

    return NextResponse.json({
      success:   true,
      leadId:    mockLeadId,
      score:     leadScore.score,
      category:  leadScore.category,
      action:    leadScore.recommendedAction,
      devMode:   true,
      message:   'Lead scored (dev mode — no Supabase, email not sent).',
    });
  }

  // ── Production: persist lead + trigger email ──────────────────────────────
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();

    // 1. Resolve agent profile from slug
    const { data: agentProfile, error: agentErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('agent_slug', agentSlug)
      .single();

    if (agentErr || !agentProfile) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // 2. Upsert lead (deduplicate by email + agent_id)
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .upsert(
        {
          agent_id:         agentProfile.id,
          email,
          full_name:        fullName,
          phone:            phone ?? null,
          status:           leadScore.category,
          ai_score:         leadScore.score / 100,
          flywheel_stage:   1,    // Attract
          last_interaction: new Date().toISOString(),
          source:           'landing_page',
          metadata: {
            answers,
            language,
            time_on_page:      timeOnPage,
            persona_selected:  personaSelected,
            referral_source:   referralSource ?? null,
          },
        },
        { onConflict: 'agent_id,email', ignoreDuplicates: false },
      )
      .select()
      .single();

    if (leadErr || !lead) {
      console.error('[API /leads] Insert error:', leadErr);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    // 3. Insert flywheel event (Attract stage)
    await supabase.from('flywheel_events').insert({
      agent_id:   agentProfile.id,
      lead_id:    lead.id,
      event_type: 'opt_in',
    });

    // 4. Generate + log Aloha email (actual sending wired to Supabase Edge Function)
    const emailHtml = generateAlohaEmail(lead as Lead, agentProfile as Profile);
    console.info('[API /leads] Email generated for lead:', lead.id, '— length:', emailHtml.length);

    return NextResponse.json({
      success:  true,
      leadId:   lead.id,
      score:    leadScore.score,
      category: leadScore.category,
      action:   leadScore.recommendedAction,
    });
  } catch (err) {
    console.error('[API /leads] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
