import OpenAI from 'openai';
import type { LeadScoringInput, LeadScore, LeadStatus } from '@/types';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const LOCALE_NAME: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  tl: 'Tagalog',
};

/** Score a lead using GPT-4o and return a readiness category + recommended action. */
export async function calculateLeadScore(input: LeadScoringInput): Promise<LeadScore> {
  // Development fallback — no API call needed
  if (!process.env.OPENAI_API_KEY) {
    return devFallback(input);
  }

  const prompt = `
You are an Agara Life wellness distributor assistant. Analyze this prospective member:

- Interests: ${input.answers.join(', ')}
- Time spent on page: ${input.timeOnPage} seconds
- Language: ${LOCALE_NAME[input.language] ?? input.language}
- Greeted as: ${input.personaSelected}

Assign a readiness score from 0–100 and write a one-sentence recommended next action for the distributor IN ${LOCALE_NAME[input.language] ?? 'English'}.

Rules:
- Score 76–100: Hot (ready for a personal conversation or business presentation)
- Score 41–75:  Warm (send the wellness blueprint, follow up in 24 hours)
- Score 0–40:   Cold (nurture with educational content)

Respond ONLY with valid JSON: { "score": number, "category": "Hot"|"Warm"|"Cold", "action": "string" }
  `.trim();

  try {
    const response = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 150,
    });

    const raw = JSON.parse(response.choices[0].message.content ?? '{}');
    const score: number    = Math.max(0, Math.min(100, Number(raw.score) || 0));
    const category: LeadStatus = raw.category === 'Hot' ? 'Hot' : raw.category === 'Warm' ? 'Warm' : 'Cold';

    return { score, category, recommendedAction: raw.action ?? '' };
  } catch (err) {
    console.error('[AI Engine] Lead scoring failed, using fallback:', err);
    return devFallback(input);
  }
}

/** Heuristic fallback for local development. */
function devFallback(input: LeadScoringInput): LeadScore {
  let score = 30;
  if (input.answers.includes('Business'))    score += 30;
  if (input.answers.includes('Longevity'))   score += 10;
  if (input.timeOnPage < 60)                 score += 20;
  if (input.timeOnPage < 30)                 score += 10;
  score = Math.min(100, score);

  const category: LeadStatus =
    score > 75 ? 'Hot' : score > 40 ? 'Warm' : 'Cold';

  const actions: Record<LeadStatus, string> = {
    Hot:  'Call immediately — this person is ready for the Agara business conversation.',
    Warm: 'Send the wellness blueprint and follow up within 24 hours.',
    Cold: 'Share the Agara wellness guide and check in next week.',
  };

  return { score, category, recommendedAction: actions[category] };
}
