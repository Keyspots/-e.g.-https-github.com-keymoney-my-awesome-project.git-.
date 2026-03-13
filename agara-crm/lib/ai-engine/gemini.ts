import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Lead, Profile } from '@/types';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
  }
  return client;
}

/**
 * Generate a personalized wellness blueprint for a lead.
 * Returns a markdown string suitable for rendering as a PDF.
 * In production, pipe this through a PDF renderer (e.g., Puppeteer or @react-pdf/renderer).
 */
export async function generateWellnessBlueprint(
  lead: Lead,
  agent: Profile,
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return devFallback(lead, agent);
  }

  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-pro' });

  const interests = lead.metadata?.answers?.join(', ') ?? 'general wellness';
  const agentName = agent.full_name ?? 'your Agara distributor';
  const greeting  = agent.greeting_preference ?? 'Aloha';
  const salutation =
    greeting === 'Hola'    ? 'Hola' :
    greeting === 'Kumusta' ? 'Kumusta' :
    greeting === 'Hello'   ? 'Hello' : 'Aloha';

  const prompt = `
You are a wellness consultant for Agara Life, a natural health and wellness company.
Create a personalized wellness blueprint for ${lead.full_name ?? 'this person'} who is interested in: ${interests}.

The blueprint should:
1. Open with a warm ${salutation} greeting from ${agentName}
2. Include 3–4 personalized wellness recommendations tied to their interests
3. Mention 1–2 relevant Agara Life product categories (without exaggerating claims)
4. Close with a warm invitation to connect with ${agentName} directly
5. Include the tagline: "E Malama Pono — Take Good Care of Yourself" at the end
6. Be warm, clear, and encouraging. Avoid clinical language.

Format as clean markdown with headers. Keep it to 400 words or less.
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('[AI Engine] Blueprint generation failed, using fallback:', err);
    return devFallback(lead, agent);
  }
}

function devFallback(lead: Lead, agent: Profile): string {
  return `
# Your Personal Wellness Blueprint

Aloha, ${lead.full_name ?? 'Friend'}! 🌴

I'm ${agent.full_name ?? 'your Agara guide'}, and I'm honored you took the first step.

## Your Starting Point

Based on what you shared, here are three simple things to focus on this month:

1. **Consistent hydration** — Aim for 8 glasses of clean water daily. Small habit, big difference.
2. **Nutrient-dense morning meals** — Start each day with whole foods that fuel sustained energy.
3. **Gentle movement** — 20 minutes of walking daily supports both body and mind.

## Where Agara Life Fits

Our plant-based wellness products are designed to complement a natural lifestyle. Many of our community members combine daily supplements with the habits above and notice meaningful changes within weeks.

## Let's Talk

I'd love to walk you through what might work best for *your* specific goals.

📱 Reach me directly: [Your WhatsApp link here]

---

*E Malama Pono — Take Good Care of Yourself.*

With aloha,
${agent.full_name ?? 'Your Agara Guide'}
  `.trim();
}
