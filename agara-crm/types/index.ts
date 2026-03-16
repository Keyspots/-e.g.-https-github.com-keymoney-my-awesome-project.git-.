export type LeadStatus = 'Hot' | 'Warm' | 'Cold';
export type UserRole = 'agent' | 'regional_director';
export type FlywheelStage = 1 | 2 | 3 | 4;
export type FlywheelEventType = 'opt_in' | 'pdf_download' | 'email_open' | 'conversion';
export type Locale = 'en' | 'es' | 'tl';
export type GreetingPersona = 'Aloha' | 'Hola' | 'Kumusta' | 'Hello';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  photo_url: string | null;
  agent_slug: string | null;
  region: string | null;
  director_id: string | null;
  greeting_preference: GreetingPersona;
  created_at: string;
}

export interface Lead {
  id: string;
  agent_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: LeadStatus;
  ai_score: number;          // 0.0–1.0
  flywheel_stage: FlywheelStage;
  opted_in_at: string;
  last_interaction: string;
  source: string;
  metadata: {
    answers?: string[];
    language?: Locale;
    time_on_page?: number;
    persona_selected?: GreetingPersona;
    interested_product?: string;
    referral_source?: string;
  };
}

export interface FlywheelEvent {
  id: string;
  agent_id: string;
  lead_id: string | null;
  event_type: FlywheelEventType;
  created_at: string;
}

export interface LeadScoringInput {
  answers: string[];
  language: Locale;
  timeOnPage: number;
  personaSelected: GreetingPersona;
}

export interface LeadScore {
  score: number;             // 0–100
  category: LeadStatus;
  recommendedAction: string; // In lead's language
}

export interface AgentStats {
  totalLeads: number;
  hotLeads: number;
  connectionRate: number;    // 0–1
  velocityScore: number;     // 0–100
  leadsLast30Days: { date: string; count: number }[];
  flywheelStages: { stage: FlywheelStage; name: string; count: number }[];
}

export interface RegionStats {
  region: string;
  agentCount: number;
  totalLeads: number;
  conversionRate: number;   // 0–1
  topLanguage: string;
  momentumScore: number;
  flywheelStatus: 'Hot' | 'Accelerating' | 'Steady' | 'Growing';
  topAgent: string;
}
