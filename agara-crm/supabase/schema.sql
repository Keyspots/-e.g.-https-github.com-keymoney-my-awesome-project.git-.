-- ============================================================
-- AGARA LIFE CRM — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor after project creation.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
-- Extends auth.users; one row per Agara distributor or director.
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role                 TEXT        NOT NULL DEFAULT 'agent'
                                   CHECK (role IN ('agent', 'regional_director')),
  full_name            TEXT,
  photo_url            TEXT,
  agent_slug           TEXT        UNIQUE,   -- public landing page: /[agent_slug]
  region               TEXT,
  director_id          UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  greeting_preference  TEXT        NOT NULL DEFAULT 'Aloha'
                                   CHECK (greeting_preference IN ('Aloha', 'Hola', 'Kumusta', 'Hello')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Subscriptions ───────────────────────────────────────────
-- Track agent billing status for middleware gating.
CREATE TABLE IF NOT EXISTS subscriptions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'inactive', 'trial', 'cancelled')),
  plan        TEXT        NOT NULL DEFAULT 'starter',
  renews_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Leads ───────────────────────────────────────────────────
-- People who opt in through an agent's personal landing page.
CREATE TABLE IF NOT EXISTS leads (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email            TEXT        NOT NULL,
  full_name        TEXT,
  phone            TEXT,
  status           TEXT        NOT NULL DEFAULT 'Cold'
                               CHECK (status IN ('Hot', 'Warm', 'Cold')),
  ai_score         FLOAT       NOT NULL DEFAULT 0.0
                               CHECK (ai_score >= 0.0 AND ai_score <= 1.0),
  flywheel_stage   INTEGER     NOT NULL DEFAULT 1
                               CHECK (flywheel_stage BETWEEN 1 AND 4),
  opted_in_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_interaction TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source           TEXT        NOT NULL DEFAULT 'landing_page',
  routed_to        TEXT,       -- 'DIRECTOR' when agent subscription is inactive
  metadata         JSONB       NOT NULL DEFAULT '{}',
  UNIQUE (agent_id, email)
);

-- ── Flywheel Events ─────────────────────────────────────────
-- Tracks each milestone as a person moves through the 4 stages.
-- Stage 1: Attract  — opt_in, social_share
-- Stage 2: Engage   — email_open, pdf_download, whatsapp_reply
-- Stage 3: Convert  — product_purchase, enrollment
-- Stage 4: Delight  — referral_generated
CREATE TABLE IF NOT EXISTS flywheel_events (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id     UUID        REFERENCES leads(id) ON DELETE SET NULL,
  event_type  TEXT        NOT NULL,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ──────────────────────────────────────

-- Profiles: each user sees only their own row (directors can also see their agents)
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE flywheel_events ENABLE ROW LEVEL SECURITY;

-- Own profile
CREATE POLICY "Own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Director reads agent profiles in their region
CREATE POLICY "Director reads agents" ON profiles
  FOR SELECT USING (
    director_id = auth.uid() OR auth.uid() = id
  );

-- Agents: manage own leads
CREATE POLICY "Agent manages own leads" ON leads
  FOR ALL USING (agent_id = auth.uid());

-- Directors: read leads of their agents
CREATE POLICY "Director reads team leads" ON leads
  FOR SELECT USING (
    agent_id IN (
      SELECT id FROM profiles WHERE director_id = auth.uid()
    )
  );

-- Agents: manage own events
CREATE POLICY "Agent manages own events" ON flywheel_events
  FOR ALL USING (agent_id = auth.uid());

-- Agents: manage own subscription
CREATE POLICY "Agent manages own subscription" ON subscriptions
  FOR ALL USING (agent_id = auth.uid());

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_agent_id       ON leads (agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_status         ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_opted_in_at    ON leads (opted_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_flywheel_stage ON leads (flywheel_stage);
CREATE INDEX IF NOT EXISTS idx_events_agent_id      ON flywheel_events (agent_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at    ON flywheel_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_slug        ON profiles (agent_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_director    ON profiles (director_id);

-- ── Helper: auto-create profile on signup ───────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
