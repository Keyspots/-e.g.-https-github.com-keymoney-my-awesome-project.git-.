import type { Lead, Profile, GreetingPersona } from '@/types';

const GREETINGS: Record<GreetingPersona, string> = {
  Aloha:   'Aloha',
  Hola:    'Hola',
  Kumusta: 'Kumusta',
  Hello:   'Hello',
};

const SIGN_OFFS: Record<GreetingPersona, string> = {
  Aloha:   'A hui hou (Until we meet again)',
  Hola:    'Hasta pronto (See you soon)',
  Kumusta: 'Hanggang sa muli (Until next time)',
  Hello:   'Talk soon',
};

/**
 * Generate the island-inspired follow-up email after a lead opts in.
 * Returns an HTML string ready to send via your email provider.
 */
export function generateAlohaEmail(lead: Lead, agent: Profile): string {
  const persona = agent.greeting_preference ?? 'Aloha';
  const greeting  = GREETINGS[persona];
  const signOff   = SIGN_OFFS[persona];
  const leadName  = lead.full_name ?? 'Friend';
  const agentName = agent.full_name ?? 'Your Agara Guide';
  const agentSlug = agent.agent_slug ?? 'agent';
  const shopUrl   = `https://agaralife.com/shop/${agentSlug}`;
  const whatsapp  = agent.greeting_preference === 'Aloha' ? '+1-808-XXX-XXXX' : '+63-XXX-XXX-XXXX';

  const interests = lead.metadata?.answers?.filter(Boolean).join(', ') ?? 'your wellness goals';
  const product   = lead.metadata?.interested_product ?? 'our core wellness range';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Wellness Blueprint from Agara Life</title>
</head>
<body style="margin:0; padding:0; background:#F8F9FA; font-family: 'Segoe UI', sans-serif;">
  <div style="max-width:600px; margin:0 auto; background:#FFFFFF; border-radius:16px; overflow:hidden; margin-top:24px; box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #2D6A4F, #40916C); padding:36px 32px; text-align:center;">
      <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.15); border-radius:24px; padding:6px 16px; margin-bottom:16px;">
        <span style="color:#D4AF37; font-size:14px;">🌿</span>
        <span style="color:#B7E4C7; font-size:12px; font-weight:600; letter-spacing:0.05em;">AGARA LIFE</span>
      </div>
      <h1 style="color:#FFFFFF; font-size:24px; font-weight:800; margin:0; line-height:1.3;">
        ${greeting}, ${leadName}! 🌴
      </h1>
      <p style="color:#B7E4C7; margin:8px 0 0; font-size:14px;">
        Your personal wellness blueprint is ready.
      </p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#1B3A2F; font-size:15px; line-height:1.7; margin:0 0 16px;">
        I'm <strong>${agentName}</strong>, and I'm genuinely glad you took this step.
        As we say in the islands, <em>"E Malama Pono"</em> — take good care of yourself.
        That is exactly what we are here to help you do.
      </p>

      <p style="color:#1B3A2F; font-size:15px; line-height:1.7; margin:0 0 16px;">
        Based on what you shared about <strong>${interests}</strong>, I have attached a
        personal blueprint to get you started. You will also find some notes on
        <strong>${product}</strong> that many people in our community find helpful.
      </p>

      <!-- CTA -->
      <div style="text-align:center; margin:32px 0;">
        <a href="${shopUrl}" style="
          display:inline-block;
          background:#D4AF37;
          color:#1B3A2F;
          font-weight:700;
          font-size:14px;
          padding:14px 32px;
          border-radius:12px;
          text-decoration:none;
          letter-spacing:0.02em;
        ">
          🌿 Visit My Agara Page
        </a>
      </div>

      <p style="color:#1B3A2F; font-size:15px; line-height:1.7; margin:0 0 8px;">
        I would love to have a real conversation about how this can fit into your daily life.
        No pressure — just a genuine talk between two people who care about feeling their best.
      </p>

      <p style="color:#6B7280; font-size:13px; margin:0 0 24px;">
        💬 WhatsApp me directly: <a href="https://wa.me/${whatsapp.replace(/\D/g,'')}" style="color:#2D6A4F;">${whatsapp}</a>
      </p>

      <!-- Sign-off -->
      <p style="color:#1B3A2F; font-size:15px; margin:0; border-top:1px solid #E5E7EB; padding-top:24px;">
        ${signOff},<br />
        <strong>${agentName}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#F8F9FA; padding:20px 32px; text-align:center; border-top:1px solid #E5E7EB;">
      <p style="color:#9CA3AF; font-size:11px; margin:0;">
        You received this because you requested a wellness blueprint at
        agaralife.com/distributor/${agentSlug}.<br />
        Distributed by ${agentName} &bull; ${agent.region ?? 'Independent Distributor'}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
